import Link from "next/link"
import Image from "next/image"
import { Percent, MessageCircle, ArrowRight, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { getPromotionProducts } from "@/lib/data/products"
import { getProductMedia } from "@/lib/data/media"
import { formatPrice, getDiscountPercent } from "@/lib/format"
import { WHATSAPP_NUMBER, createWhatsAppLink, formatProductMessage } from "@/lib/whatsapp"

export function PromotionsSection() {
  const promos = getPromotionProducts()
  if (promos.length === 0) return null

  // ===== Caso 1: uma única promoção (caso atual) =====
  if (promos.length === 1) {
    const p = promos[0]
    const media = getProductMedia(p)
    const discount = p.originalPrice ? getDiscountPercent(p.originalPrice, p.price) : 0

    return (
      <section className="py-8 sm:py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          {/* ===== MOBILE: card compacto horizontal — não vira blocão gigante ===== */}
          <div className="overflow-hidden rounded-2xl bg-[#1a1a1a] text-[#FAF9F6] sm:hidden">
            <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-orange-500" />
            <div className="grid grid-cols-[120px_1fr] gap-0">
              <Link href={`/produto/${p.slug}`} className="relative aspect-square">
                <Image src={media.cover} alt={p.name} fill className="object-cover" sizes="120px" />
                {discount > 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    -{discount}%
                  </span>
                )}
              </Link>
              <div className="flex min-w-0 flex-col justify-center gap-1.5 p-3">
                <div className="flex items-center gap-1 text-red-400">
                  <Flame className="h-3 w-3" />
                  <span className="text-[8px] font-semibold uppercase tracking-[0.18em]">Oferta da semana</span>
                </div>
                <Link href={`/produto/${p.slug}`} className="min-w-0">
                  <h3 className="line-clamp-2 break-words font-serif text-xs font-semibold leading-tight">{p.name}</h3>
                </Link>
                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                  {p.originalPrice && (
                    <span className="text-[10px] text-[#FAF9F6]/40 line-through">{formatPrice(p.originalPrice)}</span>
                  )}
                  <span className="text-base font-bold text-red-400">{formatPrice(p.price)}</span>
                </div>
                {p.stock <= 10 && (
                  <p className="text-[8px] font-medium uppercase tracking-wider text-red-400/80">
                    Restam {p.stock} un.
                  </p>
                )}
                <div className="mt-1 flex flex-wrap gap-1">
                  <Link href={`/produto/${p.slug}`}>
                    <Button size="sm" className="h-7 gap-1 rounded-full bg-white px-2.5 text-[10px] font-semibold text-black hover:bg-white/90">
                      Ver <ArrowRight className="h-2.5 w-2.5" />
                    </Button>
                  </Link>
                  <a href={createWhatsAppLink(WHATSAPP_NUMBER, formatProductMessage(p.name))} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="h-7 gap-1 rounded-full bg-[#25D366] px-2.5 text-[10px] font-semibold text-white hover:bg-[#1DA851]">
                      <MessageCircle className="h-2.5 w-2.5" /> Zap
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ===== DESKTOP / TABLET: layout horizontal premium ===== */}
          <div className="hidden overflow-hidden rounded-2xl bg-[#1a1a1a] text-[#FAF9F6] shadow-xl sm:block">
            <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-orange-500" />
            <div className="grid grid-cols-[minmax(280px,40%)_1fr] gap-0 lg:grid-cols-[minmax(320px,38%)_1fr]">
              {/* Imagem com overlay decorativo */}
              <Link href={`/produto/${p.slug}`} className="group relative aspect-[4/5] overflow-hidden">
                <Image src={media.cover} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:1024px) 40vw, 38vw" />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent" />
                {discount > 0 && (
                  <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    -{discount}% OFF
                  </span>
                )}
              </Link>
              {/* Info */}
              <div className="flex min-w-0 flex-col justify-center p-6 lg:p-10">
                <div className="flex items-center gap-2 text-red-400">
                  <Percent className="h-4 w-4" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">Oferta da semana</span>
                </div>
                <h2 className="mt-3 break-words font-serif text-2xl font-bold leading-tight lg:text-4xl">{p.name}</h2>
                <p className="mt-3 line-clamp-2 max-w-md text-sm leading-relaxed text-[#FAF9F6]/55">{p.description}</p>

                <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {p.originalPrice && (
                    <span className="text-sm text-[#FAF9F6]/40 line-through">{formatPrice(p.originalPrice)}</span>
                  )}
                  <span className="text-3xl font-bold text-red-400 lg:text-4xl">{formatPrice(p.price)}</span>
                </div>

                {p.stock <= 10 && (
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-red-400/80">
                    Últimas {p.stock} unidades
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
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

  // ===== Caso 2: múltiplas promoções — grid =====
  return (
    <section className="bg-[#1a1a1a] py-8 text-[#FAF9F6] sm:py-14 lg:py-20">
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-orange-500" />
      <div className="mx-auto max-w-7xl px-3 pt-6 sm:px-4 sm:pt-8">
        <div className="flex flex-wrap items-center gap-2">
          <Percent className="h-5 w-5 text-red-400" />
          <h2 className="font-serif text-lg font-bold sm:text-2xl">Promoções</h2>
        </div>
        <div className="-mx-3 mt-5 flex gap-3 overflow-x-auto px-3 pb-3 scrollbar-hide sm:mx-0 sm:mt-8 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 lg:grid-cols-4">
          {promos.map((product) => (
            <div key={product.id} className="w-[72vw] max-w-[280px] shrink-0 sm:w-auto sm:max-w-none">
              <div className="rounded-xl bg-card text-card-foreground"><ProductCard product={product} /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
