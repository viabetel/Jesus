import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { getFeaturedProducts } from "@/lib/data/products"

export function FeaturedSection() {
  const featuredProducts = getFeaturedProducts()
  if (featuredProducts.length === 0) return null

  return (
    <section className="py-8 sm:py-14 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-[0.2em] text-[#C2A87D] uppercase">Destaque</p>
            <h2 className="mt-1 font-serif text-xl font-bold sm:text-2xl lg:text-4xl">Destaques</h2>
          </div>
          <Link href="/produtos">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-full text-xs sm:gap-2 sm:text-sm">
              Ver catálogo <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile: 2 columns | Desktop: featured cards */}
        <div className="mt-6 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:mt-10 sm:gap-6">
          {featuredProducts.slice(0, 2).map((product) => (
            <ProductCard key={product.id} product={product} featured />
          ))}
        </div>
        {featuredProducts.length > 2 && (
          <div className="mt-3 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:mt-6 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.slice(2, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
