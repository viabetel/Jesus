import { ProductCard } from "@/components/product-card"
import type { PublicProduct } from "@/lib/services/public-catalog"

export function FeaturedSection({ products }: { products: PublicProduct[] }) {
  if (products.length === 0) return null

  return (
    <section className="bg-white pb-20 pt-16 sm:pb-28 sm:pt-24">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
        <div className="text-center">
          <p className="caps text-[10px] tracking-[0.22em] text-[var(--muted-foreground)] sm:text-[11px]">Curadoria</p>
          <h2 className="mt-2 font-serif-italic text-[28px] leading-none sm:mt-3 sm:text-[36px] lg:text-[44px]">Mais vendidos</h2>
          <p className="mt-3 text-[13px] text-[var(--fg-soft)] max-w-[560px] mx-auto sm:mt-4 sm:text-[15px]">
            As peças favoritas de quem já escolheu vestir uma mensagem.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:mt-12 sm:gap-x-6 sm:gap-y-14 md:grid-cols-4">
          {products.slice(0, 4).map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
