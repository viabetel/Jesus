export type ProductColor = { name: string; value: string }
export type ProductSize = "P" | "M" | "G" | "GG"
export type ProductBadge = "Novidade" | "Promoção" | "Lançamento" | "Mais vendida" | "Últimas unidades" | "Esgotado" | "Disponível"
export type ProductCategory = "Camisetas cristãs" | "Tradicionais" | "Oversized" | "Lançamentos" | "Promoções"

export type Product = {
  id: string; name: string; slug: string; category: ProductCategory
  price: number; originalPrice?: number
  sizes: ProductSize[]; colors: ProductColor[]
  badge?: ProductBadge; description: string; details: string[]
  images: string[]; video?: string
  isNew?: boolean; isPromotion?: boolean; isBestseller?: boolean; stock: number
}

const G = (id: string) => `https://lh3.googleusercontent.com/d/${id}`

export const products: Product[] = [
  {
    id: "1",
    name: "Camiseta Cristo em Suas Linhas",
    slug: "camiseta-cristo-em-suas-linhas",
    category: "Camisetas cristãs",
    price: 69.9,
    sizes: ["P", "M", "G", "GG"],
    colors: [{ name: "Preto", value: "#000000" }, { name: "Branco", value: "#FFFFFF" }],
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
    stock: 25,
  },
  {
    id: "2",
    name: "Camiseta O Senhor Diz Ekballo",
    slug: "camiseta-o-senhor-diz-ekballo",
    category: "Tradicionais",
    price: 74.9,
    sizes: ["P", "M", "G", "GG"],
    colors: [{ name: "Preto", value: "#000000" }, { name: "Off-white", value: "#FAF9F6" }],
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
    stock: 42,
  },
  {
    id: "3",
    name: "Camiseta Oversized Fé Urbana",
    slug: "camiseta-oversized-fe-urbana",
    category: "Oversized",
    price: 89.9,
    sizes: ["P", "M", "G", "GG"],
    colors: [{ name: "Preto", value: "#000000" }],
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
    stock: 18,
  },
  {
    id: "4",
    name: "Camiseta Fé em Movimento",
    slug: "camiseta-fe-em-movimento",
    category: "Lançamentos",
    price: 79.9,
    sizes: ["P", "M", "G", "GG"],
    colors: [{ name: "Branco", value: "#FFFFFF" }, { name: "Areia", value: "#C2B280" }],
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
    stock: 30,
  },
  {
    id: "5",
    name: "Camiseta Propósito",
    slug: "camiseta-proposito",
    category: "Promoções",
    price: 59.9,
    originalPrice: 79.9,
    sizes: ["M", "G"],
    colors: [{ name: "Preto", value: "#000000" }],
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
    stock: 8,
  },
  {
    id: "6",
    name: "Camiseta Graça Diária",
    slug: "camiseta-graca-diaria",
    category: "Camisetas cristãs",
    price: 69.9,
    sizes: ["P", "M", "G", "GG"],
    colors: [{ name: "Off-white", value: "#FAF9F6" }, { name: "Branco", value: "#FFFFFF" }],
    badge: "Disponível",
    description: "Camiseta com a palavra 'Graça' em destaque. Uma peça elegante e versátil que comunica a essência da fé cristã com sofisticação.",
    details: ["Cor off-white sofisticada", "Estampa minimalista", "100% algodão premium", "Caimento suave"],
    images: [
      G("1BIqr6TwXxQ-8R2fm4jT02-zd3tDip4kI"), G("1HRl_vBdl3urMqNqfytYRnCWy2y5yzta8"),
      G("107RMt-RRYhj8INNLIDS-3fdWv6te3EMp"), G("1KnW4IfL8XQzx5ApeNaKbXWui1ZQKzLND"),
      G("1slJZ729oilaRwBgqCtl4XGRUI_K8HaW9"), G("19PieP1fo_nQ_Een94A_mUe1sfpOMSsyL"),
    ],
    video: G("1-cV2Lc06oBZBf3JKtu1V9oraouKVOuoL"),
    stock: 22,
  },
  {
    id: "7",
    name: "Camiseta Sal e Luz",
    slug: "camiseta-sal-e-luz",
    category: "Camisetas cristãs",
    price: 69.9,
    sizes: ["P", "M", "G", "GG"],
    colors: [{ name: "Branco", value: "#FFFFFF" }, { name: "Preto", value: "#000000" }],
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
    stock: 35,
  },
  {
    id: "8",
    name: "Camiseta Renovado",
    slug: "camiseta-renovado",
    category: "Tradicionais",
    price: 74.9,
    sizes: ["P", "M", "G", "GG"],
    colors: [{ name: "Cinza", value: "#808080" }, { name: "Preto", value: "#000000" }],
    badge: "Disponível",
    description: "Inspirada em 2 Coríntios 5:17 — 'Se alguém está em Cristo, nova criatura é.' Para quem vive a transformação em Cristo.",
    details: ["Referência bíblica 2 Cor 5:17", "Cor neutra versátil", "100% algodão premium", "Estampa moderna"],
    images: [
      G("1AiOyk_6YyTSeUsoUPiwri3uj4TjLs-c4"), G("1OaOk5h1tePUtzDAlu3felTNrq5x2IfX3"),
      G("1Anmz0Vw4zOeRkcxsMgPQGk7rD87uqqku"), G("1l3pvsw9wYIoBk57bnlvh4mPwNPiwsaqF"),
      G("1un5oqPkTbaQtFguhN9udJaXlo8mCbZln"), G("1bq6kO-FCZTqP99xL5ZB4xof5ZdSnNEHk"),
    ],
    video: G("1ueoVaxCbHHTsgbidf0S7DY2laQ9wcr-v"),
    stock: 28,
  },
]

export const categories: { name: ProductCategory; slug: string; description: string }[] = [
  { name: "Camisetas cristãs", slug: "camisetas-cristas", description: "Mensagens de fé" },
  { name: "Tradicionais", slug: "tradicionais", description: "Clássicas e versáteis" },
  { name: "Oversized", slug: "oversized", description: "Estilo urbano" },
  { name: "Lançamentos", slug: "lancamentos", description: "Novidades da semana" },
  { name: "Promoções", slug: "promocoes", description: "Ofertas especiais" },
]

export const sizeChart = [
  { size: "P", width: "50cm", length: "68cm", sleeve: "20cm" },
  { size: "M", width: "52cm", length: "70cm", sleeve: "21cm" },
  { size: "G", width: "54cm", length: "72cm", sleeve: "22cm" },
  { size: "GG", width: "58cm", length: "74cm", sleeve: "23cm" },
]

export function getProductBySlug(slug: string) { return products.find((p) => p.slug === slug) }
export function getProductsByCategory(cat: ProductCategory) { return products.filter((p) => p.category === cat) }
export function getNewProducts() { return products.filter((p) => p.isNew) }
export function getPromotionProducts() { return products.filter((p) => p.isPromotion) }
export function getFeaturedProducts() { return products.filter((p) => p.isBestseller || p.isNew).slice(0, 4) }
