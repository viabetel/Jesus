import { products } from "@/lib/data/products"

const bySlug = (slug: string) => products.find((p) => p.slug === slug)
const img = (slug: string, index = 0, fallback = "/placeholder.jpg") =>
  bySlug(slug)?.images[index] || bySlug(slug)?.images[0] || fallback

export const homeMedia = {
  hero: {
    main: {
      src: img("camiseta-fe-em-movimento", 0),
      position: "object-center",
    },
    masculino: {
      src: img("camiseta-o-senhor-diz-ekballo", 0),
      position: "object-center",
    },
    feminino: {
      src: img("camiseta-graca-diaria", 0),
      position: "object-center",
    },
    prontaEntrega: {
      src: img("camiseta-cristo-em-suas-linhas", 0),
      position: "object-center",
    },
  },
  menu: {
    masculino: { src: img("camiseta-o-senhor-diz-ekballo", 0), position: "object-center" },
    feminino: { src: img("camiseta-graca-diaria", 0), position: "object-center" },
    oversized: { src: img("camiseta-oversized-fe-urbana", 0), position: "object-center" },
    colecoes: { src: img("camiseta-fe-em-movimento", 0), position: "object-center" },
    promocoes: { src: img("camiseta-renovado", 0), position: "object-center" },
    prontaEntrega: { src: img("camiseta-cristo-em-suas-linhas", 0), position: "object-center" },
  },
  categories: {
    masculino: { src: img("camiseta-o-senhor-diz-ekballo", 0), position: "object-center" },
    feminino: { src: img("camiseta-graca-diaria", 0), position: "object-center" },
    oversized: { src: img("camiseta-oversized-fe-urbana", 0), position: "object-center" },
    colecoes: { src: img("camiseta-fe-em-movimento", 0), position: "object-center" },
    lancamentos: { src: img("camiseta-sal-e-luz", 0), position: "object-center" },
    promocoes: { src: img("camiseta-renovado", 0), position: "object-center" },
    prontaEntrega: { src: img("camiseta-proposito", 0), position: "object-center" },
  },
  collections: {
    essenciais: { src: img("camiseta-cristo-em-suas-linhas", 0), position: "object-center" },
    saleluz: { src: img("camiseta-sal-e-luz", 0), position: "object-center" },
    presentear: { src: img("camiseta-graca-diaria", 0), position: "object-center" },
    diaadia: { src: img("camiseta-fe-em-movimento", 0), position: "object-center" },
  },
  lookbook: {
    oversized: { src: img("camiseta-oversized-fe-urbana", 0), position: "object-center" },
    casual: { src: img("camiseta-proposito", 0), position: "object-center" },
    feminino: { src: img("camiseta-graca-diaria", 0), position: "object-center" },
  },
  banners: {
    prontaEntrega: { src: img("camiseta-cristo-em-suas-linhas", 0), position: "object-center" },
    dropSemana: { src: img("camiseta-sal-e-luz", 0), position: "object-center" },
  },
} as const
