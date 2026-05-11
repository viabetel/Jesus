import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import type { PublicProduct } from "@/lib/services/public-catalog"

export function NewArrivalsSection({ products }: { products: PublicProduct[] }) {
  if (products.length === 0) return null

  return (
    <section className="bg-[var(--cream)] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-6 sm:mb-10">
          <div>
            <p className="caps text-[10px] tracking-[0.22em] text-[var(--muted-foreground)] sm:text-[11px]">Acabou de chegar</p>
            <h2 className="mt-2 font-serif-italic text-[28px] leading-none sm:mt-3 sm:text-[36px] lg:text-[44px]">Últimos lançamentos</h2>
            <p className="mt-2 text-[13px] text-[var(--fg-soft)] max-w-[480px] sm:mt-3 sm:text-[15px]">
              Novas peças para renovar seu guarda-roupa com propósito.
            </p>
          </div>
          <Link
            href="/produtos?categoria=lancamentos"
            className="caps text-[10px] text-[var(--ink)] border-b border-[var(--ink)]/20 hover:border-[var(--ink)] pb-1 transition flex items-center gap-2 group sm:text-[11px]"
          >
            Ver todos os lançamentos <span className="transition-transform group-hover:translate-x-1"><ArrowRight size={13} /></span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-14 md:grid-cols-4">
          {products.slice(0, 4).map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
