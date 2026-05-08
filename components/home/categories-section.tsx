import Link from "next/link"
import { Shirt, Sparkles, TrendingUp, Tag, LayoutGrid } from "lucide-react"

const categories = [
  { name: "Camisetas cristãs", slug: "camisetas-cristas", icon: Shirt, description: "Mensagens de fé" },
  { name: "Tradicionais", slug: "tradicionais", icon: LayoutGrid, description: "Clássicas e versáteis" },
  { name: "Oversized", slug: "oversized", icon: TrendingUp, description: "Estilo urbano" },
  { name: "Lançamentos", slug: "lancamentos", icon: Sparkles, description: "Novidades" },
  { name: "Promoções", slug: "promocoes", icon: Tag, description: "Ofertas" },
]

export function CategoriesSection() {
  return (
    <section className="py-8 sm:py-14 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <p className="text-[11px] font-medium tracking-[0.2em] text-[#C2A87D] uppercase">Explore</p>
          <h2 className="mt-2 font-serif text-xl font-bold sm:text-2xl lg:text-4xl">
            Navegue por categoria
          </h2>
        </div>

        {/* Mobile: horizontal scroll | Desktop: grid */}
        <div className="-mx-4 mt-8 flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide sm:mx-0 sm:mt-12 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.slug}
                href={`/produtos?categoria=${category.slug}`}
                className="group flex min-w-[140px] shrink-0 flex-col items-center rounded-xl border border-border/50 bg-card p-5 text-center transition-all duration-300 hover:border-foreground/20 hover:shadow-lg sm:min-w-0 sm:p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted transition-all duration-300 group-hover:bg-foreground group-hover:text-background sm:h-14 sm:w-14">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="mt-3 font-serif text-xs font-semibold sm:mt-5 sm:text-sm">
                  {category.name}
                </h3>
                <p className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">
                  {category.description}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
