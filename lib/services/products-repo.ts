/**
 * Products Repository — Supabase com fallback in-memory.
 *
 * Filosofia:
 *  - O catálogo público (home, /produtos, /produto/[slug]) lê via `getProducts()`.
 *  - O admin escreve via createProduct/updateProduct/deleteProduct/upsertVariant.
 *  - Em dev sem Supabase, lemos do `lib/data/products.ts` estático (fonte
 *    legada). Mas qualquer escrita exige Supabase.
 */

import {
  products as legacyProducts,
  type Product,
  type ProductVariant,
  type ProductSize,
  type ProductCategory,
  type ProductStatus,
  type ProductBadge,
} from "@/lib/data/products"
import { getSupabase } from "@/lib/supabase"

// ============================================================
// Tipos para criação / edição
// ============================================================

export type ProductInput = {
  slug: string
  sku: string
  name: string
  category: ProductCategory
  status?: ProductStatus
  price: number
  originalPrice?: number | null
  badge?: ProductBadge | null
  description: string
  details: string[]
  images: string[]
  video?: string | null
  isNew?: boolean
  isPromotion?: boolean
  isBestseller?: boolean
  tags?: string[]
  sortOrder?: number
}

export type ProductPatch = Partial<ProductInput>

export type VariantInput = {
  sku: string
  productId: string
  colorName: string
  colorHex: string
  size: ProductSize
  stock: number
  active?: boolean
}

export type RepoResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }

// ============================================================
// Mapeamento DB → domínio
// ============================================================

function mapVariantRow(row: Record<string, unknown>): ProductVariant {
  return {
    sku: String(row.sku),
    colorName: String(row.color_name),
    colorHex: String(row.color_hex),
    size: row.size as ProductSize,
    stock: Number(row.stock),
    active: Boolean(row.active),
  }
}

function mapProductRow(
  row: Record<string, unknown>,
  variants: ProductVariant[] = []
): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    sku: String(row.sku),
    name: String(row.name),
    category: row.category as ProductCategory,
    status: (row.status as ProductStatus) ?? "ativo",
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    badge: (row.badge as ProductBadge) ?? undefined,
    description: String(row.description ?? ""),
    details: (row.details as string[]) ?? [],
    images: (row.images as string[]) ?? [],
    video: (row.video as string) ?? undefined,
    isNew: Boolean(row.is_new),
    isPromotion: Boolean(row.is_promotion),
    isBestseller: Boolean(row.is_bestseller),
    tags: (row.tags as string[]) ?? [],
    variants,
  }
}

function inputToDb(input: ProductPatch): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (input.slug !== undefined) out.slug = input.slug
  if (input.sku !== undefined) out.sku = input.sku
  if (input.name !== undefined) out.name = input.name
  if (input.category !== undefined) out.category = input.category
  if (input.status !== undefined) out.status = input.status
  if (input.price !== undefined) out.price = input.price
  if (input.originalPrice !== undefined) out.original_price = input.originalPrice
  if (input.badge !== undefined) out.badge = input.badge
  if (input.description !== undefined) out.description = input.description
  if (input.details !== undefined) out.details = input.details
  if (input.images !== undefined) out.images = input.images
  if (input.video !== undefined) out.video = input.video
  if (input.isNew !== undefined) out.is_new = input.isNew
  if (input.isPromotion !== undefined) out.is_promotion = input.isPromotion
  if (input.isBestseller !== undefined) out.is_bestseller = input.isBestseller
  if (input.tags !== undefined) out.tags = input.tags
  if (input.sortOrder !== undefined) out.sort_order = input.sortOrder
  return out
}

// ============================================================
// LEITURA
// ============================================================

/**
 * Retorna todos os produtos. Em modo Supabase, traz só `status='ativo'` por padrão
 * (catálogo público). Passe `{ includeAll: true }` no admin pra trazer rascunhos
 * e ocultos.
 */
export async function getAllProducts(
  opts: { includeAll?: boolean } = {}
): Promise<Product[]> {
  const sb = getSupabase()
  if (!sb) {
    // Fallback dev: usa o array estático
    return legacyProducts
  }

  let query = sb.from("products").select("*").order("sort_order").order("created_at")
  if (!opts.includeAll) query = query.eq("status", "ativo")

  const { data: prods, error } = await query
  if (error) throw new Error(`Supabase getAllProducts: ${error.message}`)
  if (!prods || prods.length === 0) return []

  // Pega TODAS as variantes em uma query só
  const ids = prods.map((p) => p.id as string)
  const { data: vars, error: vErr } = await sb
    .from("product_variants")
    .select("*")
    .in("product_id", ids)
  if (vErr) throw new Error(`Supabase getAllProducts variants: ${vErr.message}`)

  const byProduct = new Map<string, ProductVariant[]>()
  for (const v of vars ?? []) {
    const pid = String(v.product_id)
    const arr = byProduct.get(pid) ?? []
    arr.push(mapVariantRow(v))
    byProduct.set(pid, arr)
  }
  return prods.map((p) => mapProductRow(p, byProduct.get(String(p.id)) ?? []))
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const sb = getSupabase()
  if (!sb) {
    return legacyProducts.find((p) => p.slug === slug) ?? null
  }
  const { data: row, error } = await sb
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()
  if (error) throw new Error(`Supabase getProductBySlug: ${error.message}`)
  if (!row) return null
  const { data: vars, error: vErr } = await sb
    .from("product_variants")
    .select("*")
    .eq("product_id", row.id)
  if (vErr) throw new Error(`Supabase variants: ${vErr.message}`)
  return mapProductRow(row, (vars ?? []).map(mapVariantRow))
}

export async function getProductById(id: string): Promise<Product | null> {
  const sb = getSupabase()
  if (!sb) {
    return legacyProducts.find((p) => p.id === id) ?? null
  }
  const { data: row, error } = await sb
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw new Error(`Supabase getProductById: ${error.message}`)
  if (!row) return null
  const { data: vars, error: vErr } = await sb
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
  if (vErr) throw new Error(`Supabase variants: ${vErr.message}`)
  return mapProductRow(row, (vars ?? []).map(mapVariantRow))
}

// ============================================================
// VALIDAÇÕES
// ============================================================

function validateSlug(slug: string): string | null {
  if (!slug) return "Slug obrigatório"
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
    return "Slug deve ser lowercase, sem espaços (use hífens)"
  return null
}

function validateProductInput(input: ProductInput): string | null {
  if (!input.name?.trim()) return "Nome obrigatório"
  if (validateSlug(input.slug)) return validateSlug(input.slug)
  if (!input.sku?.trim()) return "SKU obrigatório"
  if (!input.category) return "Categoria obrigatória"
  if (!input.price || input.price <= 0) return "Preço inválido"
  if (input.originalPrice != null && input.originalPrice <= input.price)
    return "Preço original deve ser maior que o atual"
  return null
}

// ============================================================
// ESCRITA — só funciona com Supabase configurado
// ============================================================

function requireSb() {
  const sb = getSupabase()
  if (!sb)
    throw new Error(
      "Operação de escrita requer Supabase configurado (SUPABASE_URL/SUPABASE_SERVICE_KEY)."
    )
  return sb
}

/** Versão que devolve RepoResult em vez de lançar. */
function tryGetSb(): { ok: true; sb: NonNullable<ReturnType<typeof getSupabase>> } | { ok: false; error: { code: string; message: string } } {
  const sb = getSupabase()
  if (!sb) {
    return {
      ok: false,
      error: {
        code: "NO_DB",
        message: "Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_KEY.",
      },
    }
  }
  return { ok: true, sb }
}

/**
 * Cria um produto novo. Retorna erro tipado em vez de lançar.
 */
export async function createProduct(input: ProductInput): Promise<RepoResult<Product>> {
  const validation = validateProductInput(input)
  if (validation) return { ok: false, error: { code: "INVALID", message: validation } }

  const dbResult = tryGetSb()
  if (!dbResult.ok) return dbResult
  const sb = dbResult.sb

  // Conflito de slug ou SKU
  const { data: dupSlug } = await sb.from("products").select("id").eq("slug", input.slug).maybeSingle()
  if (dupSlug) return { ok: false, error: { code: "DUP_SLUG", message: `Slug já existe: ${input.slug}` } }
  const { data: dupSku } = await sb.from("products").select("id").eq("sku", input.sku).maybeSingle()
  if (dupSku) return { ok: false, error: { code: "DUP_SKU", message: `SKU já existe: ${input.sku}` } }

  // ID novo: timestamp curto + 4 chars random
  const id = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`

  const row: Record<string, unknown> = {
    id,
    status: input.status ?? "ativo",
    ...inputToDb(input),
  }

  const { data, error } = await sb.from("products").insert(row).select().single()
  if (error) return { ok: false, error: { code: "DB", message: error.message } }
  return { ok: true, data: mapProductRow(data, []) }
}

export async function updateProduct(
  id: string,
  patch: ProductPatch
): Promise<RepoResult<Product>> {
  if (patch.slug !== undefined) {
    const e = validateSlug(patch.slug)
    if (e) return { ok: false, error: { code: "INVALID", message: e } }
  }
  if (patch.price !== undefined && patch.price <= 0) {
    return { ok: false, error: { code: "INVALID", message: "Preço inválido" } }
  }

  const dbResult = tryGetSb()
  if (!dbResult.ok) return dbResult
  const sb = dbResult.sb

  // Checa conflitos de slug/sku se mudou
  if (patch.slug) {
    const { data } = await sb.from("products").select("id").eq("slug", patch.slug).neq("id", id).maybeSingle()
    if (data) return { ok: false, error: { code: "DUP_SLUG", message: `Slug já existe: ${patch.slug}` } }
  }
  if (patch.sku) {
    const { data } = await sb.from("products").select("id").eq("sku", patch.sku).neq("id", id).maybeSingle()
    if (data) return { ok: false, error: { code: "DUP_SKU", message: `SKU já existe: ${patch.sku}` } }
  }

  const { data, error } = await sb
    .from("products")
    .update(inputToDb(patch))
    .eq("id", id)
    .select()
    .maybeSingle()
  if (error) return { ok: false, error: { code: "DB", message: error.message } }
  if (!data) return { ok: false, error: { code: "NOT_FOUND", message: "Produto não encontrado" } }

  // Recarrega com variantes
  const fresh = await getProductById(id)
  return { ok: true, data: fresh! }
}

export async function deleteProduct(id: string): Promise<RepoResult<true>> {
  const dbResult = tryGetSb()
  if (!dbResult.ok) return dbResult
  const sb = dbResult.sb
  const { error } = await sb.from("products").delete().eq("id", id)
  if (error) return { ok: false, error: { code: "DB", message: error.message } }
  return { ok: true, data: true }
}

// ============================================================
// VARIANTS
// ============================================================

function generateVariantSku(productSku: string, colorName: string, size: ProductSize): string {
  const slug = colorName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toUpperCase()
  return `${productSku}-${slug}-${size}`
}

/**
 * Cria ou atualiza uma variante. Se `sku` não vier, gera automaticamente.
 */
export async function upsertVariant(input: VariantInput): Promise<RepoResult<ProductVariant>> {
  const dbResult = tryGetSb()
  if (!dbResult.ok) return dbResult
  const sb = dbResult.sb

  // Se SKU não foi explicitamente informado, derivar do produto
  let sku = input.sku
  if (!sku) {
    const { data: prod } = await sb.from("products").select("sku").eq("id", input.productId).maybeSingle()
    if (!prod) return { ok: false, error: { code: "NOT_FOUND", message: "Produto não encontrado" } }
    sku = generateVariantSku(prod.sku as string, input.colorName, input.size)
  }

  if (input.stock < 0) {
    return { ok: false, error: { code: "INVALID", message: "Estoque não pode ser negativo" } }
  }

  const row = {
    sku,
    product_id: input.productId,
    color_name: input.colorName,
    color_hex: input.colorHex,
    size: input.size,
    stock: input.stock,
    active: input.active ?? true,
  }

  const { data, error } = await sb
    .from("product_variants")
    .upsert(row, { onConflict: "sku" })
    .select()
    .single()
  if (error) return { ok: false, error: { code: "DB", message: error.message } }
  return { ok: true, data: mapVariantRow(data) }
}

export async function deleteVariant(sku: string): Promise<RepoResult<true>> {
  const dbResult = tryGetSb()
  if (!dbResult.ok) return dbResult
  const sb = dbResult.sb
  const { error } = await sb.from("product_variants").delete().eq("sku", sku)
  if (error) return { ok: false, error: { code: "DB", message: error.message } }
  return { ok: true, data: true }
}

// ============================================================
// MIGRAÇÃO ONE-SHOT
// ============================================================

/**
 * Migra todos os produtos do `lib/data/products.ts` (legado) para o Supabase.
 * Idempotente: usa upsert. Pula se Supabase não estiver configurado.
 */
export async function migrateLegacyProducts(): Promise<{ products: number; variants: number }> {
  const sb = requireSb()
  let pCount = 0
  let vCount = 0

  for (const p of legacyProducts) {
    const productRow = {
      id: p.id,
      slug: p.slug,
      sku: p.sku,
      name: p.name,
      category: p.category,
      status: p.status ?? "ativo",
      price: p.price,
      original_price: p.originalPrice ?? null,
      badge: p.badge ?? null,
      description: p.description,
      details: p.details,
      images: p.images,
      video: p.video ?? null,
      is_new: !!p.isNew,
      is_promotion: !!p.isPromotion,
      is_bestseller: !!p.isBestseller,
      tags: p.tags ?? [],
      sort_order: 0,
    }
    const { error } = await sb.from("products").upsert(productRow, { onConflict: "id" })
    if (error) throw new Error(`Migrate product ${p.id}: ${error.message}`)
    pCount++

    for (const v of p.variants) {
      const vRow = {
        sku: v.sku,
        product_id: p.id,
        color_name: v.colorName,
        color_hex: v.colorHex,
        size: v.size,
        stock: v.stock,
        active: v.active,
      }
      const { error: vErr } = await sb.from("product_variants").upsert(vRow, { onConflict: "sku" })
      if (vErr) throw new Error(`Migrate variant ${v.sku}: ${vErr.message}`)
      vCount++
    }
  }
  return { products: pCount, variants: vCount }
}

export { generateVariantSku }
