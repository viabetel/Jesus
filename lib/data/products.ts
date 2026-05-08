export type MediaItem = {
  type: "image" | "video"
  role: "cover" | "hover" | "front" | "back" | "detail" | "model" | "lifestyle" | "video"
  url: string
  thumbnail?: string
  alt: string
}

export type ProductMedia = {
  cover: string
  hover?: string
  gallery: MediaItem[]
}

export type ProductColor = { name: string; value: string }
export type ProductSize = "P" | "M" | "G" | "GG"
export type ProductCategory = "Camisetas cristãs" | "Tradicionais" | "Oversized" | "Lançamentos" | "Promoções"

export type Product = {
  id: string; name: string; slug: string; category: ProductCategory
  price: number; originalPrice?: number
  sizes: ProductSize[]; colors: ProductColor[]
  badge?: string; description: string; details: string[]
  media: ProductMedia
  isNew?: boolean; isPromotion?: boolean; isBestseller?: boolean; stock: number
}

const G = (id: string) => `https://lh3.googleusercontent.com/d/${id}`
const V = (id: string) => `https://drive.google.com/file/d/${id}/preview`

function img(id: string, role: MediaItem["role"], alt: string): MediaItem {
  return { type: "image", role, url: G(id), alt }
}
function vid(id: string, coverId: string, alt: string): MediaItem {
  return { type: "video", role: "video", url: V(id), thumbnail: G(coverId), alt }
}

export const products: Product[] = [
  {
    id: "1",
    name: "Camiseta Cristo em Suas Linhas",
    slug: "camiseta-cristo-em-suas-linhas",
    category: "Camisetas cristãs",
    price: 69.9,
    sizes: ["P", "M", "G", "GG"],
    colors: [{ name: "Preto", value: "#000000" }, { name: "Branco", value: "#FFFFFF" }],
    badge: "Novidade", isNew: true,
    description: "Estampa exclusiva 'Cristo em Suas Linhas'. Expressa fé com estilo urbano e moderno.",
    details: ["100% algodão premium", "Estampa frente e costas", "Modelagem confortável", "Corte moderno"],
    media: {
      cover: G("1re174Wfp11BA18NSceQz5n13bCxDNUZp"),
      hover: G("16VvBqjDEDn6cbU1CCbhJ9MQ4KUMTLAAV"),
      gallery: [
        img("1re174Wfp11BA18NSceQz5n13bCxDNUZp", "cover", "Cristo em Suas Linhas — Capa"),
        vid("1iD7ZK04y8DMlpm622XingGWnrCevMxCR", "1re174Wfp11BA18NSceQz5n13bCxDNUZp", "Vídeo da camiseta"),
        img("1WGAvE183_FRLK1u6FL4qMOac866Mh0nc", "model", "Foto no corpo"),
        img("1O7WczUxEGRIHzGtglot5Hg_JroEhPHJK", "back", "Costas"),
        img("1aiOP0SWoALqWC6bQOKXzfpk1kEqVb8na", "detail", "Detalhe estampa"),
        img("1PUNJqKbzo4b83av_nnQ2MJ4Gs1ETF-35", "lifestyle", "Lifestyle"),
      ],
    },
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
    badge: "Mais vendida", isBestseller: true,
    description: "Referência bíblica 'Ekballo' — lançar fora. Estampa detalhada para quem vive a fé com autenticidade.",
    details: ["100% algodão premium", "Estampa costas detalhada", "Mensagem bíblica", "Acabamento premium"],
    media: {
      cover: G("1vL5CeW9Vo_PazA3MCn5_W4BxjEKDy4FW"),
      hover: G("17ViSFhAdAWiDlcbt4pdEf7CG8gJ1DMb-"),
      gallery: [
        img("1vL5CeW9Vo_PazA3MCn5_W4BxjEKDy4FW", "cover", "Ekballo — Capa"),
        vid("1BWjNmQaNAffSwn7T6ezi_VMCA4PVrFS5", "1vL5CeW9Vo_PazA3MCn5_W4BxjEKDy4FW", "Vídeo"),
        img("1QQek_dqv1YUKIqKAvDKYYzpSmj3PhRQq", "back", "Costas"),
        img("1ZFmKv796opCXhOli7t4TZOy14PRPqMXS", "model", "Foto no corpo"),
        img("1Luh6RHXId_cPl0YZruThsptrw6cZOkzk", "detail", "Detalhe"),
        img("1qqjZHigphLgYDQyjJEOsHsfFdWczYPq6", "lifestyle", "Lifestyle"),
      ],
    },
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
    badge: "Lançamento", isNew: true,
    description: "Oversized com corte urbano. Mensagem cristã para quem busca conforto e estilo.",
    details: ["Modelagem oversized", "100% algodão premium", "Corte despojado", "Caimento amplo"],
    media: {
      cover: G("1UGp98ihEA-V0zvx0MsggaCsN4mANPMQn"),
      hover: G("13MZjE_F9BRyzw04jS8xryNwLjUVNeffh"),
      gallery: [
        img("1UGp98ihEA-V0zvx0MsggaCsN4mANPMQn", "cover", "Fé Urbana — Capa"),
        vid("1QCC22Qp6Cuw94S_groXuRfDKpWUtamLx", "1UGp98ihEA-V0zvx0MsggaCsN4mANPMQn", "Vídeo"),
        img("1Nj-FCcJNC6RsIRWK_4FtPHYbuR7hhGc5", "back", "Costas"),
        img("1HFWRCxRASjIQdwMkdh63v8y0X7JktEkN", "model", "Modelo"),
        img("1eg87BJNzGmCS0PjjBuCnKcjJNjuzaDr5", "detail", "Detalhe"),
        img("1oIfX6yRjhzve9qoB4vZnTqfR7gAchCU1", "lifestyle", "Lifestyle"),
      ],
    },
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
    badge: "Novidade", isNew: true,
    description: "Para quem vive a fé em movimento. Design moderno e tecido respirável.",
    details: ["Tecido macio", "Estampa minimalista", "100% algodão", "Uso casual"],
    media: {
      cover: G("1UNZUvuGJ2HaYc-bPgBMDhkr3zpTAkzaO"),
      hover: G("1Ie_lYOZkHBPWJ8jhuIkqZBkn8apXGShy"),
      gallery: [
        img("1UNZUvuGJ2HaYc-bPgBMDhkr3zpTAkzaO", "cover", "Fé em Movimento — Capa"),
        vid("1qUB7czxoVcKLrIeifyhzcA1kBWWTjLgn", "1UNZUvuGJ2HaYc-bPgBMDhkr3zpTAkzaO", "Vídeo"),
        img("1w-ZFI0tNAwMSxXVPfouBAHvVEdEGdyvu", "model", "Modelo"),
        img("1Zv6uFRLHU2mGiQ_q1iqmIfi54Fc9IHZP", "back", "Costas"),
        img("1EJN-wl6BIf3qUu3Y57Hf_WekSJdMIXsH", "detail", "Detalhe"),
        img("1KonaPTY4pT2hI_f8u2OehzxBuMeAd9Or", "lifestyle", "Lifestyle"),
      ],
    },
    stock: 30,
  },
  {
    id: "5",
    name: "Camiseta Propósito",
    slug: "camiseta-proposito",
    category: "Promoções",
    price: 59.9, originalPrice: 79.9,
    sizes: ["M", "G"],
    colors: [{ name: "Preto", value: "#000000" }],
    badge: "Promoção", isPromotion: true,
    description: "Vista sua fé com a mensagem 'Propósito'. Preço especial por tempo limitado.",
    details: ["100% algodão", "Estampa durável", "Preço especial", "Últimas unidades"],
    media: {
      cover: G("1B3aVUwVYnA975w74PY3us1_uHQsjjFoK"),
      hover: G("1JBRvlW4eH3Ja1GWB9ypU50tLx9KX-d4B"),
      gallery: [
        img("1B3aVUwVYnA975w74PY3us1_uHQsjjFoK", "cover", "Propósito — Capa"),
        vid("1-egorNu2W9eNueJb-X4i59IpRwhyaa_I", "1B3aVUwVYnA975w74PY3us1_uHQsjjFoK", "Vídeo"),
        img("1CEKEaeNQCtzZuTO6JtjLn53KnyVGAOVl", "back", "Costas"),
        img("1u0wvAgGw5FczGh6cDMxNaNC2qQwqhSkg", "model", "Modelo"),
        img("1IbsWb3tiSArxPcDtlqLtlU8H82b6z3M2", "detail", "Detalhe"),
      ],
    },
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
    description: "A palavra 'Graça' em destaque. Elegante e versátil para expressar fé com sofisticação.",
    details: ["Off-white sofisticada", "Estampa minimalista", "100% algodão premium", "Caimento suave"],
    media: {
      cover: G("1BIqr6TwXxQ-8R2fm4jT02-zd3tDip4kI"),
      hover: G("1HRl_vBdl3urMqNqfytYRnCWy2y5yzta8"),
      gallery: [
        img("1BIqr6TwXxQ-8R2fm4jT02-zd3tDip4kI", "cover", "Graça — Capa"),
        vid("1-cV2Lc06oBZBf3JKtu1V9oraouKVOuoL", "1BIqr6TwXxQ-8R2fm4jT02-zd3tDip4kI", "Vídeo"),
        img("107RMt-RRYhj8INNLIDS-3fdWv6te3EMp", "model", "Modelo"),
        img("1KnW4IfL8XQzx5ApeNaKbXWui1ZQKzLND", "back", "Costas"),
        img("1slJZ729oilaRwBgqCtl4XGRUI_K8HaW9", "detail", "Detalhe"),
      ],
    },
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
    badge: "Novidade", isNew: true,
    description: "Mateus 5:13-14 — 'Vós sois o sal da terra e a luz do mundo.' Exemplo pelo estilo.",
    details: ["Referência Mateus 5", "Design minimalista", "100% algodão premium", "2 cores"],
    media: {
      cover: G("1cJ2_5xITM_qckddOINQUXdV83v-_gRY5"),
      hover: G("103OriRVcgV-YgVdoSK3DclH0TseiQUzX"),
      gallery: [
        img("1cJ2_5xITM_qckddOINQUXdV83v-_gRY5", "cover", "Sal e Luz — Capa"),
        vid("1FxddsgsjYssKdpqsqkN3kDyd7nvJ3xji", "1cJ2_5xITM_qckddOINQUXdV83v-_gRY5", "Vídeo"),
        img("1i4DhwXgqDvot8FByJyJwQWbGsym5BqLw", "back", "Costas"),
        img("13JYdYHgJTnO6aGY-VVPuLTytwzIn5xmU", "model", "Modelo"),
        img("1m2Puni7_gJ1-mSsR26fiavwnujaERrEP", "detail", "Detalhe"),
      ],
    },
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
    description: "2 Coríntios 5:17 — 'Se alguém está em Cristo, nova criatura é.' Transformação em Cristo.",
    details: ["Referência 2 Cor 5:17", "Cor neutra versátil", "100% algodão premium", "Estampa moderna"],
    media: {
      cover: G("1AiOyk_6YyTSeUsoUPiwri3uj4TjLs-c4"),
      hover: G("1OaOk5h1tePUtzDAlu3felTNrq5x2IfX3"),
      gallery: [
        img("1AiOyk_6YyTSeUsoUPiwri3uj4TjLs-c4", "cover", "Renovado — Capa"),
        vid("1ueoVaxCbHHTsgbidf0S7DY2laQ9wcr-v", "1AiOyk_6YyTSeUsoUPiwri3uj4TjLs-c4", "Vídeo"),
        img("1Anmz0Vw4zOeRkcxsMgPQGk7rD87uqqku", "back", "Costas"),
        img("1l3pvsw9wYIoBk57bnlvh4mPwNPiwsaqF", "model", "Modelo"),
        img("1un5oqPkTbaQtFguhN9udJaXlo8mCbZln", "detail", "Detalhe"),
      ],
    },
    stock: 28,
  },
]

export const categories = [
  { name: "Camisetas cristãs" as const, slug: "camisetas-cristas", description: "Mensagens de fé" },
  { name: "Tradicionais" as const, slug: "tradicionais", description: "Clássicas e versáteis" },
  { name: "Oversized" as const, slug: "oversized", description: "Estilo urbano" },
  { name: "Lançamentos" as const, slug: "lancamentos", description: "Novidades da semana" },
  { name: "Promoções" as const, slug: "promocoes", description: "Ofertas especiais" },
]

export const sizeChart = [
  { size: "P", width: "50cm", length: "68cm", sleeve: "20cm" },
  { size: "M", width: "52cm", length: "70cm", sleeve: "21cm" },
  { size: "G", width: "54cm", length: "72cm", sleeve: "22cm" },
  { size: "GG", width: "58cm", length: "74cm", sleeve: "23cm" },
]

export function getProductBySlug(slug: string) { return products.find((p) => p.slug === slug) }
export function getNewProducts() { return products.filter((p) => p.isNew) }
export function getPromotionProducts() { return products.filter((p) => p.isPromotion) }
export function getFeaturedProducts() { return products.filter((p) => p.isBestseller || p.isNew).slice(0, 4) }
export function getLowStockProducts() { return products.filter((p) => p.stock > 0 && p.stock <= 10) }
export function hasVideo(p: Product) { return p.media.gallery.some((m) => m.type === "video") }
