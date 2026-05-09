"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Play } from "lucide-react"
import { useFavorites } from "@/contexts/favorites-context"
import type { Product } from "@/lib/data/products"
import { getProductColors, getTotalStock } from "@/lib/data/products"
import { formatPrice, getDiscountPercent } from "@/lib/format"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const { toggleFavorite, isFavorite } = useFavorites()

  const isFav = isFavorite(product.id)
  const totalStock = getTotalStock(product)
  const isOutOfStock = totalStock === 0
  const discount = product.originalPrice ? getDiscountPercent(product.originalPrice, product.price) : 0
  const colors = getProductColors(product)
  const hasHoverImage = product.images.length > 1
  const coverImg = product.images[0]
  const hoverImg = product.images[1]

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    toggleFavorite(product)
    if (!isFav) toast.success("Adicionado aos favoritos!")
  }

  return (
    <Link href={`/produto/${product.slug}`} className="group block" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {/* Image */}
      <div className={cn("relative mb-2 overflow-hidden rounded-lg bg-[#f6f2ea]", featured ? "aspect-[3/4]" : "aspect-[4/5]")}>
        {/* Cover image */}
        <Image src={coverImg || "/brand/placeholder-product.svg"} alt={product.name} fill
          className={cn("object-cover transition-all duration-500", hovered && hasHoverImage ? "opacity-0 scale-105" : "opacity-100")}
          sizes={featured ? "(max-width:640px) 100vw, 50vw" : "(max-width:640px) 50vw, 25vw"} />

        {/* Hover image */}
        {hasHoverImage && (
          <Image src={hoverImg!} alt={`${product.name} — costas`} fill
            className={cn("object-cover transition-all duration-500", hovered ? "opacity-100 scale-100" : "opacity-0 scale-95")}
            sizes={featured ? "(max-width:640px) 100vw, 50vw" : "(max-width:640px) 50vw, 25vw"} />
        )}

        {/* Badge */}
        {product.badge && (
          <span className={cn("absolute left-2 top-2 rounded-sm px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider sm:text-[9px]",
            product.badge === "Promoção" ? "bg-red-600 text-white" :
            product.badge === "Mais vendida" ? "bg-foreground text-background" :
            product.badge === "Novidade" || product.badge === "Lançamento" ? "bg-foreground text-background" :
            "bg-muted/90 text-foreground"
          )}>
            {product.badge === "Promoção" && discount > 0 ? `-${discount}%` : product.badge}
          </span>
        )}

        {/* Fav button */}
        <button className={cn("absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full transition-all",
          isFav ? "bg-white shadow-md opacity-100" : "bg-white/0 opacity-0 group-hover:bg-white/80 group-hover:opacity-100"
        )} onClick={handleFav} aria-label="Favoritar">
          <Heart className={cn("h-3.5 w-3.5", isFav ? "fill-red-500 text-red-500" : "text-neutral-600")} />
        </button>

        {/* Video badge */}
        {product.video && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-sm bg-black/60 px-1.5 py-0.5 text-[7px] font-semibold text-white uppercase tracking-wider backdrop-blur-sm">
            <Play className="h-2 w-2 fill-white" /> Vídeo
          </span>
        )}

        {/* Out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70"><span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Esgotado</span></div>
        )}

        {/* Quick CTA on hover */}
        <div className={cn("absolute bottom-0 left-0 right-0 flex items-center justify-center py-2.5 transition-all duration-300",
          hovered && !isOutOfStock ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}>
          <span className="rounded-full bg-foreground px-5 py-1.5 text-[10px] font-semibold text-background shadow-lg">Ver peça</span>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-0.5 px-0.5">
        {/* Colors */}
        {colors.length > 0 && (
          <div className="flex gap-1">
            {colors.slice(0, 4).map(c => (
              <span key={c.name} className="h-2.5 w-2.5 rounded-full border border-border/50" style={{ backgroundColor: c.value }} title={c.name} />
            ))}
            {colors.length > 4 && <span className="text-[8px] text-muted-foreground">+{colors.length - 4}</span>}
          </div>
        )}

        <h3 className="line-clamp-1 text-xs font-medium leading-snug group-hover:underline sm:text-[13px]">{product.name}</h3>

        <div className="flex items-baseline gap-1.5">
          {product.originalPrice && (
            <span className="text-[10px] text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
          )}
          <span className={cn("text-sm font-bold", product.originalPrice && "text-red-600")}>{formatPrice(product.price)}</span>
        </div>

        {totalStock > 0 && totalStock <= 5 && (
          <p className="text-[8px] font-medium text-amber-600">Últimas {totalStock} un.</p>
        )}
      </div>
    </Link>
  )
}
