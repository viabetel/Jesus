"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Play, MessageCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/contexts/favorites-context"
import type { Product } from "@/lib/data/products"
import { getProductColors, getProductSizes, getTotalStock } from "@/lib/data/products"
import { WHATSAPP_NUMBER, createWhatsAppLink, formatProductMessage } from "@/lib/whatsapp"
import { formatPrice, getDiscountPercent } from "@/lib/format"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type ProductCardProps = { product: Product; featured?: boolean }

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { toggleFavorite, isFavorite } = useFavorites()

  const isFav = isFavorite(product.id)
  const totalStock = getTotalStock(product)
  const isOutOfStock = totalStock === 0
  const discount = product.originalPrice ? getDiscountPercent(product.originalPrice, product.price) : 0
  const colors = getProductColors(product)
  const sizes = getProductSizes(product)

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    toggleFavorite(product)
    if (!isFav) toast.success("Adicionado aos favoritos!")
  }

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case "Promoção": return "bg-red-600 text-white"
      case "Novidade": case "Lançamento": return "bg-foreground text-background"
      case "Mais vendida": return "bg-[#C2A87D] text-white"
      case "Esgotado": return "bg-muted text-muted-foreground"
      default: return "bg-muted text-foreground"
    }
  }

  return (
    <div className={cn("group relative flex flex-col overflow-hidden rounded-lg border border-border/40 bg-card transition-all duration-300 hover:border-border hover:shadow-lg", featured && "sm:rounded-xl")}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>

      {/* Image */}
      <Link href={`/produto/${product.slug}`} className={cn("relative aspect-[4/5] overflow-hidden bg-muted", featured && "lg:aspect-[3/4]")}>
        <Image src={product.images[0] || "/brand/placeholder-product.svg"} alt={product.name} fill
          className={cn("object-cover transition-transform duration-500", isHovered && "scale-105")}
          sizes={featured ? "(max-width:1024px) 50vw, 40vw" : "(max-width:379px) 100vw, (max-width:639px) 50vw, (max-width:1023px) 33vw, 25vw"} />

        {product.badge && (
          <span className={cn("absolute left-2 top-2 rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider sm:px-2.5 sm:text-[9px]", getBadgeStyle(product.badge))}>
            {product.badge}{discount > 0 && product.badge === "Promoção" && ` -${discount}%`}
          </span>
        )}

        <button className={cn("absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm sm:h-8 sm:w-8",
          isFav ? "opacity-100" : "opacity-70 sm:opacity-0 sm:group-hover:opacity-100")}
          onClick={handleToggleFavorite} aria-label="Favoritar">
          <Heart className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", isFav ? "fill-red-500 text-red-500" : "text-gray-600")} />
        </button>

        {product.video && !isOutOfStock && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] font-medium text-white backdrop-blur-sm">
            <Play className="h-2 w-2 fill-white" /> Vídeo
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="rounded-full bg-background px-3 py-1 text-[10px] font-medium text-muted-foreground">Esgotado</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className={cn("flex flex-1 flex-col p-2 sm:p-3", featured && "sm:p-4")}>
        <p className="hidden text-[8px] font-medium tracking-[0.12em] text-muted-foreground uppercase min-[380px]:block sm:text-[9px]">{product.category}</p>

        <Link href={`/produto/${product.slug}`}>
          <h3 className={cn("mt-0.5 line-clamp-2 font-serif text-[11px] font-semibold leading-snug hover:text-muted-foreground sm:text-xs", featured && "sm:text-sm")}>{product.name}</h3>
        </Link>

        <div className="mt-0.5 flex items-baseline gap-1.5 sm:mt-1">
          <span className={cn("text-xs font-bold sm:text-sm", product.originalPrice && "text-red-600")}>{formatPrice(product.price)}</span>
          {product.originalPrice && <span className="text-[9px] text-muted-foreground line-through sm:text-[10px]">{formatPrice(product.originalPrice)}</span>}
        </div>

        {/* Sizes & Colors preview */}
        <div className="mt-1 flex items-center gap-1.5 sm:mt-2">
          <div className="flex gap-px sm:gap-0.5">
            {sizes.slice(0, 4).map(s => (<span key={s} className="rounded border px-1 py-px text-[7px] text-muted-foreground sm:text-[8px]">{s}</span>))}
          </div>
          <div className="flex gap-px sm:gap-0.5">
            {colors.slice(0, 3).map(c => (<span key={c.name} className="h-2.5 w-2.5 rounded-full border border-border/40 sm:h-3 sm:w-3" style={{ backgroundColor: c.value }} title={c.name} />))}
            {colors.length > 3 && <span className="text-[7px] text-muted-foreground">+{colors.length - 3}</span>}
          </div>
        </div>

        {/* Low stock badge */}
        {totalStock > 0 && totalStock <= 5 && (
          <p className="mt-1 text-[8px] font-medium text-amber-600 sm:text-[9px]">Últimas {totalStock} un.</p>
        )}

        {/* CTA — ALWAYS goes to product page. No auto-add. */}
        <div className="mt-1.5 flex gap-1.5 sm:mt-2">
          <Link href={`/produto/${product.slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="h-7 w-full gap-1 rounded-full text-[9px] sm:h-8 sm:text-[10px]">
              Ver peça <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Button>
          </Link>
          <a href={createWhatsAppLink(WHATSAPP_NUMBER, formatProductMessage(product.name))} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} className="shrink-0">
            <Button size="sm" className="h-7 gap-1 rounded-full bg-[#25D366] px-2.5 text-[9px] text-white hover:bg-[#1DA851] sm:h-8 sm:px-3 sm:text-[10px]" disabled={isOutOfStock}>
              <MessageCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">Zap</span>
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
