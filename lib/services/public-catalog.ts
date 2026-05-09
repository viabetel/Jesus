/**
 * Public Catalog Service
 *
 * Enriches products with media from product_media table.
 * Used by public pages: home, /produtos, product cards.
 */

import type { Product } from "@/lib/data/products"
import { getTotalStock } from "@/lib/data/products"
import { getAllProducts, getProductBySlug as repoGetBySlug } from "./products-repo"
import { getProductMedia, type ProductMedia } from "./media-repo"
import { getSupabase } from "@/lib/supabase"

// DTO for public product display
export interface PublicProduct extends Product {
  coverImage: string | null
  hoverImage: string | null
  hasVideo: boolean
  mediaImages: string[] // ordered images from product_media
}

function enrichProduct(product: Product, media: ProductMedia[]): PublicProduct {
  const cover = media.find(m => m.role === "cover" && m.kind === "image")
  const hover = media.find(m => m.role === "hover" && m.kind === "image")
  const hasVideo = media.some(m => m.kind === "video")

  // Build ordered images: cover first, hover second, then rest
  const orderedImages: string[] = []
  if (cover) orderedImages.push(cover.url)
  else if (product.images[0]) orderedImages.push(product.images[0])

  if (hover) orderedImages.push(hover.url)
  else if (product.images[1]) orderedImages.push(product.images[1])

  const others = media
    .filter(m => m.kind === "image" && m.role !== "cover" && m.role !== "hover")
    .sort((a, b) => a.sortOrder - b.sortOrder)
  orderedImages.push(...others.map(m => m.url))

  // If no media at all, fall back to legacy images
  const finalImages = orderedImages.length > 0 ? orderedImages : product.images

  const videoMedia = media.find(m => m.kind === "video")

  return {
    ...product,
    coverImage: cover?.url ?? product.images[0] ?? null,
    hoverImage: hover?.url ?? product.images[1] ?? null,
    hasVideo: hasVideo || !!product.video,
    mediaImages: finalImages,
    images: finalImages,
    video: videoMedia?.url ?? product.video,
  }
}

/**
 * Get all active products with media enrichment.
 * Uses a single batch query for all product_media to avoid N+1.
 */
export async function getPublicProducts(): Promise<PublicProduct[]> {
  const products = await getAllProducts()

  const sb = getSupabase()
  if (!sb) {
    // Dev fallback — no media enrichment
    return products.map(p => enrichProduct(p, []))
  }

  // Batch fetch all media for active products
  const ids = products.map(p => p.id)
  if (ids.length === 0) return []

  const { data: allMedia, error } = await sb
    .from("product_media")
    .select("*")
    .in("product_id", ids)
    .order("sort_order")

  if (error) {
    console.error("getPublicProducts media:", error.message)
    return products.map(p => enrichProduct(p, []))
  }

  const mediaMap = new Map<string, ProductMedia[]>()
  for (const row of allMedia ?? []) {
    const pid = String(row.product_id)
    const existing = mediaMap.get(pid) ?? []
    existing.push({
      id: Number(row.id),
      productId: pid,
      url: String(row.url),
      storagePath: row.storage_path ? String(row.storage_path) : null,
      kind: row.kind as "image" | "video",
      role: row.role,
      alt: row.alt ? String(row.alt) : null,
      sortOrder: Number(row.sort_order ?? 0),
      width: row.width ? Number(row.width) : null,
      height: row.height ? Number(row.height) : null,
    })
    mediaMap.set(pid, existing)
  }

  return products.map(p => enrichProduct(p, mediaMap.get(p.id) ?? []))
}

/**
 * Get single product by slug with media enrichment (public — active only).
 */
export async function getPublicProductBySlug(slug: string): Promise<PublicProduct | null> {
  const product = await repoGetBySlug(slug)
  if (!product) return null
  if (product.status !== "ativo") return null

  const media = await getProductMedia(product.id).catch(() => [])
  return enrichProduct(product, media)
}

/**
 * Filter helpers for public products
 */
export function filterFeatured(products: PublicProduct[]): PublicProduct[] {
  return products.filter(p => p.isBestseller || p.isNew).slice(0, 4)
}

export function filterNew(products: PublicProduct[]): PublicProduct[] {
  return products.filter(p => p.isNew).slice(0, 4)
}

export function filterPromo(products: PublicProduct[]): PublicProduct[] {
  return products.filter(p => p.isPromotion)
}

export function filterLowStock(products: PublicProduct[]): PublicProduct[] {
  return products.filter(p => {
    const s = getTotalStock(p)
    return s > 0 && s <= 10
  }).slice(0, 3)
}
