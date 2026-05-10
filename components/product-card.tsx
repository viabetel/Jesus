"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Play, Eye } from "lucide-react"
import { useFavorites } from "@/contexts/favorites-context"
import type { Product } from "@/lib/data/products"
import { getProductColors, getTotalStock } from "@/lib/data/products"
import { formatPrice, getDiscountPercent } from "@/lib/format"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CardProduct extends Product {
  coverImage?: string | null
  hoverImage?: string | null
  hasVideo?: boolean
}

export function ProductCard({ product, featured = false }: { product: CardProduct; featured?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const { toggleFavorite, isFavorite } = useFavorites()

  const isFav = isFavorite(product.id)
  const totalStock = getTotalStock(product)
  const isOutOfStock = totalStock === 0
  const discount = product.originalPrice ? getDiscountPercent(product.originalPrice, product.price) : 0
  const colors = getProductColors(product)

  const coverImg = product.coverImage ?? product.images[0]
  const hoverImg = product.hoverImage ?? product.images[1]
  const hasHover = !!hoverImg
  const hasVideo = product.hasVideo ?? !!product.video

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    toggleFavorite(product)
    if (!isFav) toast.success("Favoritado!")
  }

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group block min-w-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ===== IMAGE ===== */}
      <div className={cn(
        "relative overflow-hidden bg-[#f5f0e8]",
        featured ? "aspect-[3/4] rounded-xl" : "aspect-[4/5] rounded-lg"
      )}>
        {/* Cover */}
        <Image
          src={coverImg || "/brand/placeholder-product.svg"}
          alt={product.name}
          fill
          className={cn(
            "object-cover transition-all duration-700",
            hovered && hasHover ? "scale-105 opacity-0" : "scale-100 opacity-100"
          )}
          sizes={featured ? "(max-width:640px) 100vw, 50vw" : "(max-width:640px) 50vw, 25vw"}
        />
        {/* Hover */}
        {hasHover && (
          <Image
            src={hoverImg!}
            alt={`${product.name} — verso`}
            fill
            className={cn(
              "object-cover transition-all duration-700",
              hovered ? "scale-100 opacity-100" : "scale-95 opacity-0"
            )}
            sizes={featured ? "(max-width:640px) 100vw, 50vw" : "(max-width:640px) 50vw, 25vw"}
          />
        )}

        {/* Badges */}
        <div className="absolute left-1.5 top-1.5 flex flex-col gap-1 sm:left-2.5 sm:top-2.5">
          {discount > 0 && (
            <span className="rounded bg-red-600 px-1.5 py-0.5 text-[8px] font-bold text-white shadow-sm sm:px-2 sm:text-[9px]">
              -{discount}%
            </span>
          )}
          {product.badge && product.badge !== "Promoção" && (
            <span className="rounded bg-foreground px-1.5 py-0.5 text-[8px] font-bold text-background shadow-sm sm:px-2 sm:text-[9px]">
              {product.badge}
            </span>
          )}
          {totalStock > 0 && totalStock <= 5 && !discount && (
            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[8px] font-bold text-white shadow-sm sm:px-2 sm:text-[9px]">
              Últimas {totalStock}!
            </span>
          )}
        </div>

        {/* Favorite */}
        <button
          className={cn(
            "absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full transition-all sm:right-2.5 sm:top-2.5",
            isFav ? "bg-white shadow-md" : "bg-white/0 opacity-0 group-hover:bg-white/90 group-hover:opacity-100"
          )}
          onClick={handleFav}
          aria-label="Favoritar"
        >
          <Heart className={cn("h-3.5 w-3.5", isFav ? "fill-red-500 text-red-500" : "text-neutral-600")} />
        </button>

        {/* Video badge */}
        {hasVideo && (
          <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider text-white backdrop-blur-sm sm:bottom-2.5 sm:left-2.5">
            <Play className="h-2 w-2 fill-white" /> Vídeo
          </span>
        )}

        {/* Out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
            <span className="rounded-full bg-neutral-900 px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-white">
              Esgotado
            </span>
          </div>
        )}

        {/* Hover CTA — desktop only */}
        <div className={cn(
          "absolute inset-x-0 bottom-0 flex justify-center pb-3 transition-all duration-300",
          hovered && !isOutOfStock ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        )}>
          <span className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-[10px] font-semibold text-background shadow-xl">
            <Eye className="h-3 w-3" /> Ver peça
          </span>
        </div>
      </div>

      {/* ===== INFO ===== */}
      <div className="mt-2 min-w-0 space-y-1 px-0.5 sm:mt-2.5">
        {/* Color dots */}
        {colors.length > 0 && (
          <div className="flex items-center gap-1">
            {colors.slice(0, 4).map(c => (
              <span
                key={c.name}
                className="h-2.5 w-2.5 rounded-full border border-border/60 sm:h-3 sm:w-3"
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
            {colors.length > 4 && (
              <span className="text-[8px] text-muted-foreground">+{colors.length - 4}</span>
            )}
          </div>
        )}

        {/* Name */}
        <h3 className="line-clamp-2 min-w-0 break-words text-[11px] font-medium leading-snug sm:text-[13px]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          {product.originalPrice && (
            <span className="text-[10px] text-muted-foreground/70 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className={cn(
            "text-sm font-bold sm:text-[15px]",
            product.originalPrice ? "text-red-600" : "text-foreground"
          )}>
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </Link>
  )
}
