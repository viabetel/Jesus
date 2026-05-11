import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth/admin"
import { getProductById } from "@/lib/services/products-repo"
import { getProductStockBalances } from "@/lib/services/stock-balance"

type Ctx = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/products/[id]/stock
 * Retorna saldo de estoque detalhado (cadastrado/reservado/consumido/disponível)
 * para cada variante do produto.
 */
export async function GET(request: Request, { params }: Ctx) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 })

  try {
    const balances = await getProductStockBalances(
      product.variants.map(v => ({ sku: v.sku, stock: v.stock }))
    )
    return NextResponse.json({ productId: id, balances })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    )
  }
}
