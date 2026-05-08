import Link from "next/link"
import Image from "next/image"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { products } from "@/lib/data/products"
import { formatPrice } from "@/lib/format"

export function LowStockSection() {
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).slice(0, 3)
  if (lowStock.length === 0) return null

  return (
    <section className="py-8 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h2 className="font-serif text-lg font-bold sm:text-2xl">Últimas unidades</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Garanta antes que acabe</p>

        <div className="mt-5 grid gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
          {lowStock.map((p) => (
            <Link key={p.id} href={`/produto/${p.slug}`} className="group flex items-center gap-3 rounded-xl border bg-card p-3 transition-shadow hover:shadow-md sm:flex-col sm:items-start sm:p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted sm:aspect-square sm:h-auto sm:w-full">
                <Image src={p.images[0] || "/brand/placeholder-product.svg"} alt={p.name} fill className="object-cover" sizes="(max-width:640px) 64px, 33vw" />
              </div>
              <div className="flex-1">
                <p className="line-clamp-1 font-serif text-xs font-semibold sm:text-sm">{p.name}</p>
                <p className="mt-0.5 text-xs font-bold">{formatPrice(p.price)}</p>
                <p className="mt-0.5 text-[10px] font-medium text-amber-600">Restam {p.stock} un.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground sm:hidden" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
