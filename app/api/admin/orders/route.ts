import { NextResponse } from "next/server"
import {
  getOrders,
  createOrder,
  updateOrderStatus,
  type OrderStatus,
  type CreateOrderInput,
} from "@/lib/services/orders"
import { isAdminAuthenticated } from "@/lib/auth/admin"

/**
 * GET   → admin lista pedidos (REQUER cookie fs_admin)
 * PATCH → admin atualiza status (REQUER cookie fs_admin)
 * POST  → cliente cria pedido (PÚBLICO — necessário pro checkout)
 *
 * Atenção sobre POST:
 *  - Aceita SOMENTE: customerName, customerWhatsapp, customerEmail,
 *    items: [{ productId, variantSku, quantity }], address?, observation?.
 *  - Preço e total são RECALCULADOS no servidor a partir de products.ts.
 *  - Estoque é validado contra reservas ativas no Supabase.
 */

export async function GET(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  try {
    const orders = await getOrders()
    return NextResponse.json(orders)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao listar pedidos." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 })
  }

  // Type guard inicial — apenas estrutura básica. O service revalida tudo.
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 })
  }
  const b = body as Record<string, unknown>
  const items = Array.isArray(b.items) ? b.items : []

  // Sanitização de items: aceitamos APENAS os campos permitidos.
  // Se o cliente mandar price/total/productName etc, tudo é descartado aqui.
  const safeItems: CreateOrderInput["items"] = []
  for (const raw of items) {
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Item inválido." }, { status: 400 })
    }
    const r = raw as Record<string, unknown>
    const productId = typeof r.productId === "string" ? r.productId : null
    const variantSku = typeof r.variantSku === "string" ? r.variantSku : null
    const quantity = typeof r.quantity === "number" ? r.quantity : NaN
    if (!productId || !variantSku || !Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: "Item precisa de productId, variantSku e quantity ≥ 1." },
        { status: 400 }
      )
    }
    safeItems.push({ productId, variantSku, quantity: Math.floor(quantity) })
  }

  const input: CreateOrderInput = {
    customerName: typeof b.customerName === "string" ? b.customerName : "",
    customerWhatsapp: typeof b.customerWhatsapp === "string" ? b.customerWhatsapp : "",
    customerEmail: typeof b.customerEmail === "string" ? b.customerEmail : "",
    items: safeItems,
    address: typeof b.address === "string" ? b.address : undefined,
    observation: typeof b.observation === "string" ? b.observation : undefined,
  }

  try {
    const result = await createOrder(input)
    if (!result.ok) {
      const err = result.error
      // Mapeamento de códigos para HTTP status
      const status =
        err.code === "INVALID_INPUT" ? 400
          : err.code === "PRODUCT_NOT_FOUND" || err.code === "VARIANT_NOT_FOUND" ? 404
          : err.code === "INSUFFICIENT_STOCK" ? 409
          : 500
      return NextResponse.json({ error: err }, { status })
    }
    return NextResponse.json(result.order, { status: 201 })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao criar pedido." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  try {
    const { orderId, status } = (await request.json()) as { orderId?: string; status?: OrderStatus }
    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId e status são obrigatórios." }, { status: 400 })
    }
    const validStatuses: OrderStatus[] = ["recebido", "confirmado", "enviado", "entregue", "cancelado"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 })
    }
    const updated = await updateOrderStatus(orderId, status)
    if (!updated) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao atualizar." },
      { status: 500 }
    )
  }
}
