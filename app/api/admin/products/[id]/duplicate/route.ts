import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth/admin"
import { getProductById, createProduct, upsertVariant, type ProductInput } from "@/lib/services/products-repo"
import { getProductMedia, addMedia } from "@/lib/services/media-repo"

type Ctx = { params: Promise<{ id: string }> }

/**
 * POST /api/admin/products/[id]/duplicate
 *
 * Duplica um produto com novo slug e SKU. Salva como rascunho.
 * Body opcional: { copyStock?: boolean, copyMedia?: boolean }
 *
 * copyMedia (default true): copia toda a product_media (geral + por cor).
 * As URLs são mantidas (apontam pro mesmo arquivo no storage).
 * storage_path é limpo pra evitar que delete no original apague no clone.
 */
export async function POST(request: Request, { params }: Ctx) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 })

  let body: { copyStock?: boolean; copyMedia?: boolean } = {}
  try { body = await request.json() } catch { /* sem body, defaults */ }

  const copyMedia = body.copyMedia !== false // default true

  const timestamp = Date.now().toString(36).slice(-4)
  const newSlug = `${product.slug}-copia-${timestamp}`
  const newSku = `${product.sku}-COPIA-${timestamp.toUpperCase()}`

  const input: ProductInput = {
    slug: newSlug,
    sku: newSku,
    name: `${product.name} (cópia)`,
    category: product.category,
    status: "rascunho",
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    badge: product.badge ?? null,
    description: product.description,
    details: product.details,
    images: product.images,
    video: product.video ?? null,
    isNew: false,
    isPromotion: product.isPromotion,
    isBestseller: false,
    tags: product.tags,
    composition: product.composition ?? null,
    fit: product.fit ?? null,
    care: product.care ?? null,
    sizeGuide: product.sizeGuide ?? null,
  }

  const result = await createProduct(input)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  const newProduct = result.data
  let variantsCopied = 0
  let mediaCopied = 0

  // Copiar variantes
  for (const v of product.variants) {
    const colorSlug = v.colorName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toUpperCase()
    const res = await upsertVariant({
      sku: `${newSku}-${colorSlug}-${v.size}`,
      productId: newProduct.id,
      colorName: v.colorName,
      colorHex: v.colorHex,
      size: v.size,
      stock: body.copyStock ? v.stock : 0,
      active: v.active,
    })
    if (res.ok) variantsCopied++
  }

  // Copiar mídia (geral + por cor)
  if (copyMedia) {
    try {
      const allMedia = await getProductMedia(id)
      for (const m of allMedia) {
        const res = await addMedia({
          productId: newProduct.id,
          url: m.url,
          storagePath: null, // Limpa storage_path pra não linkar ao original
          kind: m.kind,
          role: m.role,
          alt: m.alt,
          sortOrder: m.sortOrder,
          colorKey: m.colorKey,
          colorName: m.colorName,
          colorHex: m.colorHex,
          variantSku: null, // SKUs são diferentes no clone
        })
        if (res.ok) mediaCopied++
      }
    } catch {
      // Mídia é best-effort — não bloqueia a duplicação
    }
  }

  return NextResponse.json({
    ok: true,
    productId: newProduct.id,
    slug: newSlug,
    message: `Duplicado: ${newProduct.name} (${variantsCopied} variantes, ${mediaCopied} mídias)`,
  }, { status: 201 })
}
