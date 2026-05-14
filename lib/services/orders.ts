/**
 * Orders Service — Supabase obrigatório. Fallback in-memory só com ALLOW_LOCAL_FALLBACK=true.
 *
 * IMPORTANTE:
 *  - Preço, total, nome, cor, tamanho NUNCA são confiáveis no payload do
 *    cliente. Esta camada recebe APENAS productId + variantSku + quantity e
 *    recalcula tudo lendo do Supabase via products-repo (fonte de verdade).
 *  - Estoque é validado contra a soma de reservas ativas. Se não couber, o
 *    pedido é recusado.
 *  - Quando o pedido é criado, reservas são lançadas (state=reserved).
 *    Quando vira "entregue", viram consumed. Quando "cancelado", released.
 */

import type { Product, ProductVariant } from "@/lib/data/products"
import { getProductById } from "@/lib/services/products-repo"
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase"
import { canUseMemoryFallback } from "@/lib/env"

// ===== Tipos =====

export type OrderStatus = "recebido" | "confirmado" | "enviado" | "entregue" | "cancelado"

export interface OrderItem {
  productId: string
  productName: string
  sku: string             // SKU da variante
  size: string
  color: string
  quantity: number
  price: number           // calculado pelo servidor
  lineTotal: number       // quantity * price
}

export interface Order {
  id: string
  number: string
  customerName: string
  customerWhatsapp: string
  customerEmail: string
  items: OrderItem[]
  subtotal: number
  total: number
  status: OrderStatus
  address?: string
  observation?: string
  createdAt: string
  updatedAt: string
}

/** Input do cliente — só productId + variantSku + quantity. */
export interface OrderItemInput {
  productId: string
  variantSku: string
  quantity: number
}

export interface CreateOrderInput {
  customerName: string
  customerWhatsapp: string
  customerEmail: string
  items: OrderItemInput[]
  address?: string
  observation?: string
  userId?: string
}

export type CreateOrderError =
  | { code: "INVALID_INPUT"; message: string }
  | { code: "PRODUCT_NOT_FOUND"; sku: string }
  | { code: "VARIANT_NOT_FOUND"; sku: string }
  | { code: "INSUFFICIENT_STOCK"; sku: string; available: number; requested: number }
  | { code: "DB_ERROR"; message: string }

export type CreateOrderResult =
  | { ok: true; order: Order }
  | { ok: false; error: CreateOrderError }

// ===== Resolução de variante (server-side) =====

async function findProductVariant(
  productId: string,
  variantSku: string
): Promise<{ product: Product; variant: ProductVariant } | null> {
  const product = await getProductById(productId)
  if (!product) return null
  const variant = product.variants.find((v) => v.sku === variantSku && v.active)
  if (!variant) return null
  return { product, variant }
}

// ===== Estoque consumido =====

async function getConsumedStock(variantSku: string): Promise<number> {
  const sb = getSupabase()
  if (!sb) {
    if (!canUseMemoryFallback()) return 0
    // Modo dev sem Supabase: estoque consumido é o que está em memória
    return memoryReservations
      .filter((r) => r.variant_sku === variantSku && r.state !== "released")
      .reduce((s, r) => s + r.quantity, 0)
  }
  const { data, error } = await sb.rpc("consumed_stock", { p_sku: variantSku })
  if (error) throw new Error(`consumed_stock RPC: ${error.message}`)
  return Number(data ?? 0)
}

async function getAvailableStock(variant: ProductVariant): Promise<number> {
  const consumed = await getConsumedStock(variant.sku)
  return Math.max(0, variant.stock - consumed)
}

export async function getVariantAvailableStock(productId: string, variantSku: string): Promise<number> {
  const found = await findProductVariant(productId, variantSku)
  if (!found) return 0
  return getAvailableStock(found.variant)
}

// ===== Fallback in-memory (apenas para dev local sem Supabase) =====

interface MemoryOrder {
  id: string
  number: string
  customer_name: string
  customer_whatsapp: string
  customer_email: string
  items: OrderItem[]
  subtotal: number
  total: number
  status: OrderStatus
  address: string | null
  observation: string | null
  created_at: string
  updated_at: string
}

interface MemoryReservation {
  order_id: string
  variant_sku: string
  quantity: number
  state: "reserved" | "consumed" | "released"
}

const memoryOrders: MemoryOrder[] = []
const memoryReservations: MemoryReservation[] = []
let memoryCounter = 1000

// ===== Mapeamento DB ↔ domínio =====

function rowToOrder(row: MemoryOrder | Record<string, unknown>): Order {
  const r = row as Record<string, unknown>
  return {
    id: String(r.id),
    number: String(r.number),
    customerName: String(r.customer_name),
    customerWhatsapp: String(r.customer_whatsapp),
    customerEmail: String(r.customer_email),
    items: r.items as OrderItem[],
    subtotal: Number(r.subtotal),
    total: Number(r.total),
    status: r.status as OrderStatus,
    address: (r.address as string) ?? undefined,
    observation: (r.observation as string) ?? undefined,
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  }
}

// ===== API =====

export async function getOrders(): Promise<Order[]> {
  const sb = getSupabase()
  if (!sb) {
    if (!canUseMemoryFallback()) throw new Error("Supabase obrigatório para listar pedidos.")
    return [...memoryOrders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(rowToOrder)
  }
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500)
  if (error) throw new Error(`Supabase getOrders: ${error.message}`)
  return (data ?? []).map(rowToOrder)
}

export async function getOrderById(id: string): Promise<Order | null> {
  const sb = getSupabase()
  if (!sb) {
    if (!canUseMemoryFallback()) throw new Error("Supabase obrigatório.")
    const o = memoryOrders.find((m) => m.id === id)
    return o ? rowToOrder(o) : null
  }
  const { data, error } = await sb.from("orders").select("*").eq("id", id).maybeSingle()
  if (error) throw new Error(`Supabase getOrderById: ${error.message}`)
  return data ? rowToOrder(data) : null
}

/**
 * Cria um pedido. Recalcula tudo no servidor — não confia no cliente.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  // Validação básica
  const name = input.customerName?.trim() ?? ""
  const whatsapp = input.customerWhatsapp?.trim() ?? ""
  const email = input.customerEmail?.trim() ?? ""
  if (name.length < 2) return { ok: false, error: { code: "INVALID_INPUT", message: "Nome inválido." } }
  if (whatsapp.replace(/\D/g, "").length < 10)
    return { ok: false, error: { code: "INVALID_INPUT", message: "WhatsApp inválido." } }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: { code: "INVALID_INPUT", message: "E-mail inválido." } }
  if (!Array.isArray(input.items) || input.items.length === 0)
    return { ok: false, error: { code: "INVALID_INPUT", message: "Pedido sem itens." } }

  // Resolução server-side de cada item
  const resolvedItems: OrderItem[] = []
  for (const it of input.items) {
    if (!it || typeof it.quantity !== "number" || it.quantity < 1) {
      return { ok: false, error: { code: "INVALID_INPUT", message: "Item com quantidade inválida." } }
    }
    const found = await findProductVariant(it.productId, it.variantSku)
    if (!found) {
      // Check if the product exists but variant doesn't
      const product = await getProductById(it.productId)
      return {
        ok: false,
        error: product
          ? { code: "VARIANT_NOT_FOUND" as const, sku: it.variantSku }
          : { code: "PRODUCT_NOT_FOUND" as const, sku: it.variantSku },
      }
    }
    const { product, variant } = found

    // Checagem de estoque com reservas
    const available = await getAvailableStock(variant)
    if (it.quantity > available) {
      return {
        ok: false,
        error: {
          code: "INSUFFICIENT_STOCK",
          sku: variant.sku,
          available,
          requested: it.quantity,
        },
      }
    }

    const lineTotal = round2(product.price * it.quantity)
    resolvedItems.push({
      productId: product.id,
      productName: product.name,
      sku: variant.sku,
      size: variant.size,
      color: variant.colorName,
      quantity: it.quantity,
      price: product.price,
      lineTotal,
    })
  }

  const subtotal = round2(resolvedItems.reduce((s, i) => s + i.lineTotal, 0))
  const total = subtotal // sem frete/desconto por enquanto — fica explícito

  if (subtotal <= 0) {
    return { ok: false, error: { code: "INVALID_INPUT", message: "Total inválido." } }
  }

  // Persistência
  const sb = getSupabase()
  if (!sb) {
    if (!canUseMemoryFallback()) {
      return { ok: false, error: { code: "DB_ERROR", message: "Supabase obrigatório para criar pedidos." } as CreateOrderError }
    }
    return createOrderInMemory(input, resolvedItems, subtotal, total, name, whatsapp, email)
  }
  return createOrderInSupabase(sb, input, resolvedItems, subtotal, total, name, whatsapp, email)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

async function createOrderInSupabase(
  sb: ReturnType<typeof getSupabase> & object,
  input: CreateOrderInput,
  items: OrderItem[],
  subtotal: number,
  total: number,
  name: string,
  whatsapp: string,
  email: string
): Promise<CreateOrderResult> {
  // Pega próximo número da sequência via RPC dedicada
  const { data: numData, error: numErr } = await sb.rpc("next_order_number")
  let orderNumber: number
  if (numErr || numData == null) {
    // Fallback caso a RPC não exista (ambiente novo): timestamp.
    // Isso garante unicidade mas perde a numeração sequencial bonita.
    orderNumber = Math.floor(Date.now() / 1000)
  } else {
    orderNumber = Number(numData)
  }
  const id = `ord_${orderNumber}`
  const number = `FS-${orderNumber}`
  const now = new Date().toISOString()

  // Insere o pedido
  const { data: orderRow, error: insertErr } = await sb
    .from("orders")
    .insert({
      id,
      number,
      customer_name: name,
      customer_whatsapp: whatsapp,
      customer_email: email,
      items,
      subtotal,
      total,
      status: "recebido",
      address: input.address?.trim() || null,
      observation: input.observation?.trim() || null,
      user_id: input.userId || null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (insertErr || !orderRow) {
    return { ok: false, error: { code: "DB_ERROR", message: insertErr?.message ?? "Falha ao gravar pedido." } }
  }

  // Lança reservas de estoque
  const reservations = items.map((i) => ({
    order_id: id,
    variant_sku: i.sku,
    quantity: i.quantity,
    state: "reserved" as const,
  }))
  const { error: resErr } = await sb.from("stock_reservations").insert(reservations)
  if (resErr) {
    // Tenta reverter o pedido pra não ficar inconsistente
    await sb.from("orders").delete().eq("id", id)
    return { ok: false, error: { code: "DB_ERROR", message: `Falha ao reservar estoque: ${resErr.message}` } }
  }

  return { ok: true, order: rowToOrder(orderRow) }
}

function createOrderInMemory(
  input: CreateOrderInput,
  items: OrderItem[],
  subtotal: number,
  total: number,
  name: string,
  whatsapp: string,
  email: string
): CreateOrderResult {
  memoryCounter += 1
  const id = `ord_${memoryCounter}`
  const number = `FS-${memoryCounter}`
  const now = new Date().toISOString()
  const order: MemoryOrder = {
    id,
    number,
    customer_name: name,
    customer_whatsapp: whatsapp,
    customer_email: email,
    items,
    subtotal,
    total,
    status: "recebido",
    address: input.address?.trim() || null,
    observation: input.observation?.trim() || null,
    created_at: now,
    updated_at: now,
  }
  memoryOrders.push(order)
  for (const i of items) {
    memoryReservations.push({
      order_id: id,
      variant_sku: i.sku,
      quantity: i.quantity,
      state: "reserved",
    })
  }
  return { ok: true, order: rowToOrder(order) }
}

/**
 * Atualiza status do pedido. Quando vira "cancelado" libera reservas;
 * quando vira "entregue" consome reservas; outros estados mantêm reservado.
 */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  const sb = getSupabase()
  const now = new Date().toISOString()

  if (!sb) {
    if (!canUseMemoryFallback()) throw new Error("Supabase obrigatório para atualizar pedido.")
    const o = memoryOrders.find((m) => m.id === id)
    if (!o) return null
    o.status = status
    o.updated_at = now
    if (status === "cancelado") {
      memoryReservations.forEach((r) => { if (r.order_id === id && r.state === "reserved") r.state = "released" })
    } else if (status === "entregue") {
      memoryReservations.forEach((r) => { if (r.order_id === id && r.state === "reserved") r.state = "consumed" })
    }
    return rowToOrder(o)
  }

  const { data, error } = await sb
    .from("orders")
    .update({ status, updated_at: now })
    .eq("id", id)
    .select()
    .maybeSingle()
  if (error) throw new Error(`Supabase updateOrderStatus: ${error.message}`)
  if (!data) return null

  if (status === "cancelado") {
    await sb
      .from("stock_reservations")
      .update({ state: "released" })
      .eq("order_id", id)
      .eq("state", "reserved")
  } else if (status === "entregue") {
    await sb
      .from("stock_reservations")
      .update({ state: "consumed" })
      .eq("order_id", id)
      .eq("state", "reserved")
  }

  return rowToOrder(data)
}

export { isSupabaseConfigured }
