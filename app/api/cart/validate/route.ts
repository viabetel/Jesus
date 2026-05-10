import { NextResponse } from "next/server"
import { getProductById } from "@/lib/services/products-repo"
import { getVariantAvailableStock } from "@/lib/services/orders"

/**
 * POST /api/cart/validate — PÚBLICO (usado pela sacola do cliente)
 *
 * Recebe: { items: [{ productId, variantSku, quantity }] }
 * Retorna: para cada item, dados atuais do produto + disponibilidade
 *
 * Se o produto foi removido, status virou oculto, variante inativa,
 * ou estoque insuficiente, sinaliza com flags pra UI exibir avisos.
 */

type CartItemInput = {
  productId: string
  variantSku: string
  quantity: number
  lastSeenPrice?: number
}

type ValidatedItem = {
  productId: string
  variantSku: string
  requestedQuantity: number
  /** null se o produto não existe mais */
  product: {
    name: string
    slug: string
    price: number
    originalPrice?: number
    image: string
    status: string
  } | null
  variant: {
    colorName: string
    colorHex: string
    size: string
    active: boolean
  } | null
  availableStock: number
  maxQuantity: number
  /** mensagens de alerta pra exibir na sacola */
  warnings: string[]
  /** item deve ser removido automaticamente? */
  shouldRemove: boolean
  /** preço mudou desde o localStorage? */
  priceChanged: boolean
}

export async function POST(request: Request) {
  let body: { items?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  if (!Array.isArray(body.items)) {
    return NextResponse.json({ error: "items obrigatório" }, { status: 400 })
  }

  const items = body.items as CartItemInput[]
  const results: ValidatedItem[] = []

  for (const item of items) {
    const warnings: string[] = []
    let shouldRemove = false
    let priceChanged = false

    // Busca produto atual
    const product = await getProductById(item.productId)
    if (!product) {
      results.push({
        productId: item.productId,
        variantSku: item.variantSku,
        requestedQuantity: item.quantity,
        product: null,
        variant: null,
        availableStock: 0,
        maxQuantity: 0,
        warnings: ["Produto não encontrado ou foi removido."],
        shouldRemove: true,
        priceChanged: false,
      })
      continue
    }

    // Produto inativo
    if (product.status !== "ativo") {
      warnings.push(`Produto "${product.name}" está ${product.status}.`)
      shouldRemove = true
    }

    // Busca variante
    const variant = product.variants.find(v => v.sku === item.variantSku)
    if (!variant) {
      results.push({
        productId: item.productId,
        variantSku: item.variantSku,
        requestedQuantity: item.quantity,
        product: {
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images[0] ?? "",
          status: product.status,
        },
        variant: null,
        availableStock: 0,
        maxQuantity: 0,
        warnings: ["Variante não encontrada. Pode ter sido desativada."],
        shouldRemove: true,
        priceChanged: false,
      })
      continue
    }

    if (!variant.active) {
      warnings.push("Variante desativada.")
      shouldRemove = true
    }

    // Estoque disponível (considerando reservas)
    let availableStock = variant.stock
    try {
      availableStock = await getVariantAvailableStock(item.productId, item.variantSku)
    } catch {
      // Se falhar (sem Supabase), usa stock bruto da variante
    }

    const maxQuantity = shouldRemove ? 0 : availableStock

    if (!shouldRemove && availableStock === 0) {
      warnings.push(`"${product.name}" (${variant.colorName} ${variant.size}) esgotou.`)
      shouldRemove = true
    } else if (!shouldRemove && item.quantity > availableStock) {
      warnings.push(`Quantidade ajustada de ${item.quantity} para ${availableStock}.`)
    }

    // Comparar preço atual com snapshot salvo no carrinho
    if (!shouldRemove && typeof item.lastSeenPrice === "number" && item.lastSeenPrice !== product.price) {
      priceChanged = true
      const dir = product.price > item.lastSeenPrice ? "subiu" : "baixou"
      warnings.push(`Preço ${dir}: era R$ ${item.lastSeenPrice.toFixed(2)}, agora R$ ${product.price.toFixed(2)}.`)
    }

    results.push({
      productId: item.productId,
      variantSku: item.variantSku,
      requestedQuantity: item.quantity,
      product: {
        name: product.name,
        slug: product.slug,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0] ?? "",
        status: product.status,
      },
      variant: variant
        ? { colorName: variant.colorName, colorHex: variant.colorHex, size: variant.size, active: variant.active }
        : null,
      availableStock,
      maxQuantity,
      warnings,
      shouldRemove,
      priceChanged,
    })
  }

  return NextResponse.json({ items: results })
}
