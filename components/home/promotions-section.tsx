import Link from "next/link"
import Image from "next/image"
import { Percent, MessageCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/data/products"
import { getTotalStock } from "@/lib/data/products"
import { formatPrice, getDiscountPercent } from "@/lib/format"
import { WHATSAPP_NUMBER, createWhatsAppLink, formatProductMessage } from "@/lib/whatsapp"

export function PromotionsSection({ products: promotionProducts }: { products: Product[] }) {
  if (promotionProducts.length === 0) return null

  // Single product: compact featured offer
  if (promotionProducts.length === 1) {
    const p = promotionProducts[0]
    const discount = p.originalPrice ? getDiscountPercent(p.originalPrice, p.price) : 0

    return (
      <section className="py-8 sm:py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="overflow-hidden rounded-xl bg-[#1a1a1a] text-[#FAF9F6]">
            {/* Red accent top */}
            <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-orange-500" />

            <div className="flex flex-col sm:flex-row">
              {/* Image */}
              <div className="relative aspect-square w-full sm:aspect-auto sm:w-2/5 lg:w-1/3">
                <Image src={p.images[0] || "/brand/placeholder-product.svg"} alt={p.name} fill className="object-cover" sizes="(max-width:640px) 100vw, 40vw" />
                {discount > 0 && (
                  <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-center p-5 sm:p-8 lg:p-10">
                <div className="flex items-center gap-2 text-red-400">
                  <Percent className="h-4 w-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest">Oferta da semana</span>
                </div>
                <h2 className="mt-2 font-serif text-lg font-bold sm:text-2xl lg:text-3xl">{p.name}</h2>
                <p className="mt-2 text-xs text-[#FAF9F6]/50 line-clamp-2 sm:text-sm">{p.description}</p>

                <div className="mt-4 flex items-baseline gap-2.5">
                  {p.originalPrice && <span className="text-sm text-[#FAF9F6]/40 line-through">{formatPrice(p.originalPrice)}</span>}
                  <span className="text-2xl font-bold text-red-400 sm:text-3xl">{formatPrice(p.price)}</span>
                </div>

                {getTotalStock(p) <= 10 && (
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-red-400/70">
                    Últimas {getTotalStock(p)} unidades
                  </p>
                )}

                <div className="mt-5 flex gap-2">
                  <Link href={`/produto/${p.slug}`}>
                    <Button size="sm" className="gap-1.5 rounded-full bg-white px-5 text-xs font-semibold text-black hover:bg-white/90">
                      Ver produto <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <a href={createWhatsAppLink(WHATSAPP_NUMBER, formatProductMessage(p.name))} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="gap-1.5 rounded-full bg-[#25D366] px-5 text-xs font-semibold text-white hover:bg-[#1DA851]">
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

  // Multiple products: grid
  return (
    <section className="bg-[#1a1a1a] py-8 text-[#FAF9F6] sm:py-14 lg:py-20">
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-orange-500" />
      <div className="mx-auto max-w-7xl px-3 pt-6 sm:px-4 sm:pt-8">
        <div className="flex items-center gap-3">
          <Percent className="h-5 w-5 text-red-400" />
          <h2 className="font-serif text-lg font-bold sm:text-2xl">Promoções</h2>
        </div>
        <div className="-mx-3 mt-5 flex gap-3 overflow-x-auto px-3 pb-3 scrollbar-hide sm:mx-0 sm:mt-8 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 lg:grid-cols-4">
          {promotionProducts.map((product) => (
            <div key={product.id} className="w-[72vw] max-w-[280px] shrink-0 sm:w-auto sm:max-w-none">
              <div className="rounded-xl bg-card text-card-foreground"><ProductCard product={product} /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
