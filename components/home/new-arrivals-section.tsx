import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { getNewProducts } from "@/lib/data/products"

export function NewArrivalsSection() {
  const newProducts = getNewProducts().slice(0, 4)
  if (newProducts.length === 0) return null

  return (
    <section className="bg-muted/30 py-8 sm:py-14 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-[0.2em] text-[#C2A87D] uppercase">Novidades</p>
            <h2 className="mt-1 font-serif text-xl font-bold sm:text-2xl lg:text-4xl">Lançamentos</h2>
          </div>
          <Link href="/produtos?categoria=lancamentos">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-full text-xs sm:gap-2 sm:text-sm">
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile: horizontal scroll | Desktop: grid */}
        <div className="-mx-4 mt-6 flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:overflow-visible md:grid-cols-3 lg:grid-cols-4 sm:px-0 sm:pb-0 lg:grid-cols-4">
          {newProducts.map((product) => (
            <div key={product.id} className="w-[72vw] max-w-[280px] shrink-0 sm:w-auto sm:max-w-none">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
