/**
 * Home Media — imagens para seções editoriais da home.
 *
 * Usa imagens estáticas de /public/brand/ como fallback institucional.
 * Em runtime, a home page pode enriquecer com imagens reais do catálogo.
 *
 * NÃO importa de lib/data/products.ts (catálogo local removido).
 */

const PLACEHOLDER = "/brand/placeholder-product.svg"

// Imagens institucionais estáticas — editar quando tiver fotos de campanha
const BRAND = {
  hero1: "/brand/hero-main.jpg",
  hero2: "/brand/hero-masculino.jpg",
  hero3: "/brand/hero-feminino.jpg",
  hero4: "/brand/hero-pronta-entrega.jpg",
  cat1: "/brand/cat-masculino.jpg",
  cat2: "/brand/cat-feminino.jpg",
  cat3: "/brand/cat-oversized.jpg",
}

// Helper que retorna a imagem estática ou placeholder
const s = (path: string) => path || PLACEHOLDER

export const homeMedia = {
  hero: {
    main:          { src: s(BRAND.hero1), position: "object-center" },
    masculino:     { src: s(BRAND.hero2), position: "object-center" },
    feminino:      { src: s(BRAND.hero3), position: "object-center" },
    prontaEntrega: { src: s(BRAND.hero4), position: "object-center" },
  },
  menu: {
    masculino:     { src: s(BRAND.cat1), position: "object-center" },
    feminino:      { src: s(BRAND.cat2), position: "object-center" },
    oversized:     { src: s(BRAND.cat3), position: "object-center" },
    colecoes:      { src: s(BRAND.hero1), position: "object-center" },
    promocoes:     { src: s(BRAND.hero4), position: "object-center" },
    prontaEntrega: { src: s(BRAND.hero4), position: "object-center" },
  },
  categories: {
    masculino:     { src: s(BRAND.cat1), position: "object-center" },
    feminino:      { src: s(BRAND.cat2), position: "object-center" },
    oversized:     { src: s(BRAND.cat3), position: "object-center" },
    colecoes:      { src: s(BRAND.hero1), position: "object-center" },
    lancamentos:   { src: s(BRAND.hero2), position: "object-center" },
    promocoes:     { src: s(BRAND.hero4), position: "object-center" },
    prontaEntrega: { src: s(BRAND.hero4), position: "object-center" },
  },
  collections: {
    essenciais:  { src: s(BRAND.hero4), position: "object-center" },
    saleluz:     { src: s(BRAND.hero2), position: "object-center" },
    presentear:  { src: s(BRAND.hero3), position: "object-center" },
    diaadia:     { src: s(BRAND.hero1), position: "object-center" },
  },
  lookbook: {
    oversized: { src: s(BRAND.cat3), position: "object-center" },
    casual:    { src: s(BRAND.hero1), position: "object-center" },
    feminino:  { src: s(BRAND.cat2), position: "object-center" },
  },
  banners: {
    prontaEntrega: { src: s(BRAND.hero4), position: "object-center" },
    dropSemana:    { src: s(BRAND.hero2), position: "object-center" },
  },
} as const

/**
 * Enriches homeMedia with real product images from Supabase.
 * Call from server components that have access to product data.
 */
export function enrichHomeMedia(
  productImages: Map<string, string>
): typeof homeMedia {
  const get = (slug: string, fallback: string) => productImages.get(slug) || fallback
  return {
    ...homeMedia,
    hero: {
      main:          { src: get("camiseta-fe-em-movimento", homeMedia.hero.main.src), position: "object-center" },
      masculino:     { src: get("camiseta-o-senhor-diz-ekballo", homeMedia.hero.masculino.src), position: "object-center" },
      feminino:      { src: get("camiseta-graca-diaria", homeMedia.hero.feminino.src), position: "object-center" },
      prontaEntrega: { src: get("camiseta-cristo-em-suas-linhas", homeMedia.hero.prontaEntrega.src), position: "object-center" },
    },
  }
}
