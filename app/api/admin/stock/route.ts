import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth/admin"
import { getSupabase } from "@/lib/supabase"
import { getAllProducts } from "@/lib/services/products-repo"

/**
 * GET /api/admin/stock
 * Retorna estoque detalhado: cadastrado, reservado, consumido, disponível
 * por variante.
 */
export async function GET(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  const sb = getSupabase()
  const products = await getAllProducts({ includeAll: true })

  // Se não tem Supabase, retorna o que temos estaticamente (reservado/consumido = 0)
  if (!sb) {
    const result = products.flatMap(p =>
      p.variants.map(v => ({
        productId: p.id,
        productName: p.name,
        sku: v.sku,
        colorName: v.colorName,
        size: v.size,
        registered: v.stock,
        reserved: 0,
        consumed: 0,
        available: v.stock,
        active: v.active,
      }))
    )
    return NextResponse.json(result)
  }

  // Com Supabase, agregar stock_reservations
  const { data: reservations, error } = await sb
    .from("stock_reservations")
    .select("variant_sku, quantity, state")
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Agregar por SKU
  const reservedMap = new Map<string, number>()
  const consumedMap = new Map<string, number>()
  for (const r of reservations ?? []) {
    if (r.state === "reserved") {
      reservedMap.set(r.variant_sku, (reservedMap.get(r.variant_sku) ?? 0) + r.quantity)
    } else if (r.state === "consumed") {
      consumedMap.set(r.variant_sku, (consumedMap.get(r.variant_sku) ?? 0) + r.quantity)
    }
  }

  const result = products.flatMap(p =>
    p.variants.map(v => {
      const reserved = reservedMap.get(v.sku) ?? 0
      const consumed = consumedMap.get(v.sku) ?? 0
      return {
        productId: p.id,
        productName: p.name,
        sku: v.sku,
        colorName: v.colorName,
        size: v.size,
        registered: v.stock,
        reserved,
        consumed,
        available: Math.max(0, v.stock - reserved - consumed),
        active: v.active,
      }
    })
  )

  return NextResponse.json(result)
}
