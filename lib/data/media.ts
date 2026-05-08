/**
 * Fashion Store — Media System v2
 *
 * Provides a unified media layer that supports multiple providers:
 *   - drive:      Google Drive (internal/legacy — NOT for public player)
 *   - cloudinary: Cloudinary CDN (recommended for production)
 *   - blob:       Vercel Blob Storage
 *   - local:      /public/products/{slug}/...
 *   - external:   Any direct public URL
 *
 * Backward-compatible with legacy Product.images[] + Product.video?
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MediaProvider = "drive" | "cloudinary" | "blob" | "local" | "external"

export type MediaRole =
  | "cover"
  | "hover"
  | "front"
  | "back"
  | "detail"
  | "model"
  | "lifestyle"
  | "gallery"
  | "video"

export type MediaType = "image" | "video"

export interface MediaItem {
  id: string
  type: MediaType
  role: MediaRole
  url: string                   // raw / source URL
  optimizedUrl?: string         // CDN-optimized public URL
  thumbnailUrl?: string         // small thumb
  posterUrl?: string            // video poster
  alt: string
  width?: number
  height?: number
  sourceProvider: MediaProvider
  sourceId?: string             // e.g. Drive file ID, Cloudinary public_id
  sortOrder: number
}

export interface ProductMedia {
  cover: MediaItem | null
  hover: MediaItem | null
  gallery: MediaItem[]
}

// ---------------------------------------------------------------------------
// Provider detection
// ---------------------------------------------------------------------------

const DRIVE_LH3_RE = /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/
const DRIVE_FILE_RE = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
const CLOUDINARY_RE = /res\.cloudinary\.com/
const VERCEL_BLOB_RE = /\.public\.blob\.vercel-storage\.com/

export function detectProvider(url: string): MediaProvider {
  if (!url) return "external"
  if (url.startsWith("/")) return "local"
  if (DRIVE_LH3_RE.test(url) || DRIVE_FILE_RE.test(url)) return "drive"
  if (CLOUDINARY_RE.test(url)) return "cloudinary"
  if (VERCEL_BLOB_RE.test(url)) return "blob"
  return "external"
}

export function extractDriveId(url: string): string | null {
  const lh3 = url.match(DRIVE_LH3_RE)
  if (lh3) return lh3[1]
  const file = url.match(DRIVE_FILE_RE)
  if (file) return file[1]
  return null
}

// ---------------------------------------------------------------------------
// Public URL resolution (video)
// ---------------------------------------------------------------------------

/**
 * Returns a URL suitable for a <video src="..."> tag.
 * For Drive videos, converts lh3/drive links to a direct-download URL.
 * For other providers, returns URL as-is or optimizedUrl if available.
 */
export function resolvePublicVideoSrc(item: MediaItem): string {
  if (item.optimizedUrl) return item.optimizedUrl

  if (item.sourceProvider === "drive") {
    const id = item.sourceId || extractDriveId(item.url)
    if (id) {
      // Direct download link — works as <video> src for publicly shared files
      return `https://drive.google.com/uc?export=download&id=${id}`
    }
  }

  return item.url
}

/**
 * Returns a URL for the video poster/thumbnail.
 */
export function resolveVideoPoster(item: MediaItem): string | undefined {
  if (item.posterUrl) return item.posterUrl
  if (item.thumbnailUrl) return item.thumbnailUrl

  // For Drive videos, use lh3 thumbnail
  if (item.sourceProvider === "drive") {
    const id = item.sourceId || extractDriveId(item.url)
    if (id) return `https://lh3.googleusercontent.com/d/${id}`
  }

  return undefined
}

// ---------------------------------------------------------------------------
// Recommended local path (for future migration off Drive)
// ---------------------------------------------------------------------------

export function recommendedLocalPath(
  slug: string,
  role: MediaRole,
  index: number,
  type: MediaType
): string {
  const ext = type === "video" ? "mp4" : "webp"
  if (role === "cover") return `/products/${slug}/cover.${ext}`
  if (role === "hover") return `/products/${slug}/hover.${ext}`
  if (role === "video") return `/products/${slug}/video.${ext}`
  return `/products/${slug}/${role}-${index + 1}.${ext}`
}

// ---------------------------------------------------------------------------
// Backward-compat: build MediaItem[] from legacy Product
// ---------------------------------------------------------------------------

interface LegacyProduct {
  id: string
  name: string
  slug: string
  images: string[]
  video?: string
}

export function buildMediaFromLegacy(product: LegacyProduct): ProductMedia {
  const items: MediaItem[] = []
  let sortOrder = 0

  // Images
  product.images.forEach((url, i) => {
    const provider = detectProvider(url)
    const role: MediaRole = i === 0 ? "cover" : i === 1 ? "hover" : "gallery"

    items.push({
      id: `${product.id}-img-${i}`,
      type: "image",
      role,
      url,
      alt: i === 0
        ? `${product.name} — capa`
        : i === 1
          ? `${product.name} — costas`
          : `${product.name} — foto ${i + 1}`,
      sourceProvider: provider,
      sourceId: provider === "drive" ? extractDriveId(url) ?? undefined : undefined,
      sortOrder: sortOrder++,
    })
  })

  // Video
  if (product.video) {
    const provider = detectProvider(product.video)
    items.push({
      id: `${product.id}-video`,
      type: "video",
      role: "video",
      url: product.video,
      alt: `${product.name} — vídeo`,
      sourceProvider: provider,
      sourceId: provider === "drive" ? extractDriveId(product.video) ?? undefined : undefined,
      sortOrder: sortOrder++,
    })
  }

  const cover = items.find((m) => m.role === "cover") ?? null
  const hover = items.find((m) => m.role === "hover") ?? null
  const gallery = items.filter((m) => m.role !== "cover" && m.role !== "hover")

  return { cover, hover, gallery }
}

// ---------------------------------------------------------------------------
// Gallery builder for product page (images + video interleaved)
// ---------------------------------------------------------------------------

export interface GalleryEntry {
  type: MediaType
  url: string
  alt: string
  media: MediaItem
}

export function buildGalleryEntries(product: LegacyProduct): GalleryEntry[] {
  const pm = buildMediaFromLegacy(product)
  const entries: GalleryEntry[] = []

  // Cover first
  if (pm.cover) {
    entries.push({ type: "image", url: pm.cover.url, alt: pm.cover.alt, media: pm.cover })
  }

  // Video second (after cover)
  const videoItem = pm.gallery.find((m) => m.type === "video")
  if (videoItem) {
    entries.push({ type: "video", url: videoItem.url, alt: videoItem.alt, media: videoItem })
  }

  // Hover
  if (pm.hover) {
    entries.push({ type: "image", url: pm.hover.url, alt: pm.hover.alt, media: pm.hover })
  }

  // Remaining gallery images
  pm.gallery
    .filter((m) => m.type === "image")
    .forEach((m) => {
      entries.push({ type: "image", url: m.url, alt: m.alt, media: m })
    })

  return entries
}
