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

/**
 * Fallback mock products — only used when Supabase returns empty.
 * These use the hero-main.jpg as placeholder to maintain visual consistency.
 */
export const MOCK_PRODUCTS: FashionProduct[] = [
  { id: "m1", slug: "camiseta-fe-move-montanhas", name: "Camiseta Fé Move Montanhas", price: 89.90, parc: "3x de R$ 29,97", img: "/products/mock-camiseta-fe.jpg", badge: "Pronta Entrega", badgeKind: "olive", colors: ["#1A1A1A","#FFFFFF","#F5F1EC","#D6B581","#7B1E2B","#6D7A3F"], sizes: ["P","M","G","GG"], stock: 10, isPromotion: false, description: "Camiseta cristã com modelagem confortável." },
  { id: "m2", slug: "camiseta-graca", name: "Camiseta Graça", price: 79.90, parc: "3x de R$ 26,63", img: "/products/mock-camiseta-graca.jpg", badge: "Lançamento", badgeKind: "tan", colors: ["#FFFFFF","#1A1A1A","#F5F1EC"], sizes: ["P","M","G"], stock: 5, isPromotion: false, description: "Camiseta cristã em algodão macio." },
  { id: "m3", slug: "oversized-proposito", name: "Oversized Propósito", price: 99.90, parc: "3x de R$ 33,30", img: "/products/mock-oversized-proposito.jpg", badge: "Pronta Entrega", badgeKind: "olive", colors: ["#1A1A1A","#FFFFFF","#6D7A3F","#D6B581"], sizes: ["P","M","G","GG"], stock: 8, isPromotion: false, description: "Oversized cristã com caimento amplo." },
  { id: "m4", slug: "baby-look-sal-e-luz", name: "Baby Look Sal e Luz", price: 79.90, parc: "3x de R$ 26,63", img: "/products/mock-baby-look.jpg", badge: "Pronta Entrega", badgeKind: "olive", colors: ["#FFFFFF","#F5F1EC","#1A1A1A","#7B1E2B"], sizes: ["P","M","G"], stock: 12, isPromotion: false, description: "Baby look cristã leve e feminina." },
  { id: "m5", slug: "camiseta-essencial-cristo", name: "Camiseta Essencial Cristo", price: 69.90, parc: "3x de R$ 23,30", img: "/products/mock-camiseta-essencial.jpg", badge: "Mais Vendido", badgeKind: "tan", colors: ["#1A1A1A","#FFFFFF","#F5F1EC","#D6B581"], sizes: ["P","M","G","GG","XGG"], stock: 15, isPromotion: false, description: "Camiseta essencial com estampa cristã." },
  { id: "m6", slug: "oversized-reino", name: "Oversized Reino", price: 99.90, parc: "3x de R$ 33,30", img: "/products/mock-oversized-reino.jpg", badge: "Lançamento", badgeKind: "tan", colors: ["#1A1A1A","#FFFFFF","#6D7A3F"], sizes: ["M","G","GG"], stock: 6, isPromotion: false, description: "Oversized com estampa Reino." },
  { id: "m7", slug: "camiseta-esperanca", name: "Camiseta Esperança", price: 79.90, parc: "3x de R$ 26,63", img: "/products/mock-camiseta-esperanca.jpg", badge: "Pronta Entrega", badgeKind: "olive", colors: ["#F5F1EC","#FFFFFF","#1A1A1A","#7B1E2B"], sizes: ["P","M","G"], stock: 9, isPromotion: false, description: "Camiseta cristã com mensagem de esperança." },
  { id: "m8", slug: "baby-look-amor-maior", name: "Baby Look Amor Maior", price: 79.90, parc: "3x de R$ 26,63", img: "/products/mock-baby-amor.jpg", badge: "Pronta Entrega", badgeKind: "olive", colors: ["#FFFFFF","#1A1A1A","#F5F1EC"], sizes: ["P","M","G"], stock: 7, isPromotion: false, description: "Baby look com mensagem de amor." },
]
