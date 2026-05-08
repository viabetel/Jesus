"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, MessageCircle, Play, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/contexts/favorites-context"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/lib/data/products"
import { getProductMedia } from "@/lib/data/media"
import { WHATSAPP_NUMBER, createWhatsAppLink, formatProductMessage } from "@/lib/whatsapp"
import { formatPrice, getDiscountPercent } from "@/lib/format"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { QuickView } from "@/components/quick-view"

type ProductCardProps = {
  product: Product
  featured?: boolean
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const { toggleFavorite, isFavorite } = useFavorites()
  const { addItem } = useCart()

  const media = getProductMedia(product)
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

  const openQuick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setQuickOpen(true)
  }

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case "Promoção": return "bg-red-600 text-white"
      case "Novidade":
      case "Lançamento": return "bg-foreground text-background"
      case "Mais vendida": return "bg-[#C2A87D] text-white"
      case "Esgotado": return "bg-muted text-muted-foreground"
      default: return "bg-muted text-foreground"
    }
  }

  return (
    <>
      <div
        className={cn(
          // min-w-0 evita overflow horizontal quando o card está em flex/grid apertado
          "group relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-border/40 bg-card transition-all duration-300 hover:border-border hover:shadow-lg",
          featured && "sm:rounded-xl lg:flex-row"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ===== IMAGE ===== */}
        <Link
          href={`/produto/${product.slug}`}
          className={cn(
            "relative aspect-[4/5] overflow-hidden bg-muted",
            featured && "lg:w-1/2 lg:aspect-auto lg:min-h-[340px]"
          )}
        >
          {/* Cover */}
          <Image
            src={media.cover}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-all duration-500",
              // Em desktop, se houver hover image, ela aparece e a cover some.
              media.hover && "sm:group-hover:opacity-0",
              // Sem hover image, faz zoom suave igual antes
              !media.hover && isHovered && "scale-105"
            )}
            sizes={featured
              ? "(max-width:1024px) 50vw, 40vw"
              : "(max-width:379px) 100vw, (max-width:639px) 50vw, (max-width:1023px) 33vw, 25vw"}
          />
          {/* Hover image — só ativa em ≥sm */}
          {media.hover && (
            <Image
              src={media.hover}
              alt={`${product.name} — hover`}
              fill
              className="hidden object-cover opacity-0 transition-opacity duration-500 sm:block sm:group-hover:opacity-100"
              sizes={featured
                ? "(max-width:1024px) 50vw, 40vw"
                : "(max-width:639px) 50vw, (max-width:1023px) 33vw, 25vw"}
            />
          )}

          {/* Badge */}
          {product.badge && (
            <span className={cn(
              "absolute left-2 top-2 max-w-[calc(100%-3rem)] truncate rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-[10px]",
              getBadgeStyle(product.badge)
            )}>
              {product.badge}{discount > 0 && product.badge === "Promoção" && ` -${discount}%`}
            </span>
          )}

          {/* Favorite */}
          <button
            className={cn(
              "absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur-sm transition-all sm:right-3 sm:top-3 sm:h-9 sm:w-9",
              isFav ? "opacity-100" : "opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
            )}
            onClick={handleToggleFavorite}
            aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isFav ? "fill-red-500 text-red-500" : "text-gray-700")} />
          </button>

          {/* Quick View — só ≥sm */}
          {!isOutOfStock && (
            <button
              className="absolute right-3 top-14 z-10 hidden h-9 w-9 items-center justify-center rounded-full bg-white/85 opacity-0 shadow-sm backdrop-blur-sm transition-opacity sm:flex sm:group-hover:opacity-100"
              onClick={openQuick}
              aria-label="Ver rápido"
              title="Ver rápido"
            >
              <Eye className="h-4 w-4 text-gray-700" />
            </button>
          )}

          {/* Video badge */}
          {product.video && !isOutOfStock && (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm">
              <Play className="h-2.5 w-2.5 fill-white" /> Vídeo
            </span>
          )}

          {/* Out of stock */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground">Esgotado</span>
            </div>
          )}
        </Link>

        {/* ===== CONTENT ===== */}
        <div className={cn("flex min-w-0 flex-1 flex-col p-2.5 sm:p-4", featured && "lg:p-6")}>
          {/* Category — escondida em telas muito pequenas */}
          <p className="hidden truncate text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground min-[380px]:block sm:text-[10px]">
            {product.category}
          </p>

          {/* Title */}
          <Link href={`/produto/${product.slug}`} className="min-w-0">
            <h3 className={cn(
              "mt-0.5 line-clamp-2 break-words font-serif text-xs font-semibold leading-snug transition-colors hover:text-muted-foreground sm:mt-1.5 sm:text-sm",
              featured && "sm:text-base lg:text-lg"
            )}>
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:mt-2 sm:gap-x-2">
            <span className={cn("text-sm font-bold sm:text-base", product.originalPrice && "text-red-600")}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] text-muted-foreground line-through sm:text-xs">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Sizes & Colors — escondidos em telas muito pequenas para preservar espaço */}
          <div className="mt-1.5 hidden items-center gap-2 min-[380px]:flex sm:mt-3">
            <div className="flex min-w-0 flex-wrap gap-0.5 sm:gap-1">
              {product.sizes.slice(0, 4).map((size) => (
                <span key={size} className="rounded border px-1 py-px text-[8px] text-muted-foreground sm:px-1.5 sm:py-0.5 sm:text-[10px]">
                  {size}
                </span>
              ))}
            </div>
            <div className="flex min-w-0 flex-wrap gap-0.5 sm:gap-1">
              {product.colors.slice(0, 3).map((color) => (
                <span
                  key={color.name}
                  className="h-3 w-3 shrink-0 rounded-full border border-border/40 sm:h-3.5 sm:w-3.5"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-[8px] text-muted-foreground">+{product.colors.length - 3}</span>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-2 sm:mt-3">
            {/* Mobile pequeno (≤379px): CTA único e compacto, sem dois botões lado a lado */}
            <div className="min-[380px]:hidden">
              <Link href={`/produto/${product.slug}`}>
                <Button variant="outline" size="sm" className="h-8 w-full rounded-full text-[10px]">
                  Ver produto
                </Button>
              </Link>
            </div>
            {/* Mobile médio (≥380px) e maior: dois botões */}
            <div className="hidden min-w-0 gap-1.5 min-[380px]:flex sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 min-w-0 flex-1 gap-1 rounded-full px-2 text-[10px] sm:h-9 sm:text-xs"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingBag className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                <span className="truncate">Sacola</span>
              </Button>
              <a
                href={createWhatsAppLink(WHATSAPP_NUMBER, formatProductMessage(product.name))}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="sm"
                  className="h-8 w-full min-w-0 gap-1 rounded-full bg-[#25D366] px-2 text-[10px] text-white hover:bg-[#1DA851] sm:h-9 sm:text-xs"
                  disabled={isOutOfStock}
                >
                  <MessageCircle className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                  <span className="truncate">Zap</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <QuickView product={product} open={quickOpen} onClose={() => setQuickOpen(false)} />
    </>
  )
}
