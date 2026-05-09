"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Heart, ShoppingBag, MessageCircle, Minus, Plus, Ruler, Truck, RefreshCw, Check, AlertCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import type { Product, ProductSize, ProductColor } from "@/lib/data/products"
import { getProductColors, getProductSizes, getVariantStock, getAvailableSizesForColor, getAvailableColorsForSize, getTotalStock } from "@/lib/data/products"
import { WHATSAPP_NUMBER, createWhatsAppLink, formatProductMessage } from "@/lib/whatsapp"
import { formatPrice, getDiscountPercent } from "@/lib/format"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ProductGallery } from "./product-gallery"

export function ProductDetails({ product }: { product: Product }) {
  const allColors = useMemo(() => getProductColors(product), [product])
  const allSizes = useMemo(() => getProductSizes(product), [product])

  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(allColors[0] || null)
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [descOpen, setDescOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const { addItem, isInCart } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()

  // Variant-aware computed state
  const availableSizes = useMemo(() => selectedColor ? getAvailableSizesForColor(product, selectedColor.name) : allSizes, [product, selectedColor, allSizes])
  const availableColors = useMemo(() => selectedSize ? getAvailableColorsForSize(product, selectedSize) : allColors, [product, selectedSize, allColors])

  const currentStock = useMemo(() => {
    if (!selectedColor || !selectedSize) return 0
    return getVariantStock(product, selectedColor.name, selectedSize)
  }, [product, selectedColor, selectedSize])

  const totalStock = useMemo(() => getTotalStock(product), [product])
  const isOutOfStock = totalStock === 0
  const canAdd = selectedColor && selectedSize && currentStock > 0
  const isFav = isFavorite(product.id)
  const inCart = isInCart(product.id, selectedSize || undefined, selectedColor?.name)
  const discount = product.originalPrice ? getDiscountPercent(product.originalPrice, product.price) : 0

  const handleColorSelect = (c: ProductColor) => {
    setSelectedColor(c)
    // Reset size if not available for this color
    if (selectedSize && getVariantStock(product, c.name, selectedSize) === 0) {
      setSelectedSize(null)
    }
    setQuantity(1)
  }

  const handleSizeSelect = (s: ProductSize) => {
    setSelectedSize(s)
    setQuantity(1)
  }

  const handleAddToCart = () => {
    if (!canAdd || !selectedColor || !selectedSize) return
    if (quantity > currentStock) {
      toast.error(`Estoque insuficiente. Disponível: ${currentStock} un.`)
      return
    }
    const ok = addItem(product, selectedSize, selectedColor, quantity)
    if (!ok) {
      toast.error("Não foi possível adicionar. Verifique o estoque desta variação.")
      return
    }
    toast.success("Adicionado à sacola!", { description: `${product.name} — ${selectedSize} — ${selectedColor.name}` })
  }

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[minmax(300px,480px)_1fr] lg:gap-8 xl:grid-cols-[480px_1fr]">
        <ProductGallery product={product} />

        <div className="space-y-3.5">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[10px] text-muted-foreground sm:text-xs">
            <Link href="/" className="hover:text-foreground">Início</Link><span>/</span>
            <Link href="/produtos" className="hover:text-foreground">Produtos</Link><span>/</span>
            <span className="truncate text-foreground">{product.name}</span>
          </nav>

          {/* Title + Price */}
          <div>
            <p className="text-[9px] font-medium tracking-[0.12em] text-muted-foreground uppercase sm:text-[10px]">{product.category}</p>
            <h1 className="mt-0.5 font-serif text-base font-bold leading-snug sm:text-xl lg:text-2xl">{product.name}</h1>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={cn("text-base font-bold sm:text-lg", product.originalPrice && "text-red-600")}>{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-[10px] text-muted-foreground line-through sm:text-xs">{formatPrice(product.originalPrice)}</span>
                  <span className="rounded-full bg-red-100 px-1.5 py-px text-[9px] font-semibold text-red-700">-{discount}%</span>
                </>
              )}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">SKU: {product.sku}</p>
          </div>

          {/* Color — variant-aware */}
          <div>
            <span className="mb-1.5 block text-xs font-medium sm:text-sm">Cor: {selectedColor?.name || "Selecione"}</span>
            <div className="flex flex-wrap gap-2">
              {allColors.map((c) => {
                const isAvail = availableColors.some(ac => ac.name === c.name)
                return (
                  <button key={c.name} disabled={!isAvail}
                    className={cn("relative flex h-9 w-9 items-center justify-center rounded-full border-2 sm:h-10 sm:w-10",
                      selectedColor?.name === c.name ? "border-foreground ring-2 ring-foreground ring-offset-2" : "border-border",
                      !isAvail && "opacity-30 cursor-not-allowed"
                    )}
                    style={{ backgroundColor: c.value }} onClick={() => handleColorSelect(c)} title={c.name}>
                    {selectedColor?.name === c.name && <Check className={cn("h-3.5 w-3.5", c.value === "#FFFFFF" || c.value === "#FAF9F6" ? "text-foreground" : "text-white")} />}
                    {!isAvail && <X className="absolute h-5 w-5 text-red-500" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Size — variant-aware */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium sm:text-sm">Tamanho{!selectedSize && " — selecione"}</span>
              <Link href="/guia-de-medidas" className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground sm:text-xs"><Ruler className="h-3 w-3" /> Guia</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {allSizes.map((s) => {
                const stock = selectedColor ? getVariantStock(product, selectedColor.name, s) : 0
                const isAvail = availableSizes.includes(s) && stock > 0
                return (
                  <Button key={s} variant={selectedSize === s ? "default" : "outline"} disabled={!isAvail}
                    className={cn("h-9 min-w-[42px] rounded-full text-xs sm:h-10 sm:min-w-[46px]", !isAvail && "line-through opacity-40")}
                    onClick={() => handleSizeSelect(s)}>
                    {s}
                  </Button>
                )
              })}
            </div>
            {selectedColor && selectedSize && currentStock > 0 && currentStock <= 5 && (
              <p className="mt-1 text-[10px] font-medium text-amber-600">Restam {currentStock} un. nessa variação</p>
            )}
            {selectedColor && selectedSize && currentStock === 0 && (
              <p className="mt-1 text-[10px] font-medium text-red-500">Esgotado nessa variação</p>
            )}
          </div>

          {/* Quantity */}
          {canAdd && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium sm:text-sm">Qtd:</span>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}><Minus className="h-3.5 w-3.5" /></Button>
              <span className="min-w-[24px] text-center text-sm font-medium">{quantity}</span>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setQuantity(q => Math.min(currentStock, q + 1))} disabled={quantity >= currentStock}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
          )}

          {/* Notice */}
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-2.5">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <p className="text-[10px] leading-relaxed text-muted-foreground sm:text-xs">Disponibilidade e pagamento confirmados pelo WhatsApp.</p>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden gap-2 sm:flex">
            <Button size="lg" className="h-10 flex-1 gap-2 rounded-xl text-sm" onClick={handleAddToCart} disabled={!canAdd}>
              <ShoppingBag className="h-4 w-4" /> {inCart ? "Na sacola" : "Adicionar à sacola"}
            </Button>
            <Button variant="outline" size="lg" className="h-10 gap-2 rounded-xl" onClick={() => { toggleFavorite(product); if (!isFav) toast.success("Favoritado!") }}>
              <Heart className={cn("h-4 w-4", isFav && "fill-current text-red-500")} />
            </Button>
          </div>
          {!canAdd && !isOutOfStock && (
            <p className="hidden text-xs text-muted-foreground sm:block">Selecione cor e tamanho para adicionar à sacola.</p>
          )}
          <a href={createWhatsAppLink(WHATSAPP_NUMBER, formatProductMessage(product.name))} target="_blank" rel="noopener noreferrer" className="hidden sm:block">
            <Button size="lg" className="h-10 w-full gap-2 rounded-xl bg-[#25D366] text-sm text-white hover:bg-[#1DA851]" disabled={isOutOfStock}><MessageCircle className="h-4 w-4" /> Comprar pelo WhatsApp</Button>
          </a>

          {/* Accordions */}
          <div className="space-y-0 border-t">
            <button onClick={() => setDescOpen(!descOpen)} className="flex w-full items-center justify-between py-2.5 text-left text-sm font-medium">Descrição <ChevronDown className={cn("h-4 w-4 transition-transform", descOpen && "rotate-180")} /></button>
            {descOpen && <p className="pb-3 text-xs leading-relaxed text-muted-foreground">{product.description}</p>}
            <button onClick={() => setDetailsOpen(!detailsOpen)} className="flex w-full items-center justify-between border-t py-2.5 text-left text-sm font-medium">Detalhes <ChevronDown className={cn("h-4 w-4 transition-transform", detailsOpen && "rotate-180")} /></button>
            {detailsOpen && (
              <ul className="space-y-1 pb-3">
                {product.details.map((d, i) => (<li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="h-3 w-3 text-[#C2A87D]" /> {d}</li>))}
              </ul>
            )}
          </div>

          {/* Shipping */}
          <div className="flex gap-4 border-t pt-3 text-xs">
            <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium">Entrega</p><p className="text-[10px] text-muted-foreground">Pelo WhatsApp</p></div></div>
            <div className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium">Trocas</p><Link href="/trocas-e-entregas" className="text-[10px] text-muted-foreground underline">Ver política</Link></div></div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur-sm sm:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 6px)" }}>
        <div className="flex items-center gap-2 px-3 py-2">
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-full" onClick={() => { toggleFavorite(product); if (!isFav) toast.success("Favoritado!") }}>
            <Heart className={cn("h-4 w-4", isFav && "fill-current text-red-500")} />
          </Button>
          <Button className="h-9 flex-1 gap-1.5 rounded-full text-[11px]" onClick={handleAddToCart} disabled={!canAdd}>
            <ShoppingBag className="h-3.5 w-3.5" /> {!canAdd ? "Selecione opções" : inCart ? "Na sacola" : "Sacola"}
          </Button>
          <a href={createWhatsAppLink(WHATSAPP_NUMBER, formatProductMessage(product.name))} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button className="h-9 w-full gap-1.5 rounded-full bg-[#25D366] text-[11px] text-white hover:bg-[#1DA851]" disabled={isOutOfStock}><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</Button>
          </a>
        </div>
      </div>
    </>
  )
}

function X({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
}
