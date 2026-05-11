import Link from "next/link"
import Image from "next/image"
import { Tag, ArrowRight, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/data/products"
import { getTotalStock } from "@/lib/data/products"
import { formatPrice, getDiscountPercent } from "@/lib/format"
import { WHATSAPP_NUMBER, createWhatsAppLink, formatProductMessage } from "@/lib/whatsapp"

export function PromotionsSection({ products: promos }: { products: Product[] }) {
  if (promos.length === 0) return null

  // Single product — compact featured card
  if (promos.length === 1) {
    const p = promos[0]
    const discount = p.originalPrice ? getDiscountPercent(p.originalPrice, p.price) : 0

    return (
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="overflow-hidden rounded-xl border border-red-200/50 bg-red-50/30">
            <div className="flex flex-col sm:flex-row">
              {/* Image */}
              <div className="relative aspect-square w-full sm:aspect-auto sm:w-2/5 lg:w-1/3">
                <Image src={p.images[0] || "/brand/placeholder-product.svg"} alt={p.name} fill className="object-cover" sizes="(max-width:640px) 100vw, 40vw" />
                {discount > 0 && (
                  <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-center p-5 sm:p-8">
                <div className="flex items-center gap-2 text-red-600">
                  <Tag className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Oferta especial</span>
                </div>
                <h3 className="mt-2 text-lg font-bold sm:text-xl lg:text-2xl" style={{ fontFamily: "var(--font-serif)" }}>{p.name}</h3>
                <p className="mt-1.5 text-[12px] text-muted-foreground line-clamp-2 sm:text-sm">{p.description}</p>

                <div className="mt-3 flex items-baseline gap-2.5">
                  {p.originalPrice && <span className="text-sm text-muted-foreground/50 line-through">{formatPrice(p.originalPrice)}</span>}
                  <span className="text-2xl font-bold text-red-600">{formatPrice(p.price)}</span>
                </div>

                {getTotalStock(p) <= 10 && getTotalStock(p) > 0 && (
                  <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                    Últimas {getTotalStock(p)} unidades
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <Link href={`/produto/${p.slug}`}>
                    <Button size="sm" className="gap-1.5 rounded-full bg-foreground px-5 text-[11px] font-bold text-background hover:bg-foreground/90">
                      Ver produto <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <a href={createWhatsAppLink(WHATSAPP_NUMBER, formatProductMessage(p.name))} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1.5 rounded-full px-5 text-[11px] font-bold text-[#25D366] border-[#25D366]/30 hover:bg-[#25D366]/5">
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Multiple products — grid
  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex items-end justify-between gap-4 mb-5 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 sm:h-9 sm:w-9">
              <Tag className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold sm:text-2xl" style={{ fontFamily: "var(--font-serif)" }}>Promoções</h2>
              <p className="text-[11px] text-muted-foreground sm:text-xs">Peças selecionadas com preço especial.</p>
            </div>
          </div>
          <Link href="/produtos?categoria=promocoes">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-full text-[11px] sm:text-xs">
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {promos.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
