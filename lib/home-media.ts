/**
 * Home Media — imagens editoriais da home/menu.
 * Usa imagens reais de /public/hero/, /public/categories/, /public/menu/.
 * NÃO importa de lib/data/products.ts.
 */

const P = "/brand/placeholder-product.svg"

export const homeMedia = {
  hero: {
    main:          { src: "/hero/hero-main.jpg",           position: "object-center" },
    masculino:     { src: "/hero/hero-masculino.jpg",      position: "object-center" },
    feminino:      { src: "/hero/hero-feminino.jpg",       position: "object-center" },
    prontaEntrega: { src: "/hero/hero-pronta-entrega.jpg", position: "object-center" },
  },
  menu: {
    masculino:     { src: "/menu/mega-masculino.jpg",      position: "object-center" },
    feminino:      { src: "/menu/mega-feminino.jpg",       position: "object-center" },
    oversized:     { src: "/menu/mega-oversized.jpg",      position: "object-center" },
    colecoes:      { src: "/menu/mega-colecoes.jpg",       position: "object-center" },
    promocoes:     { src: "/menu/mega-promocoes.jpg",      position: "object-center" },
    prontaEntrega: { src: "/menu/mega-pronta-entrega.jpg", position: "object-center" },
  },
  categories: {
    masculino:     { src: "/categories/masculino.jpg",     position: "object-center" },
    feminino:      { src: "/categories/feminino.jpg",      position: "object-center" },
    oversized:     { src: "/categories/oversized.jpg",     position: "object-center" },
    colecoes:      { src: "/categories/colecoes.jpg",      position: "object-center" },
    lancamentos:   { src: "/categories/lancamentos.jpg",   position: "object-center" },
    promocoes:     { src: "/categories/promocoes.jpg",     position: "object-center" },
    prontaEntrega: { src: "/categories/pronta-entrega.jpg",position: "object-center" },
  },
  collections: {
    essenciais:  { src: "/hero/hero-pronta-entrega.jpg",   position: "object-center" },
    saleluz:     { src: "/hero/hero-masculino.jpg",        position: "object-center" },
    presentear:  { src: "/hero/hero-feminino.jpg",         position: "object-center" },
    diaadia:     { src: "/hero/hero-main.jpg",             position: "object-center" },
  },
  lookbook: {
    oversized: { src: "/hero/hero-oversized.jpg",          position: "object-center" },
    casual:    { src: "/hero/hero-main.jpg",               position: "object-center" },
    feminino:  { src: "/hero/hero-feminino.jpg",           position: "object-center" },
  },
  banners: {
    prontaEntrega: { src: "/hero/hero-pronta-entrega.jpg", position: "object-center" },
    dropSemana:    { src: "/hero/hero-masculino.jpg",      position: "object-center" },
  },
} as const
