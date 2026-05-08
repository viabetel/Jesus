"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { X, ShoppingBag, MessageCircle, ArrowRight, Check, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product, ProductSize, ProductColor } from "@/lib/data/products"
import { getProductMedia } from "@/lib/data/media"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import { WHATSAPP_NUMBER, createWhatsAppLink, formatProductMessage } from "@/lib/whatsapp"
import { formatPrice, getDiscountPercent } from "@/lib/format"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type QuickViewProps = {
  product: Product
  open: boolean
  onClose: () => void
}

export function QuickView({ product, open, onClose }: QuickViewProps) {
  const media = getProductMedia(product)
  const [size, setSize] = useState<ProductSize | null>(product.sizes[0] ?? null)
  const [color, setColor] = useState<ProductColor | null>(product.colors[0] ?? null)
  const { addItem } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const isFav = isFavorite(product.id)
  const isOutOfStock = product.stock === 0
  const discount = product.originalPrice ? getDiscountPercent(product.originalPrice, product.price) : 0

  if (!open) return null

  const handleAdd = () => {
    if (!size || !color || isOutOfStock) return
    addItem(product, size, color, 1)
    toast.success("Adicionado à sacola!", { description: `${product.name} — ${size} — ${color.name}` })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Visualização rápida: ${product.name}`}
    >
      <div
        className="relative grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-2xl bg-background shadow-2xl sm:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition hover:scale-105"
          aria-label="Fechar"
        >
          <X className="h-4 w-4 text-foreground" />
        </button>

        {/* Image */}
        <div className="relative aspect-square bg-muted sm:aspect-auto sm:min-h-[420px]">
          <Image src={media.cover} alt={product.name} fill className="object-cover" sizes="(max-width:640px) 100vw, 50vw" />
          {product.badge && (
            <span className={cn(
              "absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              product.badge === "Promoção" ? "bg-red-600 text-white"
                : product.badge === "Mais vendida" ? "bg-[#C2A87D] text-white"
                : "bg-foreground text-background"
            )}>
              {product.badge}{discount > 0 && product.badge === "Promoção" && ` -${discount}%`}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-col p-5 sm:p-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{product.category}</p>
          <h2 className="mt-1 line-clamp-2 break-words font-serif text-lg font-bold sm:text-xl">{product.name}</h2>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className={cn("text-xl font-bold", product.originalPrice && "text-red-600")}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Size */}
          <div className="mt-4">
            <span className="text-xs font-medium">Tamanho</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  disabled={isOutOfStock}
                  className={cn(
                    "min-w-[36px] rounded-full border px-3 py-1 text-xs transition",
                    size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="mt-3">
            <span className="text-xs font-medium">Cor: <span className="text-muted-foreground">{color?.name ?? "—"}</span></span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c)}
                  disabled={isOutOfStock}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2",
                    color?.name === c.name ? "border-foreground ring-2 ring-foreground ring-offset-2" : "border-border"
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                  aria-label={c.name}
                >
                  {color?.name === c.name && (
                    <Check className={cn("h-3 w-3", c.value === "#FFFFFF" || c.value === "#FAF9F6" ? "text-foreground" : "text-white")} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              size="sm"
              className="h-10 min-w-0 flex-1 gap-1.5 rounded-full text-xs"
              onClick={handleAdd}
              disabled={isOutOfStock || !size || !color}
            >
              <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Sacola</span>
            </Button>
            <a
              href={createWhatsAppLink(WHATSAPP_NUMBER, formatProductMessage(product.name))}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1"
            >
              <Button size="sm" className="h-10 w-full gap-1.5 rounded-full bg-[#25D366] text-xs text-white hover:bg-[#1DA851]" disabled={isOutOfStock}>
                <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">WhatsApp</span>
              </Button>
            </a>
            <Button
              size="sm"
              variant="outline"
              className="h-10 w-10 shrink-0 rounded-full p-0"
              onClick={() => { toggleFavorite(product); if (!isFav) toast.success("Favoritado!") }}
              aria-label="Favoritar"
            >
              <Heart className={cn("h-4 w-4", isFav && "fill-current text-red-500")} />
            </Button>
          </div>

          <Link href={`/produto/${product.slug}`} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            Ver página completa <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
