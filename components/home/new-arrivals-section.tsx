import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/data/products"

export function NewArrivalsSection({ products: newProducts }: { products: Product[] }) {
  if (newProducts.length === 0) return null

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-5 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 sm:h-9 sm:w-9">
              <Sparkles className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold sm:text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
                Últimos lançamentos
              </h2>
              <p className="text-[11px] text-muted-foreground sm:text-xs">
                As peças mais recentes do catálogo.
              </p>
            </div>
          </div>
          <Link href="/produtos?categoria=lancamentos">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-full text-[11px] sm:text-xs">
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Grid — consistent with featured-section */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {newProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
