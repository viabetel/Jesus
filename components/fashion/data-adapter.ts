/**
 * Fashion Store Data Adapter
 *
 * Bridges the real Supabase product model (PublicProduct)
 * to the format the FASHION components expect.
 *
 * FASHION product shape:
 *   { id, name, price, parc, img, badge, badgeKind, colors }
 *
 * Real product shape:
 *   PublicProduct from lib/services/public-catalog.ts
 */

import type { PublicProduct } from "@/lib/services/public-catalog"
import { getProductColors, getTotalStock } from "@/lib/data/products"
import { formatPrice } from "@/lib/format"

export interface FashionProduct {
  id: string
  slug: string
  name: string
  price: number
  originalPrice?: number
  parc: string
  img: string
  hoverImg?: string
  badge: string
  badgeKind: "olive" | "tan" | "promo"
  colors: string[]
  sizes: string[]
  stock: number
  isPromotion: boolean
  description: string
}

export function toFashionProduct(p: PublicProduct): FashionProduct {
  const totalStock = getTotalStock(p)
  const colors = getProductColors(p).map(c => c.value)
  const parcelas = p.price >= 30 ? 3 : 1
  const parcValue = (p.price / parcelas).toFixed(2).replace(".", ",")

  let badge = "Pronta Entrega"
  let badgeKind: "olive" | "tan" | "promo" = "olive"

  if (p.isPromotion) {
    badge = "Promoção"
    badgeKind = "promo"
  } else if (p.isNew) {
    badge = "Lançamento"
    badgeKind = "tan"
  } else if (p.isBestseller) {
    badge = "Mais Vendido"
    badgeKind = "tan"
  } else if (totalStock > 0) {
    badge = "Pronta Entrega"
    badgeKind = "olive"
  } else {
    badge = "Esgotado"
    badgeKind = "tan"
  }

  // Get sizes from variants
  const sizesSet = new Set<string>()
  for (const v of p.variants) {
    if (v.active && v.size) sizesSet.add(v.size)
  }

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    parc: parcelas > 1 ? `${parcelas}x de R$ ${parcValue}` : `R$ ${parcValue}`,
    img: p.coverImage || p.images[0] || "/brand/placeholder-product.svg",
    hoverImg: p.hoverImage || p.images[1] || undefined,
    badge,
    badgeKind,
    colors: colors.length > 0 ? colors : ["#1A1A1A", "#FFFFFF"],
    sizes: Array.from(sizesSet),
    stock: totalStock,
    isPromotion: !!p.isPromotion,
    description: p.description || "",
  }
}

// MOCK_PRODUCTS removido — catálogo vem exclusivamente do Supabase.
