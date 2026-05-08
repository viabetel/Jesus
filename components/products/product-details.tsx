"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBag, MessageCircle, Minus, Plus, Ruler, Truck, RefreshCw, Check, AlertCircle, ChevronLeft, ChevronRight, Play, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import type { Product, ProductSize, ProductColor, MediaItem } from "@/lib/data/products"
import { WHATSAPP_NUMBER, createWhatsAppLink, formatProductMessage } from "@/lib/whatsapp"
import { formatPrice, getDiscountPercent } from "@/lib/format"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ProductDetails({ product }: { product: Product }) {
  const gallery = product.media.gallery
  const [sel, setSel] = useState(0)
  const [sz, setSz] = useState<ProductSize | null>(product.sizes[0] || null)
  const [clr, setClr] = useState<ProductColor | null>(product.colors[0] || null)
  const [qty, setQty] = useState(1)
  const [descOpen, setDescOpen] = useState(false)
  const [detOpen, setDetOpen] = useState(false)
  const [vidErr, setVidErr] = useState(false)

  const { addItem, isInCart } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const isFav = isFavorite(product.id)
  const oos = product.stock === 0
  const inCart = isInCart(product.id, sz || undefined, clr?.name)
  const discount = product.originalPrice ? getDiscountPercent(product.originalPrice, product.price) : 0
  const cur = gallery[sel]
  const multi = gallery.length > 1

  const prev = () => setSel((i) => (i === 0 ? gallery.length - 1 : i - 1))
  const next = () => setSel((i) => (i === gallery.length - 1 ? 0 : i + 1))

  const addToCart = () => {
    if (!sz || !clr || oos) return
    addItem(product, sz, clr, qty)
    toast.success("Adicionado!", { description: `${product.name} — ${sz} — ${clr.name}` })
  }

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[minmax(300px,460px)_1fr] lg:gap-10 xl:grid-cols-[460px_1fr]">
        {/* GALLERY */}
        <div className="min-w-0 space-y-2">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted" style={{ maxHeight: "min(36dvh, 380px)" }}>
            {cur?.type === "video" && !vidErr ? (
              <iframe src={cur.url} className="h-full w-full border-0" allow="autoplay; encrypted-media" allowFullScreen title="Vídeo" onError={() => setVidErr(true)} />
            ) : cur?.type === "video" && vidErr ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted"><Play className="h-8 w-8 text-muted-foreground/40" /><p className="text-xs text-muted-foreground">Vídeo indisponível</p></div>
            ) : (
              <Image src={cur?.url || product.media.cover} alt={cur?.alt || product.name} fill className="object-cover" priority sizes="(max-width:1024px) 100vw, 460px" />
            )}
            {product.badge && <span className={cn("absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", product.badge === "Promoção" ? "bg-red-600 text-white" : "bg-foreground text-background")}>{product.badge}{discount > 0 && ` -${discount}%`}</span>}
            {multi && (
              <>
                <button onClick={prev} className="absolute left-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow active:scale-90 touch-target"><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={next} className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow active:scale-90 touch-target"><ChevronRight className="h-4 w-4" /></button>
                <span className="absolute right-2 top-2 rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] text-white">{sel + 1}/{gallery.length}</span>
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">{gallery.map((_, i) => <button key={i} onClick={() => setSel(i)} className={cn("h-1.5 rounded-full", sel === i ? "w-4 bg-white" : "w-1.5 bg-white/50")} />)}</div>
              </>
            )}
          </div>
          {/* Thumbnails — desktop only, horizontal scroll */}
          {multi && (
            <div className="hidden gap-1 overflow-x-auto scrollbar-hide sm:flex">
              {gallery.map((item, i) => (
                <button key={i} onClick={() => { setSel(i); setVidErr(false) }} className={cn("relative h-12 w-12 shrink-0 overflow-hidden rounded-md border-2", sel === i ? "border-foreground" : "border-transparent opacity-50 hover:opacity-80")}>
                  {item.type === "video" ? (
                    <div className="flex h-full w-full items-center justify-center bg-muted"><Play className="h-3 w-3 fill-foreground" /></div>
                  ) : (
                    <Image src={item.url} alt={item.alt} fill className="object-cover" sizes="48px" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="min-w-0 space-y-3">
          <nav className="flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground"><Link href="/" className="hover:text-foreground">Início</Link><span>/</span><Link href="/produtos" className="hover:text-foreground">Produtos</Link><span>/</span><span className="min-w-0 truncate text-foreground">{product.name}</span></nav>
          <div className="min-w-0">
            <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">{product.category}</p>
            <h1 className="mt-0.5 min-w-0 break-words font-serif text-lg font-bold sm:text-xl lg:text-2xl">{product.name}</h1>
            <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-1.5">
              <span className={cn("text-lg font-bold", product.originalPrice && "text-red-600")}>{formatPrice(product.price)}</span>
              {product.originalPrice && <><span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span><span className="rounded bg-red-100 px-1 py-px text-[9px] font-bold text-red-700">-{discount}%</span></>}
            </div>
          </div>
          {/* Size */}
          <div>
            <div className="mb-1.5 flex items-center justify-between"><span className="text-xs font-medium">Tamanho</span><Link href="/guia-de-medidas" className="text-[10px] text-muted-foreground underline"><Ruler className="mr-0.5 inline h-3 w-3" />Guia</Link></div>
            <div className="flex flex-wrap gap-1.5">{product.sizes.map((s) => <Button key={s} variant={sz === s ? "default" : "outline"} className="h-8 min-w-[36px] rounded-full text-xs touch-target" onClick={() => setSz(s)} disabled={oos}>{s}</Button>)}</div>
          </div>
          {/* Color */}
          <div>
            <span className="mb-1.5 block text-xs font-medium">Cor: {clr?.name || "—"}</span>
            <div className="flex flex-wrap gap-1.5">{product.colors.map((c) => <button key={c.name} className={cn("flex h-8 w-8 items-center justify-center rounded-full border-2 touch-target", clr?.name === c.name ? "border-foreground ring-2 ring-foreground ring-offset-1" : "border-border")} style={{ backgroundColor: c.value }} onClick={() => setClr(c)} disabled={oos} title={c.name}>{clr?.name === c.name && <Check className={cn("h-3 w-3", c.value === "#FFFFFF" || c.value === "#FAF9F6" ? "text-foreground" : "text-white")} />}</button>)}</div>
          </div>
          {/* Qty */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Qtd:</span>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={oos || qty <= 1}><Minus className="h-3 w-3" /></Button>
            <span className="w-6 text-center text-sm font-medium">{qty}</span>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={oos || qty >= product.stock}><Plus className="h-3 w-3" /></Button>
            {product.stock <= 10 && <span className="text-[10px] text-amber-600">Últimas {product.stock}</span>}
          </div>
          {/* Notice */}
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-2.5"><AlertCircle className="mt-px h-3.5 w-3.5 shrink-0 text-muted-foreground/50" /><p className="min-w-0 break-words text-[10px] text-muted-foreground">Disponibilidade, pagamento e entrega confirmados pelo WhatsApp.</p></div>
          {/* Desktop CTA */}
          <div className="hidden gap-2 sm:flex">
            <Button className="h-10 flex-1 gap-2 rounded-xl text-xs" onClick={addToCart} disabled={oos || !sz || !clr}><ShoppingBag className="h-4 w-4" />{inCart ? "Na sacola" : "Adicionar"}</Button>
            <Button variant="outline" className="h-10 rounded-xl" onClick={() => { toggleFavorite(product); if (!isFav) toast.success("Favoritado!") }}><Heart className={cn("h-4 w-4", isFav && "fill-red-500 text-red-500")} /></Button>
          </div>
          <a href={createWhatsAppLink(WHATSAPP_NUMBER, formatProductMessage(product.name))} target="_blank" rel="noopener noreferrer" className="hidden sm:block">
            <Button className="h-10 w-full gap-2 rounded-xl bg-[#25D366] text-xs text-white hover:bg-[#1DA851]" disabled={oos}><MessageCircle className="h-4 w-4" />Comprar pelo WhatsApp</Button>
          </a>
          {/* Accordions */}
          <div className="space-y-0 border-t">
            <button onClick={() => setDescOpen(!descOpen)} className="flex w-full items-center justify-between py-2.5 text-xs font-medium">Descrição<ChevronDown className={cn("h-3.5 w-3.5 transition-transform", descOpen && "rotate-180")} /></button>
            {descOpen && <p className="pb-3 text-[11px] leading-relaxed text-muted-foreground">{product.description}</p>}
            <button onClick={() => setDetOpen(!detOpen)} className="flex w-full items-center justify-between border-t py-2.5 text-xs font-medium">Detalhes<ChevronDown className={cn("h-3.5 w-3.5 transition-transform", detOpen && "rotate-180")} /></button>
            {detOpen && <ul className="space-y-1 pb-3">{product.details.map((d, i) => <li key={i} className="flex items-center gap-1 text-[11px] text-muted-foreground"><Check className="h-3 w-3 text-[#C2A87D]" />{d}</li>)}</ul>}
          </div>
          <div className="flex gap-3 border-t pt-3 text-xs">
            <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Entrega pelo WhatsApp</span></div>
            <div className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-muted-foreground" /><Link href="/trocas-e-entregas" className="font-medium underline">Trocas</Link></div>
          </div>
        </div>
      </div>
      {/* STICKY MOBILE CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur-sm sm:hidden" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 6px)" }}>
        <div className="flex items-center gap-1.5 px-3 py-2">
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-full" onClick={() => { toggleFavorite(product); if (!isFav) toast.success("Favoritado!") }}><Heart className={cn("h-3.5 w-3.5", isFav && "fill-red-500 text-red-500")} /></Button>
          <Button className="h-9 flex-1 gap-1 rounded-full text-[11px]" onClick={addToCart} disabled={oos || !sz || !clr}><ShoppingBag className="h-3.5 w-3.5" />{inCart ? "Na sacola" : "Sacola"}</Button>
          <a href={createWhatsAppLink(WHATSAPP_NUMBER, formatProductMessage(product.name))} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button className="h-9 w-full gap-1 rounded-full bg-[#25D366] text-[11px] text-white hover:bg-[#1DA851]" disabled={oos}><MessageCircle className="h-3.5 w-3.5" />WhatsApp</Button>
          </a>
        </div>
      </div>
    </>
  )
}
