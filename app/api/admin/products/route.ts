import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth/admin"
import {
  getAllProducts,
  createProduct,
  type ProductInput,
} from "@/lib/services/products-repo"
import { getSupabase } from "@/lib/supabase"

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
    
    // Enrich with cover images from product_media table
    const sb = getSupabase()
    if (sb && products.length > 0) {
      const ids = products.map(p => p.id)
      const { data: covers } = await sb
        .from("product_media")
        .select("product_id, url, role")
        .in("product_id", ids)
        .eq("kind", "image")
        .in("role", ["cover", "gallery"])
        .order("role")
        .order("sort_order")
      
      if (covers && covers.length > 0) {
        // Map: productId → first cover URL (or first gallery if no cover)
        const coverMap = new Map<string, string>()
        for (const row of covers) {
          const pid = String(row.product_id)
          if (!coverMap.has(pid)) {
            coverMap.set(pid, String(row.url))
          } else if (row.role === "cover") {
            // Cover overrides gallery
            coverMap.set(pid, String(row.url))
          }
        }
        // Attach coverImage to each product
        const enriched = products.map(p => ({
          ...p,
          coverImage: coverMap.get(p.id) || null,
        }))
        return NextResponse.json(enriched)
      }
    }

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
