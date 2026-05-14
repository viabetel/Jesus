import { NextResponse } from "next/server"
import { getPublicProducts } from "@/lib/services/public-catalog"
import { getProductById } from "@/lib/services/products-repo"
import { resolveProductCover } from "@/lib/services/cover-resolver"

/**
 * GET /api/products — produtos ativos com mídia enriquecida
 * GET /api/products?ids=id1,id2 — produtos específicos por ID (para favoritos)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const idsParam = searchParams.get("ids")

  try {
    if (idsParam) {
      // Fetch specific products by IDs (for favorites)
      const ids = idsParam.split(",").filter(Boolean).slice(0, 50)
      const results = await Promise.all(
        ids.map(async (id) => {
          const p = await getProductById(id)
          if (!p || p.status !== "ativo") return null
          const cover = await resolveProductCover(id, p.images)
          return {
            id: p.id, name: p.name, slug: p.slug, category: p.category,
            price: p.price, originalPrice: p.originalPrice,
            coverImage: cover.url,
            images: p.images, badge: p.badge, tags: p.tags,
            variants: p.variants, isNew: p.isNew, isPromotion: p.isPromotion,
            isBestseller: p.isBestseller, description: p.description,
            status: p.status,
          }
        })
      )
      return NextResponse.json(results.filter(Boolean))
    }

    // Full catalog
    const products = await getPublicProducts()
    const light = products.map(p => ({
      id: p.id, name: p.name, slug: p.slug, category: p.category,
      price: p.price, originalPrice: p.originalPrice,
      coverImage: p.coverImage,
      hoverImage: p.hoverImage,
      images: p.images.slice(0, 3),
      badge: p.badge, tags: p.tags,
    }))
    return NextResponse.json(light, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" }
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido"
    console.error("[API/products] Erro:", msg)
    return NextResponse.json(
      { error: "Erro ao carregar catálogo.", detail: msg },
      { status: 500 }
    )
  }
}
