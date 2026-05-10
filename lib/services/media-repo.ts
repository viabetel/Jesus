/**
 * Media Repository v2 — CRUD da tabela product_media com suporte a cor.
 *
 * Modelo:
 *   - mídia sem colorKey = mídia geral do produto
 *   - mídia com colorKey = mídia daquela cor específica
 *   - variantSku = opcional, para mídia de variante extremamente específica
 *
 * Prioridade na galeria pública:
 *   1. mídia da cor selecionada (colorKey = 'preto')
 *   2. mídia geral do produto (colorKey IS NULL)
 *   3. array images[] legado
 */

import { getSupabase } from "@/lib/supabase"

// ============================================================
// Tipos
// ============================================================

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
  /** Slug da cor. null = mídia geral do produto. */
  colorKey: string | null
  /** Nome legível da cor. */
  colorName: string | null
  /** Hex da cor (#000000). */
  colorHex: string | null
  /** SKU da variante específica (raro). */
  variantSku: string | null
}

export type MediaInput = {
  productId: string
  url: string
  storagePath?: string | null
  kind: MediaKind
  role?: MediaRole
  alt?: string | null
  sortOrder?: number
  colorKey?: string | null
  colorName?: string | null
  colorHex?: string | null
  variantSku?: string | null
}

export type MediaPatch = {
  role?: MediaRole
  sortOrder?: number
  alt?: string | null
  colorKey?: string | null
  colorName?: string | null
  colorHex?: string | null
  variantSku?: string | null
}

export type RepoResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }

// ============================================================
// Helpers
// ============================================================

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
    colorKey: (r.color_key as string) ?? null,
    colorName: (r.color_name as string) ?? null,
    colorHex: (r.color_hex as string) ?? null,
    variantSku: (r.variant_sku as string) ?? null,
  }
}

function inputToRow(input: MediaInput, sortOrder: number): Record<string, unknown> {
  return {
    product_id: input.productId,
    url: input.url,
    storage_path: input.storagePath ?? null,
    kind: input.kind,
    role: input.role ?? "gallery",
    alt: input.alt ?? null,
    sort_order: sortOrder,
    color_key: input.colorKey ?? null,
    color_name: input.colorName ?? null,
    color_hex: input.colorHex ?? null,
    variant_sku: input.variantSku ?? null,
  }
}

// ============================================================
// LEITURA
// ============================================================

/**
 * Lista toda a mídia de um produto (todas as cores + geral).
 * Ordenada por sort_order.
 */
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

/**
 * Lista mídia de uma cor específica de um produto.
 * Se colorKey for null, retorna mídia geral (sem cor).
 */
export async function getProductMediaByColor(
  productId: string,
  colorKey: string | null
): Promise<ProductMedia[]> {
  const sb = getSupabase()
  if (!sb) return []
  let query = sb
    .from("product_media")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true })

  if (colorKey === null) {
    query = query.is("color_key", null)
  } else {
    query = query.eq("color_key", colorKey)
  }

  const { data, error } = await query
  if (error) throw new Error(`Supabase getProductMediaByColor: ${error.message}`)
  return (data ?? []).map(rowToMedia)
}

/**
 * Retorna a mídia pra exibição pública, com prioridade:
 * 1. Mídia da cor selecionada (se existir)
 * 2. Mídia geral do produto (colorKey IS NULL)
 * 3. Array vazio (caller deve cair no fallback images[])
 */
export async function getDisplayMedia(
  productId: string,
  selectedColorKey: string | null
): Promise<ProductMedia[]> {
  const sb = getSupabase()
  if (!sb) return []

  // Busca tudo do produto de uma vez (1 query)
  const all = await getProductMedia(productId)
  if (all.length === 0) return []

  // Se tem cor selecionada, tenta mídia dessa cor
  if (selectedColorKey) {
    const colorMedia = all.filter(m => m.colorKey === selectedColorKey)
    if (colorMedia.length > 0) return colorMedia
  }

  // Fallback: mídia geral
  const generalMedia = all.filter(m => m.colorKey === null)
  if (generalMedia.length > 0) return generalMedia

  // Se não tem nem geral, retorna tudo (compatibilidade)
  return all
}

/**
 * Lista as cores que possuem mídia própria.
 * Usado pra UI saber quais cores têm fotos.
 */
export async function getMediaColorKeys(productId: string): Promise<string[]> {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb
    .from("product_media")
    .select("color_key")
    .eq("product_id", productId)
    .not("color_key", "is", null)
  if (error) throw new Error(`getMediaColorKeys: ${error.message}`)
  const keys = new Set<string>()
  for (const row of data ?? []) {
    if (row.color_key) keys.add(String(row.color_key))
  }
  return [...keys]
}

// ============================================================
// ESCRITA
// ============================================================

/**
 * Adiciona uma mídia. Se role=cover ou role=hover, verifica
 * unicidade por produto+cor antes de inserir.
 */
export async function addMedia(input: MediaInput): Promise<RepoResult<ProductMedia>> {
  const r = tryGetSb()
  if (!r.ok) return r
  const { sb } = r

  // Calcular sortOrder automático
  let sortOrder = input.sortOrder
  if (sortOrder === undefined) {
    let query = sb
      .from("product_media")
      .select("sort_order")
      .eq("product_id", input.productId)
      .order("sort_order", { ascending: false })
      .limit(1)

    // Escopo por cor pra manter ordenação independente
    if (input.colorKey) {
      query = query.eq("color_key", input.colorKey)
    } else {
      query = query.is("color_key", null)
    }

    const { data: existing } = await query
    sortOrder = existing?.[0]?.sort_order != null ? Number(existing[0].sort_order) + 1 : 0
  }

  // Validar unicidade de cover/hover por produto+cor
  if (input.role === "cover" || input.role === "hover") {
    let checkQuery = sb
      .from("product_media")
      .select("id")
      .eq("product_id", input.productId)
      .eq("role", input.role)

    if (input.colorKey) {
      checkQuery = checkQuery.eq("color_key", input.colorKey)
    } else {
      checkQuery = checkQuery.is("color_key", null)
    }

    const { data: existing } = await checkQuery
    if (existing && existing.length > 0) {
      // Desmarca o anterior (muda pra gallery)
      await sb
        .from("product_media")
        .update({ role: "gallery" })
        .eq("id", existing[0].id)
    }
  }

  const row = inputToRow(input, sortOrder)
  const { data, error } = await sb.from("product_media").insert(row).select().single()
  if (error) return { ok: false, error: { code: "DB", message: error.message } }
  return { ok: true, data: rowToMedia(data) }
}

/**
 * Atualiza uma mídia. Se mudou role pra cover/hover, valida unicidade.
 */
export async function updateMedia(id: number, patch: MediaPatch): Promise<RepoResult<ProductMedia>> {
  const r = tryGetSb()
  if (!r.ok) return r
  const { sb } = r

  const update: Record<string, unknown> = {}
  if (patch.role !== undefined) update.role = patch.role
  if (patch.sortOrder !== undefined) update.sort_order = patch.sortOrder
  if (patch.alt !== undefined) update.alt = patch.alt
  if (patch.colorKey !== undefined) update.color_key = patch.colorKey
  if (patch.colorName !== undefined) update.color_name = patch.colorName
  if (patch.colorHex !== undefined) update.color_hex = patch.colorHex
  if (patch.variantSku !== undefined) update.variant_sku = patch.variantSku

  if (Object.keys(update).length === 0) {
    return { ok: false, error: { code: "INVALID", message: "Nada pra atualizar" } }
  }

  // Se mudou role pra cover/hover, desmarcar o anterior da mesma cor
  if (patch.role === "cover" || patch.role === "hover") {
    // Busca a mídia atual pra saber a cor
    const { data: currentRow } = await sb
      .from("product_media")
      .select("product_id, color_key")
      .eq("id", id)
      .maybeSingle()

    if (currentRow) {
      const colorKey = patch.colorKey !== undefined ? patch.colorKey : currentRow.color_key
      let checkQuery = sb
        .from("product_media")
        .select("id")
        .eq("product_id", currentRow.product_id)
        .eq("role", patch.role)
        .neq("id", id)

      if (colorKey) {
        checkQuery = checkQuery.eq("color_key", colorKey)
      } else {
        checkQuery = checkQuery.is("color_key", null)
      }

      const { data: conflicting } = await checkQuery
      if (conflicting && conflicting.length > 0) {
        await sb
          .from("product_media")
          .update({ role: "gallery" })
          .eq("id", conflicting[0].id)
      }
    }
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
 * Reordena mídias dentro de um grupo (mesma cor ou geral).
 */
export async function reorderMedia(
  productId: string,
  orderedIds: number[]
): Promise<RepoResult<true>> {
  const r = tryGetSb()
  if (!r.ok) return r
  const { sb } = r
  const promises = orderedIds.map((mediaId, idx) =>
    sb.from("product_media")
      .update({ sort_order: idx })
      .eq("id", mediaId)
      .eq("product_id", productId)
  )
  const results = await Promise.all(promises)
  const firstError = results.find((res) => res.error)?.error
  if (firstError) return { ok: false, error: { code: "DB", message: firstError.message } }
  return { ok: true, data: true }
}

/**
 * Migra array images[] + video legado para product_media.
 * Idempotente — só insere se não houver mídia pra esse produto.
 * Toda mídia migrada fica como "geral" (sem cor).
 */
export async function migrateImagesToMedia(
  productId: string,
  images: string[],
  video?: string | null
): Promise<{ migrated: number }> {
  const sb = getSupabase()
  if (!sb) return { migrated: 0 }

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
    color_key: null,
    color_name: null,
    color_hex: null,
    variant_sku: null,
  }))
  if (video) {
    rows.push({
      product_id: productId,
      url: video,
      kind: "video",
      role: "video",
      sort_order: rows.length,
      color_key: null,
      color_name: null,
      color_hex: null,
      variant_sku: null,
    })
  }
  if (rows.length === 0) return { migrated: 0 }
  const { error } = await sb.from("product_media").insert(rows)
  if (error) throw new Error(`migrateImagesToMedia: ${error.message}`)
  return { migrated: rows.length }
}
