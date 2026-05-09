/**
 * Catalog Menu Configuration
 *
 * Central config for mega menu navigation.
 * In the future, categories and collections can come from Supabase.
 */

export interface MenuLink { name: string; href: string }
export interface MenuSection { title: string; links: MenuLink[] }
export interface MegaMenuItem {
  label: string
  href: string
  sections: MenuSection[]
  featured?: { title: string; subtitle: string; cta: string; href: string }
}

export const catalogMenu: MegaMenuItem[] = [
  {
    label: "Produtos",
    href: "/produtos",
    sections: [
      {
        title: "Categorias",
        links: [
          { name: "Camisetas Cristãs", href: "/produtos?categoria=camisetas-cristas" },
          { name: "Tradicionais", href: "/produtos?categoria=tradicionais" },
          { name: "Oversized", href: "/produtos?categoria=oversized" },
          { name: "Todos os Produtos", href: "/produtos" },
        ],
      },
      {
        title: "Coleções",
        links: [
          { name: "Lançamentos", href: "/produtos?categoria=lancamentos" },
          { name: "Mais Vendidos", href: "/produtos" },
          { name: "Drops de Fé", href: "/produtos" },
        ],
      },
      {
        title: "Tamanhos",
        links: [
          { name: "P", href: "/produtos" },
          { name: "M", href: "/produtos" },
          { name: "G", href: "/produtos" },
          { name: "GG", href: "/produtos" },
        ],
      },
    ],
    featured: {
      title: "Lançamento",
      subtitle: "Coleção Fé Urbana",
      cta: "Ver coleção",
      href: "/produtos?categoria=lancamentos",
    },
  },
  {
    label: "Promoções",
    href: "/produtos?categoria=promocoes",
    sections: [
      {
        title: "Ofertas",
        links: [
          { name: "Todas as Promoções", href: "/produtos?categoria=promocoes" },
          { name: "Últimas Unidades", href: "/produtos" },
        ],
      },
    ],
  },
]

export const navLinks = [
  { name: "Guia de Medidas", href: "/guia-de-medidas" },
  { name: "Quem Somos", href: "/quem-somos" },
  { name: "Contato", href: "/contato" },
]

export const promoMessages = [
  "Frete grátis para Juiz de Fora/MG",
  "Parcele em até 3x no cartão",
  "Vista sua fé com estilo",
]
