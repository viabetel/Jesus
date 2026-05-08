"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Heart, ShoppingBag, MessageCircle, Minus, Plus, Ruler, Truck, RefreshCw,
  Check, AlertCircle, ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import type { Product, ProductSize, ProductColor } from "@/lib/data/products"
import { WHATSAPP_NUMBER, createWhatsAppLink, formatProductMessage } from "@/lib/whatsapp"
import { formatPrice, getDiscountPercent } from "@/lib/format"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ProductGallery } from "./product-gallery"

export function ProductDetails({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(product.sizes[0] || null)
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(product.colors[0] || null)
  const [quantity, setQuantity] = useState(1)
  const [descOpen, setDescOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const { addItem, isInCart } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()

  const isFav = isFavorite(product.id)
  const isOutOfStock = product.stock === 0
  const inCart = isInCart(product.id, selectedSize || undefined, selectedColor?.name)
  const discount = product.originalPrice ? getDiscountPercent(product.originalPrice, product.price) : 0

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor || isOutOfStock) return
    addItem(product, selectedSize, selectedColor, quantity)
    toast.success("Adicionado à sacola!", { description: `${product.name} — ${selectedSize} — ${selectedColor.name}` })
  }

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[minmax(320px,480px)_1fr] lg:gap-10 xl:grid-cols-[480px_1fr]">
        {/* ===== GALLERY ===== */}
        <ProductGallery product={product} />

        {/* ===== INFO ===== */}
        <div className="space-y-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[10px] text-muted-foreground sm:text-xs">
            <Link href="/" className="hover:text-foreground">Início</Link><span>/</span>
            <Link href="/produtos" className="hover:text-foreground">Produtos</Link><span>/</span>
            <span className="truncate text-foreground">{product.name}</span>
          </nav>

          {/* Title + Price */}
          <div>
            <p className="text-[9px] font-medium tracking-[0.12em] text-muted-foreground uppercase sm:text-[10px]">{product.category}</p>
            <h1 className="mt-1 font-serif text-lg font-bold sm:text-xl lg:text-2xl">{product.name}</h1>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className={cn("text-lg font-bold sm:text-xl", product.originalPrice && "text-red-600")}>{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="rounded-full bg-red-100 px-1.5 py-px text-[9px] font-semibold text-red-700">-{discount}%</span>
                </>
              )}
            </div>
          </div>

          {/* Size */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium sm:text-sm">Tamanho</span>
              <Link href="/guia-de-medidas" className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground sm:text-xs">
                <Ruler className="h-3 w-3" /> Guia
              </Link>
            </div>
            <div className="flex gap-2">
              {product.sizes.map((s) => (
                <Button key={s} variant={selectedSize === s ? "default" : "outline"} className="h-9 min-w-[40px] rounded-full text-xs touch-target sm:h-10 sm:min-w-[44px]" onClick={() => setSelectedSize(s)} disabled={isOutOfStock}>
                  {s}
                </Button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <span className="mb-2 block text-xs font-medium sm:text-sm">Cor: {selectedColor?.name || "—"}</span>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button key={c.name} className={cn("flex h-9 w-9 items-center justify-center rounded-full border-2 touch-target sm:h-10 sm:w-10", selectedColor?.name === c.name ? "border-foreground ring-2 ring-foreground ring-offset-2" : "border-border")} style={{ backgroundColor: c.value }} onClick={() => setSelectedColor(c)} disabled={isOutOfStock} title={c.name}>
                  {selectedColor?.name === c.name && <Check className={cn("h-3.5 w-3.5", c.value === "#FFFFFF" || c.value === "#FAF9F6" ? "text-foreground" : "text-white")} />}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium sm:text-sm">Qtd:</span>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full touch-target" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={isOutOfStock || quantity <= 1}><Minus className="h-3.5 w-3.5" /></Button>
            <span className="min-w-[28px] text-center text-sm font-medium">{quantity}</span>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full touch-target" onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} disabled={isOutOfStock || quantity >= product.stock}><Plus className="h-3.5 w-3.5" /></Button>
            {product.stock <= 10 && <span className="text-[10px] text-red-500">Últimas {product.stock} un.</span>}
          </div>

          {/* Notice */}
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <p className="text-[10px] leading-relaxed text-muted-foreground sm:text-xs">Disponibilidade, pagamento e entrega confirmados pelo WhatsApp.</p>
          </div>

          {/* Desktop Actions */}
          <div className="hidden gap-2 sm:flex">
            <Button size="lg" className="h-11 flex-1 gap-2 rounded-xl text-sm" onClick={handleAddToCart} disabled={isOutOfStock || !selectedSize || !selectedColor}>
              <ShoppingBag className="h-4 w-4" /> {inCart ? "Na sacola" : "Adicionar à sacola"}
            </Button>
            <Button variant="outline" size="lg" className="h-11 gap-2 rounded-xl text-sm" onClick={() => { toggleFavorite(product); if (!isFav) toast.success("Favoritado!") }}>
              <Heart className={cn("h-4 w-4", isFav && "fill-current text-red-500")} />
            </Button>
          </div>
          <a href={createWhatsAppLink(WHATSAPP_NUMBER, formatProductMessage(product.name))} target="_blank" rel="noopener noreferrer" className="hidden sm:block">
            <Button size="lg" className="h-11 w-full gap-2 rounded-xl bg-[#25D366] text-sm text-white hover:bg-[#1DA851]" disabled={isOutOfStock}>
              <MessageCircle className="h-4 w-4" /> Comprar pelo WhatsApp
            </Button>
          </a>

          {/* Accordions */}
          <div className="space-y-0 border-t">
            <button onClick={() => setDescOpen(!descOpen)} className="flex w-full items-center justify-between py-3 text-left text-sm font-medium">
              Descrição <ChevronDown className={cn("h-4 w-4 transition-transform", descOpen && "rotate-180")} />
            </button>
            {descOpen && <p className="pb-3 text-xs leading-relaxed text-muted-foreground">{product.description}</p>}
            <button onClick={() => setDetailsOpen(!detailsOpen)} className="flex w-full items-center justify-between border-t py-3 text-left text-sm font-medium">
              Detalhes <ChevronDown className={cn("h-4 w-4 transition-transform", detailsOpen && "rotate-180")} />
            </button>
            {detailsOpen && (
              <ul className="space-y-1.5 pb-3">
                {product.details.map((d, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="h-3 w-3 text-[#C2A87D]" /> {d}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Shipping/Returns */}
          <div className="flex gap-4 border-t pt-4 text-xs">
            <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium">Entrega</p><p className="text-[10px] text-muted-foreground">Pelo WhatsApp</p></div></div>
            <div className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium">Trocas</p><Link href="/trocas-e-entregas" className="text-[10px] text-muted-foreground underline">Ver política</Link></div></div>
          </div>
        </div>
      </div>

      {/* ===== STICKY MOBILE CTA ===== */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur-sm sm:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={() => { toggleFavorite(product); if (!isFav) toast.success("Favoritado!") }}>
            <Heart className={cn("h-4 w-4", isFav && "fill-current text-red-500")} />
          </Button>
          <Button className="h-10 flex-1 gap-1.5 rounded-full text-xs" onClick={handleAddToCart} disabled={isOutOfStock || !selectedSize || !selectedColor}>
            <ShoppingBag className="h-3.5 w-3.5" /> {inCart ? "Na sacola" : "Sacola"}
          </Button>
          <a href={createWhatsAppLink(WHATSAPP_NUMBER, formatProductMessage(product.name))} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button className="h-10 w-full gap-1.5 rounded-full bg-[#25D366] text-xs text-white hover:bg-[#1DA851]" disabled={isOutOfStock}>
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </>
  )
}
