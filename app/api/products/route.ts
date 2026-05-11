import { NextResponse } from "next/server"
import { getAllProducts } from "@/lib/services/products-repo"

// Public endpoint — returns active products with minimal data for search/listing
export async function GET() {
  try {
    const products = await getAllProducts()
    // Return only necessary fields to keep response light
    const light = products.map(p => ({
      id: p.id, name: p.name, slug: p.slug, category: p.category,
      price: p.price, originalPrice: p.originalPrice,
      images: p.images.slice(0, 2), badge: p.badge,
      tags: p.tags,
    }))
    return NextResponse.json(light, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" }
    })
  } catch (e) {
    return NextResponse.json([], { status: 200 })
  }
}
