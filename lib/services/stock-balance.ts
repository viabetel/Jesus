/**
 * Retorna o saldo de estoque detalhado de uma variante.
 * Usado no admin pra mostrar quanto está reservado/consumido/disponível.
 */

import { getSupabase } from "@/lib/supabase"

export type StockBalance = {
  sku: string
  /** Estoque cadastrado na variante */
  stock: number
  /** Reservado (pedido criado/confirmado mas não entregue) */
  reserved: number
  /** Consumido (pedido entregue) */
  consumed: number
  /** Disponível pra venda = stock - reserved - consumed */
  available: number
}

export async function getStockBalance(sku: string, stockCadastrado: number): Promise<StockBalance> {
  const sb = getSupabase()
  if (!sb) {
    // Dev: sem banco, tudo disponível
    return { sku, stock: stockCadastrado, reserved: 0, consumed: 0, available: stockCadastrado }
  }

  const { data, error } = await sb
    .from("stock_reservations")
    .select("state, quantity")
    .eq("variant_sku", sku)
    .in("state", ["reserved", "consumed"])

  if (error) throw new Error(`getStockBalance: ${error.message}`)

  let reserved = 0
  let consumed = 0
  for (const row of data ?? []) {
    if (row.state === "reserved") reserved += Number(row.quantity)
    if (row.state === "consumed") consumed += Number(row.quantity)
  }

  return {
    sku,
    stock: stockCadastrado,
    reserved,
    consumed,
    available: Math.max(0, stockCadastrado - reserved - consumed),
  }
}

/**
 * Retorna saldos de todas as variantes de um produto de uma vez.
 */
export async function getProductStockBalances(
  variants: Array<{ sku: string; stock: number }>
): Promise<StockBalance[]> {
  const sb = getSupabase()
  if (!sb) {
    return variants.map(v => ({ sku: v.sku, stock: v.stock, reserved: 0, consumed: 0, available: v.stock }))
  }

  const skus = variants.map(v => v.sku)
  const { data, error } = await sb
    .from("stock_reservations")
    .select("variant_sku, state, quantity")
    .in("variant_sku", skus)
    .in("state", ["reserved", "consumed"])

  if (error) throw new Error(`getProductStockBalances: ${error.message}`)

  const map = new Map<string, { reserved: number; consumed: number }>()
  for (const row of data ?? []) {
    const sku = String(row.variant_sku)
    const entry = map.get(sku) ?? { reserved: 0, consumed: 0 }
    if (row.state === "reserved") entry.reserved += Number(row.quantity)
    if (row.state === "consumed") entry.consumed += Number(row.quantity)
    map.set(sku, entry)
  }

  return variants.map(v => {
    const entry = map.get(v.sku) ?? { reserved: 0, consumed: 0 }
    return {
      sku: v.sku,
      stock: v.stock,
      reserved: entry.reserved,
      consumed: entry.consumed,
      available: Math.max(0, v.stock - entry.reserved - entry.consumed),
    }
  })
}
