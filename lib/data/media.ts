/**
 * ===== Sistema de mídia dos produtos =====
 *
 * Permite que cada produto tenha mídia organizada por papel
 * (cover, hover, frente, costas, detalhe, modelo, lifestyle, vídeo)
 * em vez de simplesmente um array de imagens soltas.
 *
 * Mantém compatibilidade com a API antiga (`images: string[]`, `video?: string`):
 * o helper `getProductMedia` constrói a estrutura completa a partir do produto,
 * usando o `media` se ele existir, ou caindo em uma derivação automática a partir
 * de `images` + `video` quando não existir.
 */

import type { Product } from "./products"

export type MediaRole =
  | "cover"
  | "hover"
  | "front"
  | "back"
  | "detail"
  | "model"
  | "lifestyle"
  | "video"

export type MediaType = "image" | "video"

export type MediaItem = {
  type: MediaType
  role: MediaRole
  url: string
  /** thumbnail estática para vídeos (preview/poster) */
  thumbnail?: string
  /** alt-text descritivo */
  alt: string
}

export type ProductMedia = {
  cover: string
  hover?: string
  /** thumbnail/poster do vídeo (se houver) */
  videoThumbnail?: string
  gallery: MediaItem[]
}

/**
 * Detecta se uma URL aponta para vídeo.
 * Heurística simples: por extensão ou por padrão de Drive.
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return true
  if (url.includes("drive.google.com/file/d/")) return true
  return false
}

/**
 * Extrai o ID de um arquivo do Google Drive a partir de qualquer formato comum.
 * Aceita lh3.googleusercontent.com/d/ID e drive.google.com/file/d/ID/...
 */
export function extractDriveId(url: string): string | null {
  if (!url) return null
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) return fileMatch[1]
  const lh3Match = url.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/)
  if (lh3Match) return lh3Match[1]
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (idMatch) return idMatch[1]
  return null
}

/**
 * Converte uma URL (Drive ou outra) na URL de embed do Drive.
 * Para uso em <iframe>.
 */
export function toDrivePreviewUrl(url: string): string {
  const id = extractDriveId(url)
  if (id) return `https://drive.google.com/file/d/${id}/preview`
  return url
}

/**
 * Tenta gerar uma thumbnail estática a partir de uma URL de Drive.
 * Drive expõe thumbnails em https://drive.google.com/thumbnail?id=ID&sz=w800
 * Se não conseguir, retorna undefined.
 */
export function getVideoThumbnail(url: string | undefined): string | undefined {
  if (!url) return undefined
  const id = extractDriveId(url)
  if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w800`
  return undefined
}

/**
 * Constrói a estrutura completa de mídia de um produto, com fallback
 * para a API antiga (images[] + video).
 *
 * Regra de derivação a partir do array antigo:
 *   - imagem 0 = cover (capa)
 *   - imagem 1 = hover (segunda imagem aparece no hover do card)
 *   - imagem 2 = front
 *   - imagem 3 = back
 *   - imagem 4 = detail
 *   - imagem 5+ = model / lifestyle
 *   - video = inserido como item de galeria do tipo "video"
 */
export function getProductMedia(product: Product): ProductMedia {
  // Se o produto já trouxer um campo `media` (futuro), usamos ele.
  // (Mantém retrocompatibilidade: hoje nenhum produto define media.)
  // @ts-expect-error - campo opcional de futura migração
  if (product.media && Array.isArray(product.media.gallery)) {
    // @ts-expect-error - campo opcional de futura migração
    return product.media as ProductMedia
  }

  const imgs = product.images ?? []
  const cover = imgs[0] || "/brand/placeholder-product.svg"
  const hover = imgs[1] || undefined

  const roleByIndex: MediaRole[] = ["cover", "hover", "front", "back", "detail", "model", "lifestyle"]

  const gallery: MediaItem[] = imgs.map((url, i) => ({
    type: "image",
    role: roleByIndex[i] ?? "lifestyle",
    url,
    alt: `${product.name} — ${roleByIndex[i] ?? "foto " + (i + 1)}`,
  }))

  let videoThumbnail: string | undefined
  if (product.video) {
    const thumbnail = getVideoThumbnail(product.video) ?? imgs[0]
    videoThumbnail = thumbnail
    // Insere o vídeo logo após a capa (segundo item da galeria)
    gallery.splice(1, 0, {
      type: "video",
      role: "video",
      url: product.video,
      thumbnail,
      alt: `${product.name} — vídeo`,
    })
  }

  return { cover, hover, videoThumbnail, gallery }
}

/**
 * Detecta URLs duplicadas dentro da mídia de um produto.
 * Útil para a tela de auditoria.
 */
export function getDuplicateUrls(media: ProductMedia): string[] {
  const seen = new Map<string, number>()
  for (const item of media.gallery) {
    seen.set(item.url, (seen.get(item.url) ?? 0) + 1)
  }
  if (media.hover) seen.set(media.hover, (seen.get(media.hover) ?? 0) + 1)
  return [...seen.entries()].filter(([, count]) => count > 1).map(([url]) => url)
}

/**
 * Conta itens de cada tipo na galeria.
 */
export function countMediaByType(media: ProductMedia) {
  return {
    images: media.gallery.filter((m) => m.type === "image").length,
    videos: media.gallery.filter((m) => m.type === "video").length,
    total: media.gallery.length,
  }
}
