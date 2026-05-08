"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, MessageCircle, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/contexts/favorites-context"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/lib/data/products"
import { hasVideo } from "@/lib/data/products"
import { WHATSAPP_NUMBER, createWhatsAppLink, formatProductMessage } from "@/lib/whatsapp"
import { formatPrice, getDiscountPercent } from "@/lib/format"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const { toggleFavorite, isFavorite } = useFavorites()
  const { addItem } = useCart()
  const isFav = isFavorite(product.id)
  const outOfStock = product.stock === 0
  const discount = product.originalPrice ? getDiscountPercent(product.originalPrice, product.price) : 0
  const showHover = hovered && !!product.media.hover

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (outOfStock) return
    addItem(product, product.sizes[0], product.colors[0], 1)
    toast.success("Adicionado à sacola!")
  }
  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    toggleFavorite(product)
    if (!isFav) toast.success("Favoritado!")
  }
  const badge = product.badge
  const badgeClass = badge === "Promoção" ? "bg-red-600 text-white" : badge === "Mais vendida" ? "bg-[#C2A87D] text-white" : "bg-foreground text-background"

  return (
    <article
      className={cn("group relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-border/40 bg-card", featured && "sm:rounded-xl lg:flex-row")}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      {/* IMAGE */}
      <Link href={`/produto/${product.slug}`} className={cn("relative aspect-[4/5] overflow-hidden bg-muted", featured && "lg:w-1/2 lg:aspect-auto lg:min-h-[300px]")}>
        {/* Cover */}
        <Image src={product.media.cover} alt={product.name} fill className={cn("object-cover transition-all duration-500", showHover && "opacity-0")} sizes={featured ? "(max-width:1024px) 50vw, 40vw" : "(max-width:379px) 100vw, (max-width:639px) 50vw, (max-width:1023px) 33vw, 25vw"} />
        {/* Hover image — desktop only */}
        {product.media.hover && (
          <Image src={product.media.hover} alt={`${product.name} — verso`} fill className={cn("object-cover transition-all duration-500", showHover ? "opacity-100" : "opacity-0")} sizes="25vw" />
        )}
        {/* Badge */}
        {badge && <span className={cn("absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider sm:left-2.5 sm:top-2.5 sm:text-[10px]", badgeClass)}>{badge}{discount > 0 && badge === "Promoção" && ` -${discount}%`}</span>}
        {/* Video badge */}
        {hasVideo(product) && !outOfStock && <span className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] text-white sm:bottom-2 sm:left-2 sm:gap-1 sm:px-2"><Play className="h-2.5 w-2.5 fill-white" />Vídeo</span>}
        {/* Fav — always visible on mobile */}
        <button className={cn("absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 sm:right-2.5 sm:top-2.5 sm:h-8 sm:w-8", isFav ? "opacity-100" : "opacity-80 sm:opacity-0 sm:group-hover:opacity-100")} onClick={toggleFav} aria-label="Favoritar">
          <Heart className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", isFav ? "fill-red-500 text-red-500" : "text-gray-600")} />
        </button>
        {outOfStock && <div className="absolute inset-0 flex items-center justify-center bg-background/60"><span className="rounded-full bg-background px-3 py-1 text-[10px] font-medium text-muted-foreground">Esgotado</span></div>}
      </Link>

      {/* CONTENT — min-w-0 prevents overflow */}
      <div className={cn("flex min-w-0 flex-1 flex-col p-2 sm:p-3", featured && "lg:p-5")}>
        <Link href={`/produto/${product.slug}`} className="min-w-0">
          <h3 className={cn("line-clamp-2 min-w-0 break-words font-serif text-[11px] font-semibold leading-snug sm:text-sm", featured && "sm:text-base")}>{product.name}</h3>
        </Link>
        <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-1">
          <span className={cn("text-xs font-bold sm:text-sm", product.originalPrice && "text-red-600")}>{formatPrice(product.price)}</span>
          {product.originalPrice && <span className="text-[9px] text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>}
        </div>
        {/* Sizes — hidden on tiny mobile */}
        <div className="mt-1 hidden min-w-0 gap-0.5 overflow-hidden min-[380px]:flex">
          {product.sizes.slice(0, 4).map((s) => <span key={s} className="rounded border px-1 py-px text-[7px] text-muted-foreground sm:text-[9px]">{s}</span>)}
        </div>
        {/* CTA — SINGLE button mobile, two on sm+ */}
        <div className="mt-auto min-w-0 pt-2">
          <div className="sm:hidden">
            <Link href={`/produto/${product.slug}`} className="block">
              <Button variant="outline" size="sm" className="h-7 w-full rounded-full text-[10px]">Ver produto</Button>
            </Link>
          </div>
          <div className="hidden gap-1.5 sm:flex">
            <Button variant="outline" size="sm" className="h-8 flex-1 gap-1 rounded-full text-[10px]" onClick={addToCart} disabled={outOfStock}>
              <ShoppingBag className="h-3 w-3" /> Sacola
            </Button>
            <a href={createWhatsAppLink(WHATSAPP_NUMBER, formatProductMessage(product.name))} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" className="h-8 w-full gap-1 rounded-full bg-[#25D366] text-[10px] text-white hover:bg-[#1DA851]" disabled={outOfStock}>
                <MessageCircle className="h-3 w-3" /> Zap
              </Button>
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
