export type MediaProvider = "drive" | "cloudinary" | "blob" | "local" | "external"
export type MediaRole = "cover" | "hover" | "front" | "back" | "detail" | "model" | "lifestyle" | "gallery" | "video"
export type MediaType = "image" | "video"

export interface MediaItem {
  id: string; type: MediaType; role: MediaRole; url: string
  optimizedUrl?: string; thumbnailUrl?: string; posterUrl?: string; alt: string
  sourceProvider: MediaProvider; sourceId?: string; sortOrder: number
}

const DRIVE_LH3_RE = /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/
const DRIVE_FILE_RE = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/

export function detectProvider(url: string): MediaProvider {
  if (!url) return "external"
  if (url.startsWith("/")) return "local"
  if (DRIVE_LH3_RE.test(url) || DRIVE_FILE_RE.test(url)) return "drive"
  if (/res\.cloudinary\.com/.test(url)) return "cloudinary"
  if (/\.public\.blob\.vercel-storage\.com/.test(url)) return "blob"
  return "external"
}

export function extractDriveId(url: string): string | null {
  const lh3 = url.match(DRIVE_LH3_RE)
  if (lh3) return lh3[1]
  const file = url.match(DRIVE_FILE_RE)
  if (file) return file[1]
  return null
}

export function resolvePublicVideoSrc(item: MediaItem): string {
  if (item.optimizedUrl) return item.optimizedUrl
  if (item.sourceProvider === "drive") {
    const id = item.sourceId || extractDriveId(item.url)
    if (id) return `https://drive.google.com/uc?export=download&id=${id}`
  }
  return item.url
}

export function resolveVideoPoster(item: MediaItem): string | undefined {
  if (item.posterUrl) return item.posterUrl
  if (item.sourceProvider === "drive") {
    const id = item.sourceId || extractDriveId(item.url)
    if (id) return `https://lh3.googleusercontent.com/d/${id}`
  }
  return undefined
}

export interface GalleryEntry { type: MediaType; url: string; alt: string; media: MediaItem }

export function buildGalleryEntries(product: { id: string; name: string; images: string[]; video?: string }): GalleryEntry[] {
  const entries: GalleryEntry[] = []
  let sort = 0
  product.images.forEach((url, i) => {
    const provider = detectProvider(url)
    const item: MediaItem = {
      id: `${product.id}-img-${i}`, type: "image",
      role: i === 0 ? "cover" : i === 1 ? "hover" : "gallery",
      url, alt: `${product.name} — foto ${i + 1}`,
      sourceProvider: provider, sourceId: provider === "drive" ? extractDriveId(url) ?? undefined : undefined,
      sortOrder: sort++,
    }
    entries.push({ type: "image", url, alt: item.alt, media: item })
  })
  if (product.video) {
    const provider = detectProvider(product.video)
    const item: MediaItem = {
      id: `${product.id}-video`, type: "video", role: "video",
      url: product.video, alt: `${product.name} — vídeo`,
      sourceProvider: provider, sourceId: provider === "drive" ? extractDriveId(product.video) ?? undefined : undefined,
      sortOrder: sort++,
    }
    // Insert video after cover
    entries.splice(1, 0, { type: "video", url: product.video, alt: item.alt, media: item })
  }
  return entries
}

/**
 * Constrói as entries da galeria a partir das linhas de `product_media`
 * (rodada 3 — mídia estruturada). Usado quando a tabela tem dados pro produto.
 *
 * Se houver tanto entries da tabela quanto images[] no produto, a tabela ganha.
 */
export interface DbMediaRow {
  id: number
  productId: string
  url: string
  storagePath?: string | null
  kind: "image" | "video"
  role: MediaRole
  alt?: string | null
  sortOrder: number
}

export function buildGalleryFromDb(
  product: { id: string; name: string },
  rows: DbMediaRow[]
): GalleryEntry[] {
  const sorted = [...rows].sort((a, b) => a.sortOrder - b.sortOrder)
  return sorted.map((row) => {
    const provider = detectProvider(row.url)
    const item: MediaItem = {
      id: `${product.id}-m${row.id}`,
      type: row.kind,
      role: row.role,
      url: row.url,
      alt: row.alt ?? `${product.name} — ${row.role}`,
      sourceProvider: provider,
      sourceId: provider === "drive" ? extractDriveId(row.url) ?? undefined : undefined,
      sortOrder: row.sortOrder,
    }
    return { type: row.kind, url: row.url, alt: item.alt, media: item }
  })
}

/**
 * Decide qual fonte usar: a tabela `product_media` (preferida) ou o array
 * `images[]` legado (fallback). Use no SSR da página do produto.
 */
export function buildGallerySmart(
  product: { id: string; name: string; images: string[]; video?: string },
  dbRows: DbMediaRow[] | null
): GalleryEntry[] {
  if (dbRows && dbRows.length > 0) {
    return buildGalleryFromDb(product, dbRows)
  }
  return buildGalleryEntries(product)
}
