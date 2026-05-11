import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/data/products"

export function FeaturedSection({ products: featured }: { products: Product[] }) {
  if (featured.length === 0) return null

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-5 sm:mb-8">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl lg:text-3xl" style={{ fontFamily: "var(--font-serif)" }}>
              Mais vendidos
            </h2>
            <p className="mt-1 text-[12px] text-muted-foreground sm:text-sm">
              As peças favoritas para comprar pelo WhatsApp.
            </p>
          </div>
          <Link href="/produtos">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-full text-[11px] sm:text-xs">
              Ver catálogo <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Grid — 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
