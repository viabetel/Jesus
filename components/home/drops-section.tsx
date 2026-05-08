import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { products } from "@/lib/data/products"
import { getProductMedia } from "@/lib/data/media"

/**
 * "Drops de Fé" — coleções curadas por tema cristão.
 * Em vez de mais um grid de produtos, agrupamos as peças em "drops"
 * (Mensagem, Movimento, Renovação) — uma forma criativa de destacar
 * o lado cristão da marca sem repetir layouts.
 */
const drops = [
  {
    slug: "drops-mensagem",
    title: "Drop · Mensagem",
    subtitle: "Estampas que falam",
    description: "Peças com versículos e mensagens que carregam fé de forma direta.",
    productSlugs: ["camiseta-cristo-em-suas-linhas", "camiseta-o-senhor-diz-ekballo", "camiseta-sal-e-luz"],
    accent: "#1a1a1a",
    text: "#FAF9F6",
  },
  {
    slug: "drops-movimento",
    title: "Drop · Movimento",
    subtitle: "Fé em ação",
    description: "Para quem vive a fé com energia, no movimento do dia a dia.",
    productSlugs: ["camiseta-fe-em-movimento", "camiseta-oversized-fe-urbana", "camiseta-proposito"],
    accent: "#C2A87D",
    text: "#1a1a1a",
  },
  {
    slug: "drops-renovacao",
    title: "Drop · Renovação",
    subtitle: "Nova criatura",
    description: "Mensagens de transformação e graça nova a cada manhã.",
    productSlugs: ["camiseta-renovado", "camiseta-graca-diaria"],
    accent: "#FAF7F0",
    text: "#1a1a1a",
  },
]

export function DropsSection() {
  return (
    <section className="bg-background py-10 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C2A87D]">Curadoria</p>
            <h2 className="mt-1 break-words font-serif text-xl font-bold leading-tight sm:text-2xl lg:text-4xl">
              Drops de fé
            </h2>
            <p className="mt-1.5 max-w-md text-xs text-muted-foreground sm:text-sm">
              Pequenas coleções pensadas em torno de um tema cristão. Encontre o que ressoa com o seu momento.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-3">
          {drops.map((drop) => {
            const dropProducts = drop.productSlugs
              .map((slug) => products.find((p) => p.slug === slug))
              .filter((p): p is NonNullable<typeof p> => Boolean(p))
            if (dropProducts.length === 0) return null

            return (
              <Link
                key={drop.slug}
                href={`/produtos`}
                className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ backgroundColor: drop.accent, color: drop.text }}
              >
                {/* Mosaic de 3 capas */}
                <div className="relative aspect-[5/3] grid grid-cols-3 gap-0.5 bg-black/10">
                  {dropProducts.slice(0, 3).map((p, i) => {
                    const media = getProductMedia(p)
                    return (
                      <div key={p.id} className="relative overflow-hidden">
                        <Image
                          src={media.cover}
                          alt={p.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width:640px) 33vw, 12vw"
                        />
                        {i === 2 && dropProducts.length > 3 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/55 font-serif text-2xl font-bold text-white">
                            +{dropProducts.length - 3}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="flex min-w-0 flex-col gap-1.5 p-4 sm:p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] opacity-70">{drop.subtitle}</p>
                  <h3 className="break-words font-serif text-base font-bold sm:text-lg">{drop.title}</h3>
                  <p className="line-clamp-2 break-words text-[11px] leading-relaxed opacity-80 sm:text-xs">
                    {drop.description}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider">
                    Ver drop <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
