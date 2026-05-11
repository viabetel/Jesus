import { homeMedia } from "@/lib/home-media"

/**
 * Catalog Menu — Commercial Edition (links reais)
 *
 * Cada link aponta para parâmetros que products-content.tsx realmente lê.
 * Parâmetros suportados:
 *   - categoria=<slug>      → filtra por categoria ou flag especial
 *   - busca=<texto>         → busca textual
 *   - destaque=<flag>       → mais-vendidos | pronta-entrega | ultimas-unidades
 *   - tamanho=<P|M|G|GG>   → pré-seleciona tamanho
 *   - cor=<nome>            → pré-seleciona cor
 *   - preco_max=<valor>     → teto de preço
 *
 * NÃO usar: colecao=, intencao= (dados não existem no modelo)
 */

export interface MenuLink {
  name: string
  href: string
  badge?: string
}

export interface MenuSection {
  title: string
  links: MenuLink[]
}

export interface MegaMenuFeatured {
  title: string
  subtitle: string
  cta: string
  href: string
  image: string
  eyebrow?: string
}

export interface MegaMenuItem {
  label: string
  href: string
  highlight?: "promo" | "fast"
  sections: MenuSection[]
  featured?: MegaMenuFeatured
}

// ─── Main Catalog Menu ───

export const catalogMenu: MegaMenuItem[] = [
  {
    label: "Masculino",
    href: "/produtos?categoria=camisetas",
    sections: [
      {
        title: "Comprar",
        links: [
          { name: "Todas as camisetas", href: "/produtos?categoria=camisetas" },
          { name: "Mais vendidas", href: "/produtos?categoria=camisetas&destaque=mais-vendidos" },
          { name: "Lançamentos", href: "/produtos?categoria=lancamentos", badge: "Novo" },
          { name: "Em promoção", href: "/produtos?categoria=promocoes" },
        ],
      },
      {
        title: "Por tamanho",
        links: [
          { name: "Tamanho P", href: "/produtos?categoria=camisetas&tamanho=P" },
          { name: "Tamanho M", href: "/produtos?categoria=camisetas&tamanho=M" },
          { name: "Tamanho G", href: "/produtos?categoria=camisetas&tamanho=G" },
          { name: "Tamanho GG", href: "/produtos?categoria=camisetas&tamanho=GG" },
        ],
      },
    ],
    featured: {
      image: homeMedia.menu.masculino.src,
      eyebrow: "NOVO DROP",
      title: "Linha masculina com propósito",
      subtitle: "Camisetas cristãs masculinas para vestir sua fé no dia a dia.",
      cta: "Ver masculino",
      href: "/produtos?categoria=camisetas",
    },
  },
  {
    label: "Oversized",
    href: "/produtos?categoria=oversized",
    sections: [
      {
        title: "Comprar",
        links: [
          { name: "Todas oversized", href: "/produtos?categoria=oversized" },
          { name: "Mais vendidas", href: "/produtos?categoria=oversized&destaque=mais-vendidos" },
          { name: "Novidades", href: "/produtos?categoria=lancamentos", badge: "Novo" },
        ],
      },
      {
        title: "Por tamanho",
        links: [
          { name: "Tamanho P", href: "/produtos?categoria=oversized&tamanho=P" },
          { name: "Tamanho M", href: "/produtos?categoria=oversized&tamanho=M" },
          { name: "Tamanho G", href: "/produtos?categoria=oversized&tamanho=G" },
          { name: "Tamanho GG", href: "/produtos?categoria=oversized&tamanho=GG" },
        ],
      },
    ],
    featured: {
      image: homeMedia.menu.oversized.src,
      eyebrow: "STREETWEAR",
      title: "Modelagem oversized",
      subtitle: "Caimento amplo, confortável e urbano.",
      cta: "Ver oversized",
      href: "/produtos?categoria=oversized",
    },
  },
  {
    label: "Feminino",
    href: "/produtos?categoria=baby-look",
    sections: [
      {
        title: "Comprar",
        links: [
          { name: "Todas as peças femininas", href: "/produtos?categoria=baby-look" },
          { name: "Mais vendidas", href: "/produtos?categoria=baby-look&destaque=mais-vendidos" },
          { name: "Novidades", href: "/produtos?categoria=lancamentos", badge: "Novo" },
          { name: "Pronta entrega", href: "/produtos?destaque=pronta-entrega" },
        ],
      },
      {
        title: "Por tamanho",
        links: [
          { name: "Tamanho P", href: "/produtos?categoria=baby-look&tamanho=P" },
          { name: "Tamanho M", href: "/produtos?categoria=baby-look&tamanho=M" },
          { name: "Tamanho G", href: "/produtos?categoria=baby-look&tamanho=G" },
          { name: "Tamanho GG", href: "/produtos?categoria=baby-look&tamanho=GG" },
        ],
      },
    ],
    featured: {
      image: homeMedia.menu.feminino.src,
      eyebrow: "FEMININO",
      title: "Peças femininas cristãs",
      subtitle: "Peças leves, femininas e com mensagem.",
      cta: "Ver peças femininas",
      href: "/produtos?categoria=baby-look",
    },
  },
  {
    label: "Coleções",
    href: "/produtos",
    sections: [
      {
        title: "Explorar",
        links: [
          { name: "Todos os produtos", href: "/produtos" },
          { name: "Lançamentos", href: "/produtos?categoria=lancamentos", badge: "Novo" },
          { name: "Mais vendidos", href: "/produtos?destaque=mais-vendidos" },
          { name: "Pronta entrega", href: "/produtos?destaque=pronta-entrega" },
        ],
      },
      {
        title: "Por categoria",
        links: [
          { name: "Masculino", href: "/produtos?categoria=camisetas" },
          { name: "Oversized", href: "/produtos?categoria=oversized" },
          { name: "Feminino", href: "/produtos?categoria=baby-look" },
        ],
      },
    ],
    featured: {
      image: homeMedia.menu.colecoes.src,
      eyebrow: "CATÁLOGO",
      title: "Escolha por estilo",
      subtitle: "Encontre peças por categoria, tamanho e ocasião.",
      cta: "Ver catálogo",
      href: "/produtos",
    },
  },
  {
    label: "Promoções",
    href: "/produtos?categoria=promocoes",
    highlight: "promo",
    sections: [
      {
        title: "Ofertas",
        links: [
          { name: "Todas as promoções", href: "/produtos?categoria=promocoes" },
          { name: "Últimas unidades", href: "/produtos?destaque=ultimas-unidades" },
          { name: "Até R$ 79,90", href: "/produtos?preco_max=79.90" },
        ],
      },
      {
        title: "Comprar rápido",
        links: [
          { name: "Pronta entrega", href: "/produtos?destaque=pronta-entrega" },
          { name: "Mais vendidos", href: "/produtos?destaque=mais-vendidos" },
        ],
      },
    ],
    featured: {
      image: homeMedia.menu.promocoes.src,
      eyebrow: "OUTLET",
      title: "Ofertas especiais",
      subtitle: "Peças selecionadas com condições especiais.",
      cta: "Ver promoções",
      href: "/produtos?categoria=promocoes",
    },
  },
  {
    label: "Pronta Entrega",
    href: "/produtos?destaque=pronta-entrega",
    highlight: "fast",
    sections: [
      {
        title: "Disponível agora",
        links: [
          { name: "Todos disponíveis", href: "/produtos?destaque=pronta-entrega" },
          { name: "Camisetas", href: "/produtos?categoria=camisetas&destaque=pronta-entrega" },
          { name: "Oversized", href: "/produtos?categoria=oversized&destaque=pronta-entrega" },
          { name: "Feminino", href: "/produtos?categoria=baby-look&destaque=pronta-entrega" },
        ],
      },
      {
        title: "Ajuda",
        links: [
          { name: "Como comprar", href: "/contato" },
          { name: "Guia de medidas", href: "/guia-de-medidas" },
        ],
      },
    ],
    featured: {
      image: homeMedia.menu.prontaEntrega.src,
      eyebrow: "COMPRA RÁPIDA",
      title: "Finalize pelo WhatsApp",
      subtitle: "Produtos prontos para atendimento imediato.",
      cta: "Comprar agora",
      href: "/produtos?destaque=pronta-entrega",
    },
  },
]

// ─── Simple nav links ───

export const navLinks = [
  { name: "Guia de Medidas", href: "/guia-de-medidas" },
  { name: "Contato", href: "/contato" },
]

// ─── Promo bar ───

export const promoMessages = [
  "✦ Frete grátis para Juiz de Fora/MG",
  "✦ Parcele em até 3x no cartão",
  "✦ Escolha no catálogo e finalize pelo WhatsApp",
  "✦ Pronta entrega · Envio imediato",
]

// ─── Mobile menu groups ───

export const mobileMenuGroups = [
  {
    title: "Comprar por categoria",
    items: [
      { name: "Masculino", href: "/produtos?categoria=camisetas" },
      { name: "Oversized", href: "/produtos?categoria=oversized" },
      { name: "Feminino", href: "/produtos?categoria=baby-look" },
      { name: "Pronta Entrega", href: "/produtos?destaque=pronta-entrega" },
      { name: "Promoções", href: "/produtos?categoria=promocoes" },
    ],
  },
  {
    title: "Explorar",
    items: [
      { name: "Lançamentos", href: "/produtos?categoria=lancamentos" },
      { name: "Mais vendidos", href: "/produtos?destaque=mais-vendidos" },
      { name: "Todos os produtos", href: "/produtos" },
    ],
  },
  {
    title: "Ajuda",
    items: [
      { name: "Guia de medidas", href: "/guia-de-medidas" },
      { name: "Como comprar", href: "/contato" },
    ],
  },
]
