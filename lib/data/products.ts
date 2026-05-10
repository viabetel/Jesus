export type ProductColor = { name: string; value: string }
export type ProductSize = "P" | "M" | "G" | "GG"
export type ProductBadge = "Novidade" | "Promoção" | "Lançamento" | "Mais vendida" | "Últimas unidades" | "Esgotado" | "Disponível"
export type ProductCategory = "Camisetas" | "Oversized" | "Baby Look" | "Moletons" | "Acessórios"
export type ProductStatus = "ativo" | "rascunho" | "oculto" | "esgotado"

export type ProductVariant = {
  sku: string
  colorName: string
  colorHex: string
  size: ProductSize
  stock: number
  active: boolean
}

export type Product = {
  id: string; name: string; slug: string; sku: string; category: ProductCategory
  status: ProductStatus
  price: number; originalPrice?: number
  variants: ProductVariant[]
  badge?: ProductBadge; description: string; details: string[]
  images: string[]; video?: string
  isNew?: boolean; isPromotion?: boolean; isBestseller?: boolean
  tags?: string[]
  /** Composição / material (ex: "100% algodão penteado 30.1") */
  composition?: string
  /** Modelagem / fit (ex: "Regular fit, gola redonda") */
  fit?: string
  /** Cuidados de lavagem */
  care?: string[]
  /** Guia de medidas por tamanho */
  sizeGuide?: { size: string; width: string; length: string }[]
}

// Computed helpers from variants
export function getProductColors(product: Product): ProductColor[] {
  const seen = new Set<string>()
  const result: ProductColor[] = []
  for (const v of product.variants) {
    if (v.active && !seen.has(v.colorName)) {
      seen.add(v.colorName)
      result.push({ name: v.colorName, value: v.colorHex })
    }
  }
  return result
}

export function getProductSizes(product: Product): ProductSize[] {
  const order: ProductSize[] = ["P", "M", "G", "GG"]
  const unique = [...new Set(product.variants.filter(v => v.active).map(v => v.size))]
  return unique.sort((a, b) => order.indexOf(a) - order.indexOf(b))
}

export function getVariantStock(product: Product, colorName: string, size: ProductSize): number {
  const v = product.variants.find(v => v.colorName === colorName && v.size === size && v.active)
  return v?.stock ?? 0
}

export function getAvailableSizesForColor(product: Product, colorName: string): ProductSize[] {
  const order: ProductSize[] = ["P", "M", "G", "GG"]
  return product.variants
    .filter(v => v.colorName === colorName && v.active && v.stock > 0)
    .map(v => v.size)
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
}

export function getAvailableColorsForSize(product: Product, size: ProductSize): ProductColor[] {
  const seen = new Set<string>()
  const result: ProductColor[] = []
  for (const v of product.variants) {
    if (v.size === size && v.active && v.stock > 0 && !seen.has(v.colorName)) {
      seen.add(v.colorName)
      result.push({ name: v.colorName, value: v.colorHex })
    }
  }
  return result
}

export function getTotalStock(product: Product): number {
  return product.variants.filter(v => v.active).reduce((sum, v) => sum + v.stock, 0)
}

export function isVariantAvailable(product: Product, colorName: string, size: ProductSize): boolean {
  return getVariantStock(product, colorName, size) > 0
}

/** SKU único da combinação (productSku-COR-TAM). Retorna null se a variante não existir. */
export function getVariantSku(product: Product, colorName: string, size: ProductSize): string | null {
  const v = product.variants.find(v => v.colorName === colorName && v.size === size && v.active)
  return v?.sku ?? null
}

// Backward compat — derived
export function getProductSizesLegacy(product: Product): ProductSize[] { return getProductSizes(product) }
export function getProductColorsLegacy(product: Product): ProductColor[] { return getProductColors(product) }

const G = (id: string) => `https://lh3.googleusercontent.com/d/${id}`

/**
 * Gera variantes com SKU único por produto.
 *   makeVariants("CAM-CRISTO", colors, sizes, stockMap)
 *   →  CAM-CRISTO-PRETO-P, CAM-CRISTO-PRETO-M, ...
 *
 * Antes era apenas COR-TAM, o que duplicava SKU entre produtos.
 */
function makeVariants(
  productSku: string,
  colors: { name: string; hex: string }[],
  sizes: ProductSize[],
  stockMap: Record<string, number>
): ProductVariant[] {
  const variants: ProductVariant[] = []
  // normaliza acentos e espaços do nome da cor para o SKU
  const slug = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toUpperCase()
  for (const color of colors) {
    for (const size of sizes) {
      const key = `${color.name}-${size}`
      variants.push({
        sku: `${productSku}-${slug(color.name)}-${size}`,
        colorName: color.name,
        colorHex: color.hex,
        size,
        stock: stockMap[key] ?? 0,
        active: true,
      })
    }
  }
  return variants
}

export const products: Product[] = [
  {
    id: "1",
    name: "Camiseta Cristo em Suas Linhas",
    slug: "camiseta-cristo-em-suas-linhas",
    sku: "CAM-CRISTO-LINHAS",
    category: "Camisetas",
    status: "ativo",
    price: 69.9,
    variants: makeVariants(
      "CAM-CRISTO-LINHAS",
      [{ name: "Preto", hex: "#000000" }, { name: "Branco", hex: "#FFFFFF" }],
      ["P", "M", "G", "GG"],
      { "Preto-P": 3, "Preto-M": 5, "Preto-G": 4, "Preto-GG": 2, "Branco-P": 2, "Branco-M": 4, "Branco-G": 3, "Branco-GG": 2 }
    ),
    badge: "Novidade",
    isNew: true,
    description: "Camiseta com estampa exclusiva 'Cristo em Suas Linhas'. Uma peça que expressa fé com estilo urbano e moderno. Perfeita para quem quer vestir uma mensagem forte no dia a dia.",
    details: ["100% algodão premium", "Estampa frente e costas", "Modelagem confortável", "Corte moderno"],
    images: [
      G("1re174Wfp11BA18NSceQz5n13bCxDNUZp"), G("16VvBqjDEDn6cbU1CCbhJ9MQ4KUMTLAAV"),
      G("1WGAvE183_FRLK1u6FL4qMOac866Mh0nc"), G("1O7WczUxEGRIHzGtglot5Hg_JroEhPHJK"),
      G("1aiOP0SWoALqWC6bQOKXzfpk1kEqVb8na"), G("1PUNJqKbzo4b83av_nnQ2MJ4Gs1ETF-35"),
    ],
    video: G("1iD7ZK04y8DMlpm622XingGWnrCevMxCR"),
    tags: ["fé", "urbano", "estampa"],
  },
  {
    id: "2",
    name: "Camiseta O Senhor Diz Ekballo",
    slug: "camiseta-o-senhor-diz-ekballo",
    sku: "CAM-EKBALLO",
    category: "Camisetas",
    status: "ativo",
    price: 74.9,
    variants: makeVariants(
      "CAM-EKBALLO",
      [{ name: "Preto", hex: "#000000" }, { name: "Off-white", hex: "#FAF9F6" }],
      ["P", "M", "G", "GG"],
      { "Preto-P": 5, "Preto-M": 8, "Preto-G": 6, "Preto-GG": 3, "Off-white-P": 4, "Off-white-M": 6, "Off-white-G": 5, "Off-white-GG": 5 }
    ),
    badge: "Mais vendida",
    isBestseller: true,
    description: "Camiseta com a mensagem 'O Senhor Diz Ekballo' — referência bíblica que significa 'lançar fora'. Uma peça marcante com estampa detalhada para quem vive sua fé com autenticidade.",
    details: ["100% algodão premium", "Estampa costas detalhada", "Mensagem bíblica", "Acabamento premium"],
    images: [
      G("1vL5CeW9Vo_PazA3MCn5_W4BxjEKDy4FW"), G("17ViSFhAdAWiDlcbt4pdEf7CG8gJ1DMb-"),
      G("1QQek_dqv1YUKIqKAvDKYYzpSmj3PhRQq"), G("1ZFmKv796opCXhOli7t4TZOy14PRPqMXS"),
      G("1Luh6RHXId_cPl0YZruThsptrw6cZOkzk"), G("1qqjZHigphLgYDQyjJEOsHsfFdWczYPq6"),
    ],
    video: G("1BWjNmQaNAffSwn7T6ezi_VMCA4PVrFS5"),
    tags: ["fé", "bíblia", "destaque"],
  },
  {
    id: "3",
    name: "Camiseta Oversized Fé Urbana",
    slug: "camiseta-oversized-fe-urbana",
    sku: "CAM-FE-URBANA-OS",
    category: "Oversized",
    status: "ativo",
    price: 89.9,
    variants: makeVariants(
      "CAM-FE-URBANA-OS",
      [{ name: "Preto", hex: "#000000" }],
      ["P", "M", "G", "GG"],
      { "Preto-P": 4, "Preto-M": 6, "Preto-G": 5, "Preto-GG": 3 }
    ),
    badge: "Lançamento",
    isNew: true,
    description: "Camiseta oversized com modelagem ampla e corte urbano. Design minimalista com mensagem cristã para quem busca conforto e estilo.",
    details: ["Modelagem oversized", "100% algodão premium", "Corte moderno e despojado", "Caimento amplo"],
    images: [
      G("1UGp98ihEA-V0zvx0MsggaCsN4mANPMQn"), G("13MZjE_F9BRyzw04jS8xryNwLjUVNeffh"),
      G("1Nj-FCcJNC6RsIRWK_4FtPHYbuR7hhGc5"), G("1HFWRCxRASjIQdwMkdh63v8y0X7JktEkN"),
      G("1eg87BJNzGmCS0PjjBuCnKcjJNjuzaDr5"), G("1oIfX6yRjhzve9qoB4vZnTqfR7gAchCU1"),
    ],
    video: G("1QCC22Qp6Cuw94S_groXuRfDKpWUtamLx"),
    tags: ["oversized", "urbano", "minimalista"],
  },
  {
    id: "4",
    name: "Camiseta Fé em Movimento",
    slug: "camiseta-fe-em-movimento",
    sku: "CAM-FE-MOVIMENTO",
    category: "Camisetas",
    status: "ativo",
    price: 79.9,
    variants: makeVariants(
      "CAM-FE-MOVIMENTO",
      [{ name: "Branco", hex: "#FFFFFF" }, { name: "Areia", hex: "#C2B280" }],
      ["P", "M", "G", "GG"],
      { "Branco-P": 3, "Branco-M": 5, "Branco-G": 4, "Branco-GG": 3, "Areia-P": 3, "Areia-M": 4, "Areia-G": 4, "Areia-GG": 4 }
    ),
    badge: "Novidade",
    isNew: true,
    description: "Para quem vive a fé em movimento. Camiseta com design moderno e tecido respirável, perfeita para o dia a dia ativo.",
    details: ["Tecido macio e respirável", "Estampa minimalista", "100% algodão", "Ideal para uso casual"],
    images: [
      G("1UNZUvuGJ2HaYc-bPgBMDhkr3zpTAkzaO"), G("1Ie_lYOZkHBPWJ8jhuIkqZBkn8apXGShy"),
      G("1w-ZFI0tNAwMSxXVPfouBAHvVEdEGdyvu"), G("1Zv6uFRLHU2mGiQ_q1iqmIfi54Fc9IHZP"),
      G("1EJN-wl6BIf3qUu3Y57Hf_WekSJdMIXsH"), G("1KonaPTY4pT2hI_f8u2OehzxBuMeAd9Or"),
    ],
    video: G("1qUB7czxoVcKLrIeifyhzcA1kBWWTjLgn"),
    tags: ["lançamento", "casual"],
  },
  {
    id: "5",
    name: "Camiseta Propósito",
    slug: "camiseta-proposito",
    sku: "CAM-PROPOSITO",
    category: "Camisetas",
    status: "ativo",
    price: 59.9,
    originalPrice: 79.9,
    variants: makeVariants(
      "CAM-PROPOSITO",
      [{ name: "Preto", hex: "#000000" }],
      ["M", "G"],
      { "Preto-M": 5, "Preto-G": 3 }
    ),
    badge: "Promoção",
    isPromotion: true,
    description: "Camiseta cristã com a mensagem 'Propósito'. Vista sua fé e aproveite o preço especial enquanto durar o estoque.",
    details: ["100% algodão", "Estampa durável", "Preço especial", "Últimas unidades"],
    images: [
      G("1B3aVUwVYnA975w74PY3us1_uHQsjjFoK"), G("1JBRvlW4eH3Ja1GWB9ypU50tLx9KX-d4B"),
      G("1CEKEaeNQCtzZuTO6JtjLn53KnyVGAOVl"), G("1u0wvAgGw5FczGh6cDMxNaNC2qQwqhSkg"),
      G("1IbsWb3tiSArxPcDtlqLtlU8H82b6z3M2"), G("1VJVXOtF7SXG-3pK7lY51RcPp1quxmqtB"),
    ],
    video: G("1-egorNu2W9eNueJb-X4i59IpRwhyaa_I"),
    tags: ["promoção", "propósito"],
  },
  {
    id: "6",
    name: "Camiseta Graça Diária",
    slug: "camiseta-graca-diaria",
    sku: "CAM-GRACA",
    category: "Camisetas",
    status: "ativo",
    price: 69.9,
    variants: makeVariants(
      "CAM-GRACA",
      [{ name: "Off-white", hex: "#FAF9F6" }, { name: "Branco", hex: "#FFFFFF" }],
      ["P", "M", "G", "GG"],
      { "Off-white-P": 2, "Off-white-M": 4, "Off-white-G": 3, "Off-white-GG": 2, "Branco-P": 2, "Branco-M": 3, "Branco-G": 3, "Branco-GG": 3 }
    ),
    badge: "Disponível",
    description: "Camiseta com a palavra 'Graça' em destaque. Uma peça elegante e versátil que comunica a essência da fé cristã com sofisticação.",
    details: ["Cor off-white sofisticada", "Estampa minimalista", "100% algodão premium", "Caimento suave"],
    images: [
      G("1BIqr6TwXxQ-8R2fm4jT02-zd3tDip4kI"), G("1HRl_vBdl3urMqNqfytYRnCWy2y5yzta8"),
      G("107RMt-RRYhj8INNLIDS-3fdWv6te3EMp"), G("1KnW4IfL8XQzx5ApeNaKbXWui1ZQKzLND"),
      G("1slJZ729oilaRwBgqCtl4XGRUI_K8HaW9"), G("19PieP1fo_nQ_Een94A_mUe1sfpOMSsyL"),
    ],
    video: G("1-cV2Lc06oBZBf3JKtu1V9oraouKVOuoL"),
    tags: ["elegante", "graça"],
  },
  {
    id: "7",
    name: "Camiseta Sal e Luz",
    slug: "camiseta-sal-e-luz",
    sku: "CAM-SAL-LUZ",
    category: "Camisetas",
    status: "ativo",
    price: 69.9,
    variants: makeVariants(
      "CAM-SAL-LUZ",
      [{ name: "Branco", hex: "#FFFFFF" }, { name: "Preto", hex: "#000000" }],
      ["P", "M", "G", "GG"],
      { "Branco-P": 4, "Branco-M": 6, "Branco-G": 5, "Branco-GG": 3, "Preto-P": 3, "Preto-M": 5, "Preto-G": 4, "Preto-GG": 5 }
    ),
    badge: "Novidade",
    isNew: true,
    description: "Baseada em Mateus 5:13-14 — 'Vós sois o sal da terra e a luz do mundo.' Para quem deseja ser exemplo através do seu estilo.",
    details: ["Referência bíblica Mateus 5", "Design minimalista", "100% algodão premium", "Disponível em 2 cores"],
    images: [
      G("1cJ2_5xITM_qckddOINQUXdV83v-_gRY5"), G("103OriRVcgV-YgVdoSK3DclH0TseiQUzX"),
      G("1i4DhwXgqDvot8FByJyJwQWbGsym5BqLw"), G("13JYdYHgJTnO6aGY-VVPuLTytwzIn5xmU"),
      G("1m2Puni7_gJ1-mSsR26fiavwnujaERrEP"), G("1LSUybr2W0Ww7E9C5X4Gc3wAGIyr3KwwO"),
    ],
    video: G("1FxddsgsjYssKdpqsqkN3kDyd7nvJ3xji"),
    tags: ["bíblia", "mateus"],
  },
  {
    id: "8",
    name: "Camiseta Renovado",
    slug: "camiseta-renovado",
    sku: "CAM-RENOVADO",
    category: "Camisetas",
    status: "ativo",
    price: 74.9,
    variants: makeVariants(
      "CAM-RENOVADO",
      [{ name: "Cinza", hex: "#808080" }, { name: "Preto", hex: "#000000" }],
      ["P", "M", "G", "GG"],
      { "Cinza-P": 3, "Cinza-M": 4, "Cinza-G": 3, "Cinza-GG": 4, "Preto-P": 3, "Preto-M": 4, "Preto-G": 4, "Preto-GG": 3 }
    ),
    badge: "Disponível",
    description: "Inspirada em 2 Coríntios 5:17 — 'Se alguém está em Cristo, nova criatura é.' Para quem vive a transformação em Cristo.",
    details: ["Referência bíblica 2 Cor 5:17", "Cor neutra versátil", "100% algodão premium", "Estampa moderna"],
    images: [
      G("1AiOyk_6YyTSeUsoUPiwri3uj4TjLs-c4"), G("1OaOk5h1tePUtzDAlu3felTNrq5x2IfX3"),
      G("1Anmz0Vw4zOeRkcxsMgPQGk7rD87uqqku"), G("1l3pvsw9wYIoBk57bnlvh4mPwNPiwsaqF"),
      G("1un5oqPkTbaQtFguhN9udJaXlo8mCbZln"), G("1bq6kO-FCZTqP99xL5ZB4xof5ZdSnNEHk"),
    ],
    video: G("1ueoVaxCbHHTsgbidf0S7DY2laQ9wcr-v"),
    tags: ["bíblia", "transformação"],
  },
]

// Active products only
export function getActiveProducts(): Product[] {
  return products.filter(p => p.status === "ativo" && getTotalStock(p) > 0)
}

export const categories: { name: ProductCategory; slug: string; description: string }[] = [
  { name: "Camisetas", slug: "camisetas", description: "Mensagens de fé com estilo" },
  { name: "Oversized", slug: "oversized", description: "Estilo urbano e conforto" },
  { name: "Baby Look", slug: "baby-look", description: "Modelagem feminina" },
  { name: "Moletons", slug: "moletons", description: "Pra dias mais frios" },
  { name: "Acessórios", slug: "acessorios", description: "Complementos de fé" },
]

export const sizeChart = [
  { size: "P", width: "50cm", length: "68cm", sleeve: "20cm" },
  { size: "M", width: "52cm", length: "70cm", sleeve: "21cm" },
  { size: "G", width: "54cm", length: "72cm", sleeve: "22cm" },
  { size: "GG", width: "58cm", length: "74cm", sleeve: "23cm" },
]

export function getProductBySlug(slug: string) { return products.find((p) => p.slug === slug) }
export function getProductsByCategory(cat: ProductCategory) { return products.filter((p) => p.category === cat && p.status === "ativo") }
export function getNewProducts() { return products.filter((p) => p.isNew && p.status === "ativo") }
export function getPromotionProducts() { return products.filter((p) => p.isPromotion && p.status === "ativo") }
export function getFeaturedProducts() { return products.filter((p) => (p.isBestseller || p.isNew) && p.status === "ativo").slice(0, 4) }
