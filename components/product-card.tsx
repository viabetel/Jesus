"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Play, Eye, ShoppingBag } from "lucide-react"
import { useFavorites } from "@/contexts/favorites-context"
import type { Product } from "@/lib/data/products"
import { getProductColors, getProductSizes, getTotalStock } from "@/lib/data/products"
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
  const sizes = getProductSizes(product)

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
      {/* ═══ IMAGE ═══ */}
      <div className={cn(
        "relative overflow-hidden bg-[#f3f0ea]",
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
        {/* Hover image */}
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

        {/* Badges — top left */}
        <div className="absolute left-2 top-2 flex flex-col gap-1 sm:left-2.5 sm:top-2.5">
          {discount > 0 && (
            <span className="rounded-md bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm sm:text-[10px]">
              -{discount}%
            </span>
          )}
          {product.badge && product.badge !== "Promoção" && (
            <span className="rounded-md bg-foreground px-2 py-0.5 text-[9px] font-bold text-background shadow-sm sm:text-[10px]">
              {product.badge}
            </span>
          )}
          {totalStock > 0 && totalStock <= 5 && !discount && (
            <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm sm:text-[10px]">
              Últimas {totalStock}!
            </span>
          )}
        </div>

        {/* Favorite — top right */}
        <button
          className={cn(
            "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full transition-all sm:right-2.5 sm:top-2.5 sm:h-9 sm:w-9",
            isFav ? "bg-white shadow-md" : "bg-white/80 opacity-0 shadow-sm group-hover:opacity-100",
            "sm:opacity-100 sm:bg-white/70"
          )}
          onClick={handleFav}
          aria-label="Favoritar"
        >
          <Heart className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isFav ? "fill-red-500 text-red-500" : "text-neutral-500")} />
        </button>

        {/* Video badge */}
        {hasVideo && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur-sm sm:bottom-2.5 sm:left-2.5 sm:text-[9px]">
            <Play className="h-2.5 w-2.5 fill-white" /> Vídeo
          </span>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
            <span className="rounded-full bg-neutral-900 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              Esgotado
            </span>
          </div>
        )}

        {/* Desktop hover CTA */}
        <div className={cn(
          "absolute inset-x-0 bottom-0 flex justify-center pb-3 transition-all duration-300",
          hovered && !isOutOfStock ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        )}>
          <span className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-background shadow-xl sm:text-[11px]">
            <Eye className="h-3 w-3" /> Ver produto
          </span>
        </div>
      </div>

      {/* ═══ INFO ═══ */}
      <div className="mt-2.5 min-w-0 space-y-1.5 px-0.5 sm:mt-3">
        {/* Name — bigger, readable */}
        <h3 className="line-clamp-2 min-w-0 break-words text-[12px] font-semibold leading-snug sm:text-[14px]">
          {product.name}
        </h3>

        {/* Colors */}
        {colors.length > 0 && (
          <div className="flex items-center gap-1">
            {colors.slice(0, 5).map(c => (
              <span
                key={c.name}
                className="h-3 w-3 rounded-full border border-border/50 sm:h-3.5 sm:w-3.5"
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
            {colors.length > 5 && (
              <span className="text-[9px] text-muted-foreground">+{colors.length - 5}</span>
            )}
          </div>
        )}

        {/* Sizes */}
        {sizes.length > 0 && (
          <div className="flex items-center gap-1">
            {sizes.map(s => (
              <span key={s} className="rounded border border-border/40 px-1.5 py-0.5 text-[8px] font-medium text-muted-foreground sm:text-[9px]">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Price — prominent */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {product.originalPrice && (
            <span className="text-[11px] text-muted-foreground/60 line-through sm:text-xs">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className={cn(
            "text-[15px] font-bold sm:text-[17px]",
            product.originalPrice ? "text-red-600" : "text-foreground"
          )}>
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Mobile action — always visible */}
        <div className="flex items-center gap-1.5 pt-0.5 sm:hidden">
          <span className="flex items-center gap-1 rounded-full bg-muted/50 px-3 py-1.5 text-[10px] font-semibold text-foreground/60">
            <ShoppingBag className="h-3 w-3" /> Ver produto
          </span>
        </div>
      </div>
    </Link>
  )
}
