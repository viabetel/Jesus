import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth/admin"
import {
  getAllProducts,
  createProduct,
  type ProductInput,
} from "@/lib/services/products-repo"

/**
 * GET /api/admin/products → lista TODOS (inclui rascunho/oculto)
 * POST /api/admin/products → cria produto
 */

export async function GET(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  try {
    const products = await getAllProducts({ includeAll: true })
    return NextResponse.json(products)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao listar." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 })
  }

  // Sanitização básica de campos
  const b = (body as Partial<ProductInput>) ?? {}
  const input: ProductInput = {
    slug: typeof b.slug === "string" ? b.slug.trim() : "",
    sku: typeof b.sku === "string" ? b.sku.trim() : "",
    name: typeof b.name === "string" ? b.name.trim() : "",
    category: (b.category ?? "Camisetas") as ProductInput["category"],
    status: b.status,
    price: typeof b.price === "number" ? b.price : NaN,
    originalPrice: b.originalPrice ?? null,
    badge: b.badge ?? null,
    description: typeof b.description === "string" ? b.description : "",
    details: Array.isArray(b.details) ? b.details : [],
    images: Array.isArray(b.images) ? b.images : [],
    video: b.video ?? null,
    isNew: !!b.isNew,
    isPromotion: !!b.isPromotion,
    isBestseller: !!b.isBestseller,
    tags: Array.isArray(b.tags) ? b.tags : [],
    sortOrder: typeof b.sortOrder === "number" ? b.sortOrder : 0,
    composition: typeof b.composition === "string" ? b.composition : null,
    fit: typeof b.fit === "string" ? b.fit : null,
    care: Array.isArray(b.care) ? b.care : null,
    sizeGuide: Array.isArray(b.sizeGuide) ? b.sizeGuide : null,
  }

  const result = await createProduct(input)
  if (!result.ok) {
    const status =
      result.error.code === "DUP_SLUG" || result.error.code === "DUP_SKU"
        ? 409
        : result.error.code === "INVALID"
        ? 400
        : result.error.code === "NO_DB"
        ? 503
        : 500
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json(result.data, { status: 201 })
}
