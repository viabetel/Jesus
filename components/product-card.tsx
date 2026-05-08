"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, MessageCircle, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/contexts/favorites-context"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/lib/data/products"
import { WHATSAPP_NUMBER, createWhatsAppLink, formatProductMessage } from "@/lib/whatsapp"
import { formatPrice, getDiscountPercent } from "@/lib/format"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type ProductCardProps = {
  product: Product
  featured?: boolean
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { toggleFavorite, isFavorite } = useFavorites()
  const { addItem } = useCart()

  const isFav = isFavorite(product.id)
  const isOutOfStock = product.stock === 0
  const discount = product.originalPrice ? getDiscountPercent(product.originalPrice, product.price) : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    addItem(product, product.sizes[0], product.colors[0], 1)
    toast.success("Adicionado à sacola!", { description: `${product.name} — ${product.sizes[0]}` })
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border/40 bg-card transition-all duration-300 hover:border-border hover:shadow-lg",
        featured && "sm:rounded-xl lg:flex-row"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Link
        href={`/produto/${product.slug}`}
        className={cn(
          "relative aspect-[4/5] overflow-hidden bg-muted",
          featured && "lg:w-1/2 lg:aspect-auto lg:min-h-[340px]"
        )}
      >
        <Image
          src={product.images[0] || "/brand/placeholder-product.svg"}
          alt={product.name}
          fill
          className={cn("object-cover transition-transform duration-500", isHovered && "scale-105")}
          sizes={featured ? "(max-width:1024px) 50vw, 40vw" : "(max-width:379px) 100vw, (max-width:639px) 50vw, (max-width:1023px) 33vw, 25vw"}
        />

        {/* Badge */}
        {product.badge && (
          <span className={cn(
            "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-[10px]",
            getBadgeStyle(product.badge)
          )}>
            {product.badge}{discount > 0 && product.badge === "Promoção" && ` -${discount}%`}
          </span>
        )}

        {/* Favorite — ALWAYS visible on mobile (no hover needed) */}
        <button
          className={cn(
            "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all sm:right-3 sm:top-3 sm:h-9 sm:w-9",
            isFav ? "opacity-100" : "opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
          )}
          onClick={handleToggleFavorite}
          aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isFav ? "fill-red-500 text-red-500" : "text-gray-600")} />
        </button>

        {/* Out of stock */}
        {/* Video badge */}
        {product.video && !isOutOfStock && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm">
            <Play className="h-2.5 w-2.5 fill-white" /> Vídeo
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground">Esgotado</span>
          </div>
        )}
      </Link>

      {/* Content — compact on mobile */}
      <div className={cn("flex flex-1 flex-col p-2.5 sm:p-4", featured && "lg:p-6")}>
        {/* Category — hidden on small mobile to save space */}
        <p className="hidden text-[9px] font-medium tracking-[0.12em] text-muted-foreground uppercase min-[380px]:block sm:text-[10px]">
          {product.category}
        </p>

        {/* Title — line clamp */}
        <Link href={`/produto/${product.slug}`}>
          <h3 className={cn(
            "mt-0.5 line-clamp-2 font-serif text-xs font-semibold leading-snug transition-colors hover:text-muted-foreground sm:mt-1.5 sm:text-sm",
            featured && "sm:text-base lg:text-lg"
          )}>
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-1 flex items-baseline gap-1.5 sm:mt-2 sm:gap-2">
          <span className={cn("text-sm font-bold sm:text-base", product.originalPrice && "text-red-600")}>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] text-muted-foreground line-through sm:text-xs">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Sizes & Colors — compact on mobile */}
        <div className="mt-1.5 flex items-center gap-2 sm:mt-3">
          <div className="flex gap-0.5 sm:gap-1">
            {product.sizes.slice(0, 4).map((size) => (
              <span key={size} className="rounded border px-1 py-px text-[8px] text-muted-foreground sm:px-1.5 sm:py-0.5 sm:text-[10px]">
                {size}
              </span>
            ))}
          </div>
          <div className="flex gap-0.5 sm:gap-1">
            {product.colors.slice(0, 3).map((color) => (
              <span
                key={color.name}
                className="h-3 w-3 rounded-full border border-border/40 sm:h-3.5 sm:w-3.5"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-[8px] text-muted-foreground">+{product.colors.length - 3}</span>
            )}
          </div>
        </div>

        {/* CTA — single clean button on small mobile, two on larger */}
        <div className="mt-2 sm:mt-3">
          {/* Small mobile: single "Ver produto" link */}
          <div className="min-[380px]:hidden">
            <Link href={`/produto/${product.slug}`}>
              <Button variant="outline" size="sm" className="h-8 w-full rounded-full text-[10px]">
                Ver produto
              </Button>
            </Link>
          </div>
          {/* Larger screens: add to cart + WhatsApp */}
          <div className="hidden gap-1.5 min-[380px]:flex sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex-1 gap-1 rounded-full text-[10px] sm:h-9 sm:text-xs"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">{featured ? "Adicionar à sacola" : "Adicionar"}</span>
              <span className="sm:hidden">Sacola</span>
            </Button>
            <a
              href={createWhatsAppLink(WHATSAPP_NUMBER, formatProductMessage(product.name))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="sm"
                className="h-8 w-full gap-1 rounded-full bg-[#25D366] text-[10px] text-white hover:bg-[#1DA851] sm:h-9 sm:text-xs"
                disabled={isOutOfStock}
              >
                <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
                <span className="sm:hidden">Zap</span>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
