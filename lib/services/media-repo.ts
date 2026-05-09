/**
 * Media Repository — CRUD da tabela product_media.
 *
 * Substitui o array `images: string[]` por estrutura com role e ordem.
 * Compat: se o produto não tiver linhas em `product_media`, o repo de
 * produtos continua usando o array `images` legado.
 */

import { getSupabase } from "@/lib/supabase"

export type MediaRole =
  | "cover" | "hover" | "front" | "back" | "detail"
  | "model" | "lifestyle" | "gallery" | "video"

export type MediaKind = "image" | "video"

export type ProductMedia = {
  id: number
  productId: string
  url: string
  storagePath: string | null
  kind: MediaKind
  role: MediaRole
  alt: string | null
  sortOrder: number
  width: number | null
  height: number | null
}

export type MediaInput = {
  productId: string
  url: string
  storagePath?: string | null
  kind: MediaKind
  role?: MediaRole
  alt?: string | null
  sortOrder?: number
}

export type MediaPatch = {
  role?: MediaRole
  sortOrder?: number
  alt?: string | null
}

export type RepoResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }

function tryGetSb() {
  const sb = getSupabase()
  if (!sb) return { ok: false as const, error: { code: "NO_DB", message: "Supabase não configurado." } }
  return { ok: true as const, sb }
}

function rowToMedia(r: Record<string, unknown>): ProductMedia {
  return {
    id: Number(r.id),
    productId: String(r.product_id),
    url: String(r.url),
    storagePath: (r.storage_path as string) ?? null,
    kind: r.kind as MediaKind,
    role: r.role as MediaRole,
    alt: (r.alt as string) ?? null,
    sortOrder: Number(r.sort_order),
    width: r.width != null ? Number(r.width) : null,
    height: r.height != null ? Number(r.height) : null,
  }
}

export async function getProductMedia(productId: string): Promise<ProductMedia[]> {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb
    .from("product_media")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true })
  if (error) throw new Error(`Supabase getProductMedia: ${error.message}`)
  return (data ?? []).map(rowToMedia)
}

export async function addMedia(input: MediaInput): Promise<RepoResult<ProductMedia>> {
  const r = tryGetSb()
  if (!r.ok) return r
  const { sb } = r

  // Se sortOrder não foi passado, joga no fim
  let sortOrder = input.sortOrder
  if (sortOrder === undefined) {
    const { data: existing } = await sb
      .from("product_media")
      .select("sort_order")
      .eq("product_id", input.productId)
      .order("sort_order", { ascending: false })
      .limit(1)
    sortOrder = existing?.[0]?.sort_order != null ? Number(existing[0].sort_order) + 1 : 0
  }

  const row = {
    product_id: input.productId,
    url: input.url,
    storage_path: input.storagePath ?? null,
    kind: input.kind,
    role: input.role ?? "gallery",
    alt: input.alt ?? null,
    sort_order: sortOrder,
  }

  const { data, error } = await sb.from("product_media").insert(row).select().single()
  if (error) return { ok: false, error: { code: "DB", message: error.message } }
  return { ok: true, data: rowToMedia(data) }
}

export async function updateMedia(id: number, patch: MediaPatch): Promise<RepoResult<ProductMedia>> {
  const r = tryGetSb()
  if (!r.ok) return r
  const { sb } = r

  const update: Record<string, unknown> = {}
  if (patch.role !== undefined) update.role = patch.role
  if (patch.sortOrder !== undefined) update.sort_order = patch.sortOrder
  if (patch.alt !== undefined) update.alt = patch.alt
  if (Object.keys(update).length === 0) {
    return { ok: false, error: { code: "INVALID", message: "Nada pra atualizar" } }
  }

  const { data, error } = await sb
    .from("product_media")
    .update(update)
    .eq("id", id)
    .select()
    .maybeSingle()
  if (error) return { ok: false, error: { code: "DB", message: error.message } }
  if (!data) return { ok: false, error: { code: "NOT_FOUND", message: "Mídia não encontrada" } }
  return { ok: true, data: rowToMedia(data) }
}

export async function deleteMedia(id: number): Promise<RepoResult<true>> {
  const r = tryGetSb()
  if (!r.ok) return r
  const { sb } = r
  const { error } = await sb.from("product_media").delete().eq("id", id)
  if (error) return { ok: false, error: { code: "DB", message: error.message } }
  return { ok: true, data: true }
}

/**
 * Reordena várias mídias de uma vez. Recebe lista de { id, sortOrder }.
 * Faz update em batch com promises paralelas.
 */
export async function reorderMedia(
  productId: string,
  orderedIds: number[]
): Promise<RepoResult<true>> {
  const r = tryGetSb()
  if (!r.ok) return r
  const { sb } = r
  const promises = orderedIds.map((id, idx) =>
    sb.from("product_media").update({ sort_order: idx }).eq("id", id).eq("product_id", productId)
  )
  const results = await Promise.all(promises)
  const firstError = results.find((res) => res.error)?.error
  if (firstError) return { ok: false, error: { code: "DB", message: firstError.message } }
  return { ok: true, data: true }
}

/**
 * Migra um array `images: string[]` legado para a tabela product_media.
 * Idempotente — só insere se ainda não houver mídia pra esse produto.
 */
export async function migrateImagesToMedia(
  productId: string,
  images: string[],
  video?: string | null
): Promise<{ migrated: number }> {
  const sb = getSupabase()
  if (!sb) return { migrated: 0 }

  // Se já existe mídia, não faz nada
  const { data: existing } = await sb
    .from("product_media")
    .select("id")
    .eq("product_id", productId)
    .limit(1)
  if (existing && existing.length > 0) return { migrated: 0 }

  const rows: Record<string, unknown>[] = images.map((url, idx) => ({
    product_id: productId,
    url,
    kind: "image",
    role: idx === 0 ? "cover" : idx === 1 ? "hover" : "gallery",
    sort_order: idx,
  }))
  if (video) {
    rows.push({
      product_id: productId,
      url: video,
      kind: "video",
      role: "video",
      sort_order: rows.length,
    })
  }
  if (rows.length === 0) return { migrated: 0 }
  const { error } = await sb.from("product_media").insert(rows)
  if (error) throw new Error(`migrateImagesToMedia: ${error.message}`)
  return { migrated: rows.length }
}
