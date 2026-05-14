/**
 * Shared Cover Image Resolver
 *
 * Single source of truth for resolving product cover images.
 * Used by: catalog, product detail, cart, admin.
 *
 * Priority:
 * 1. product_media cover for specific color
 * 2. product_media cover (general)
 * 3. First product_media image
 * 4. product.images[0] (legacy)
 * 5. Placeholder
 */

import { getSupabase } from "@/lib/supabase"

const PLACEHOLDER = "/brand/placeholder-product.svg"

export type CoverResult = {
  url: string
  source: "media-color" | "media-general" | "media-any" | "legacy" | "placeholder"
}

/**
 * Resolve cover image for a product.
 * @param productId - Product ID
 * @param legacyImages - product.images[] array (fallback)
 * @param colorKey - Optional color key for color-specific cover
 */
export async function resolveProductCover(
  productId: string,
  legacyImages: string[] = [],
  colorKey?: string | null
): Promise<CoverResult> {
  const sb = getSupabase()

  if (sb) {
    try {
      // Fetch all covers and images for this product in one query
      const { data: media } = await sb
        .from("product_media")
        .select("url, role, kind, color_key")
        .eq("product_id", productId)
        .eq("kind", "image")
        .order("sort_order")
        .limit(20)

      if (media && media.length > 0) {
        // 1. Color-specific cover
        if (colorKey) {
          const colorCover = media.find(m => m.role === "cover" && m.color_key === colorKey)
          if (colorCover) return { url: String(colorCover.url), source: "media-color" }
        }

        // 2. General cover (no color_key)
        const generalCover = media.find(m => m.role === "cover" && !m.color_key)
        if (generalCover) return { url: String(generalCover.url), source: "media-general" }

        // 3. Any cover
        const anyCover = media.find(m => m.role === "cover")
        if (anyCover) return { url: String(anyCover.url), source: "media-general" }

        // 4. First image from media
        const firstImg = media[0]
        if (firstImg) return { url: String(firstImg.url), source: "media-any" }
      }
    } catch (e) {
      console.error("[CoverResolver] Error fetching media:", e)
    }
  }

  // 5. Legacy images
  const validLegacy = legacyImages.filter(img => !!img && img.length > 1)
  if (validLegacy.length > 0) {
    return { url: validLegacy[0], source: "legacy" }
  }

  // 6. Placeholder
  return { url: PLACEHOLDER, source: "placeholder" }
}

/**
 * Batch resolve covers for multiple products (efficient: single query).
 */
export async function resolveProductCovers(
  products: { id: string; images: string[] }[]
): Promise<Map<string, CoverResult>> {
  const result = new Map<string, CoverResult>()
  const sb = getSupabase()

  if (sb && products.length > 0) {
    try {
      const ids = products.map(p => p.id)
      const { data: media } = await sb
        .from("product_media")
        .select("product_id, url, role, kind, color_key")
        .in("product_id", ids)
        .eq("kind", "image")
        .order("sort_order")
        .limit(500)

      if (media) {
        // Group by product
        const byProduct = new Map<string, typeof media>()
        for (const m of media) {
          const pid = String(m.product_id)
          if (!byProduct.has(pid)) byProduct.set(pid, [])
          byProduct.get(pid)!.push(m)
        }

        for (const p of products) {
          const pMedia = byProduct.get(p.id)
          if (pMedia && pMedia.length > 0) {
            const cover = pMedia.find(m => m.role === "cover") || pMedia[0]
            result.set(p.id, { url: String(cover.url), source: cover.role === "cover" ? "media-general" : "media-any" })
          }
        }
      }
    } catch (e) {
      console.error("[CoverResolver] Batch error:", e)
    }
  }

  // Fill in products that weren't resolved from media
  for (const p of products) {
    if (!result.has(p.id)) {
      const validLegacy = p.images.filter(img => !!img && img.length > 1)
      result.set(p.id, validLegacy.length > 0
        ? { url: validLegacy[0], source: "legacy" }
        : { url: PLACEHOLDER, source: "placeholder" })
    }
  }

  return result
}
