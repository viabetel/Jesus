"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Play, MessageCircle } from "lucide-react"
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

export function ProductCard({ product }: { product: CardProduct }) {
  const [hovered, setHovered] = useState(false)
  const { toggleFavorite, isFavorite } = useFavorites()

  const isFav = isFavorite(product.id)
  const totalStock = getTotalStock(product)
  const isOutOfStock = totalStock === 0
  const discount = product.originalPrice ? getDiscountPercent(product.originalPrice, product.price) : 0
  const colors = getProductColors(product)
  const hasVideo = product.hasVideo ?? !!product.video

  const coverImg = product.coverImage ?? product.images[0]
  const hoverImg = product.hoverImage ?? product.images[1]
  const hasHover = !!hoverImg

  // Badge logic: olive for "Pronta Entrega", tan for "Lançamento"/"Mais Vendido", red for promo
  const badgeText = product.badge || (product.isPromotion ? "Promoção" : product.isNew ? "Lançamento" : totalStock > 0 ? "Pronta Entrega" : null)
  const badgeClass = product.isPromotion || discount > 0
    ? "bg-[var(--promo)]"
    : badgeText === "Lançamento" || badgeText === "Mais vendida" || product.isBestseller
      ? "status-pill--tan"
      : "status-pill--olive"

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    toggleFavorite(product)
    if (!isFav) toast.success("Favoritado!")
  }

  return (
    <div className="group">
      <Link
        href={`/produto/${product.slug}`}
        className="block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div className="relative aspect-[3/4] bg-[var(--stone)] overflow-hidden">
          <Image
            src={coverImg || "/brand/placeholder-product.svg"}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-all duration-[1200ms]",
              hovered && hasHover ? "scale-105 opacity-0" : "scale-100 opacity-100"
            )}
            sizes="(max-width:640px) 50vw, 25vw"
          />
          {hasHover && (
            <Image
              src={hoverImg!}
              alt={`${product.name} — verso`}
              fill
              className={cn(
                "object-cover transition-all duration-[1200ms]",
                hovered ? "scale-100 opacity-100" : "scale-95 opacity-0"
              )}
              sizes="(max-width:640px) 50vw, 25vw"
            />
          )}

          {/* Badge */}
          {badgeText && (
            <span className={cn("absolute top-3 left-3 px-3 py-[5px] text-[10px] font-medium text-white tracking-[0.02em] sm:top-4 sm:left-4 sm:text-[11px]", badgeClass)}>
              {badgeText}
            </span>
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <span className="absolute top-3 right-12 px-2.5 py-1 text-[10px] font-semibold tracking-wide bg-[var(--promo)] text-white sm:top-4 sm:right-14 sm:text-[11px]">
              −{discount}%
            </span>
          )}

          {/* Favorite */}
          <button
            className={cn(
              "absolute top-3 right-3 h-8 w-8 grid place-items-center transition sm:top-4 sm:right-4 sm:h-9 sm:w-9",
              isFav ? "bg-white" : "bg-white/85 hover:bg-white"
            )}
            onClick={handleFav}
            aria-label="Favoritar"
          >
            <Heart size={14} className={cn(isFav ? "fill-[var(--promo)] text-[var(--promo)]" : "text-[var(--ink)]")} strokeWidth={1.5} />
          </button>

          {/* Video badge */}
          {hasVideo && (
            <span className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur-sm sm:bottom-4 sm:left-4 sm:text-[9px]">
              <Play size={10} fill="white" /> Vídeo
            </span>
          )}

          {/* Out of stock */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
              <span className="caps text-[10px] bg-[var(--ink)] text-white px-4 py-2 sm:text-[11px]">Esgotado</span>
            </div>
          )}

          {/* Hover CTA */}
          <div className={cn(
            "absolute inset-x-3 bottom-3 transition-all duration-300 sm:inset-x-4 sm:bottom-4",
            hovered && !isOutOfStock ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}>
            <span className="w-full bg-white text-[var(--ink)] caps text-[9px] py-2.5 hover:bg-[var(--ink)] hover:text-white transition flex items-center justify-center gap-2 sm:text-[10.5px] sm:py-3">
              <MessageCircle size={13} /> Compra Rápida
            </span>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="pt-4 pb-2 px-1 text-center sm:pt-5">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="caps text-[10px] tracking-[0.14em] text-[var(--ink)] line-clamp-2 sm:text-[11.5px]">{product.name}</h3>
        </Link>

        <div className="mt-1.5 flex items-baseline justify-center gap-2 sm:mt-2">
          {product.originalPrice && (
            <span className="text-[11px] text-[var(--muted-foreground)] line-through sm:text-[12.5px]">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className={cn("text-[14px] font-medium sm:text-[15px]", product.originalPrice ? "text-[var(--promo)]" : "text-[var(--ink)]")}>
            {formatPrice(product.price)}
          </span>
        </div>

        {product.price >= 30 && (
          <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 sm:text-[11.5px]">
            ou em <span className="font-semibold text-[var(--ink)]/85">3x de {formatPrice(product.price / 3)}</span> sem juros
          </p>
        )}

        {/* Colors */}
        {colors.length > 0 && (
          <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap sm:mt-3">
            {colors.slice(0, 6).map((c, ci) => (
              <span
                key={c.name}
                className={cn(
                  "h-[14px] w-[14px] rounded-full transition sm:h-[16px] sm:w-[16px]",
                  ci === 0 ? "ring-1 ring-[var(--ink)] ring-offset-2" : "",
                  c.value === "#FFFFFF" ? "border border-black/15" : ""
                )}
                style={{ background: c.value }}
                title={c.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
