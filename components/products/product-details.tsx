"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { Icon } from "@/components/fashion/Icon"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import type { Product, ProductColor, ProductSize } from "@/lib/data/products"
import {
  getProductColors,
  getProductSizes,
  getVariantStock,
  getVariantSku,
  getAvailableSizesForColor,
  getTotalStock,
} from "@/lib/data/products"
import { WHATSAPP_NUMBER, createWhatsAppLink, formatProductMessage } from "@/lib/whatsapp"
import { formatPrice, getDiscountPercent } from "@/lib/format"

type MediaItem = {
  id: number; url: string; kind: string; role: string; sortOrder: number
  colorKey: string | null; colorName: string | null; colorHex: string | null
}

function colorKey(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toLowerCase()
}

export function ProductDetails({ product, structuredMedia = [] }: { product: Product; structuredMedia?: MediaItem[] }) {
  const allColors = useMemo(() => getProductColors(product), [product])
  const allSizes = useMemo(() => getProductSizes(product), [product])
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(allColors[0] || null)
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [imgIdx, setImgIdx] = useState(0)

  const gallery = useMemo(() => {
    if (structuredMedia.length === 0) {
      const validImages = product.images.filter(img => !!img)
      return validImages.length ? validImages : ["/brand/placeholder-product.svg"]
    }
    const key = selectedColor ? colorKey(selectedColor.name) : null
    const byColor = key
      ? structuredMedia.filter(m => m.colorKey === key && m.kind === "image").sort((a,b) => a.sortOrder - b.sortOrder)
      : []
    const general = structuredMedia.filter(m => !m.colorKey && m.kind === "image").sort((a,b) => a.sortOrder - b.sortOrder)
    const imgs = (byColor.length ? byColor : general).map(m => m.url).filter(url => !!url)
    if (imgs.length) return imgs
    const validFallback = product.images.filter(img => !!img)
    return validFallback.length ? validFallback : ["/brand/placeholder-product.svg"]
  }, [structuredMedia, selectedColor, product.images])

  const { addItem, isInCart } = useCart()
  const { toggleFavorite, isFavorite, requiresLogin } = useFavorites()

  const availableSizes = useMemo(() => selectedColor ? getAvailableSizesForColor(product, selectedColor.name) : allSizes, [product, selectedColor, allSizes])
  const currentStock = useMemo(() => selectedColor && selectedSize ? getVariantStock(product, selectedColor.name, selectedSize) : 0, [product, selectedColor, selectedSize])
  const sku = selectedColor && selectedSize ? getVariantSku(product, selectedColor.name, selectedSize) : null
  const totalStock = getTotalStock(product)
  const canAdd = !!selectedColor && !!selectedSize && currentStock > 0 && !!sku
  const isFav = isFavorite(product.id)
  const inCart = sku ? isInCart(product.id, sku) : false
  const discount = product.originalPrice ? getDiscountPercent(product.originalPrice, product.price) : 0
  const badge = product.badge || (product.isPromotion ? "Promoção" : product.isNew ? "Lançamento" : totalStock > 0 ? "Pronta Entrega" : "Esgotado")

  function handleAdd() {
    if (!canAdd || !selectedColor || !selectedSize || !sku) {
      toast.error("Escolha cor e tamanho disponíveis.")
      return
    }
    addItem(product.id, sku, quantity, product.price)
    toast.success(inCart ? "Quantidade atualizada na sacola." : "Adicionado à sacola!", {
      description: `${product.name} — ${selectedSize} — ${selectedColor.name}`,
    })
  }

  return (
    <section className="pb-24 bg-bg overflow-x-hidden">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
        <div className="text-[11px] caps tracking-[0.22em] text-muted-fg mb-8">
          <Link href="/" className="hover:text-ink">Fashion Store</Link> / <Link href="/produtos" className="hover:text-ink">Catálogo</Link> / <span className="text-ink">{product.name}</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14 xl:grid-cols-[1.15fr_1fr]">
          <div className="grid gap-3 sm:grid-cols-[72px_1fr] sm:gap-4">
            <div className="order-2 flex gap-2.5 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
              {gallery.slice(0, 6).map((g, i) => (
                <button key={g + i} onClick={() => setImgIdx(i)} className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden bg-stone sm:w-auto ${i === imgIdx ? "ring-1 ring-ink" : ""}`}>
                  <Image src={g} alt="" fill className="object-cover" sizes="72px" />
                </button>
              ))}
            </div>
            <div className="order-1 sm:order-2">
              <div className="relative aspect-[3/4] max-h-[520px] overflow-hidden bg-stone lg:max-h-[580px]">
                <Image src={gallery[imgIdx] || gallery[0]} alt={product.name} fill priority className="object-cover" sizes="(max-width:1024px) 100vw, 48vw" />
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-44 self-start">
            <span className={`status-pill ${product.isPromotion ? "bg-[var(--promo)]" : product.isNew || product.isBestseller ? "status-pill--tan" : "status-pill--olive"}`}>{badge}</span>
            <h1 className="mt-5 caps text-[13px] tracking-[0.14em] text-ink sm:text-[14px]">{product.name}</h1>
            <p className="mt-2 text-[12px] text-muted-fg">Ref.: {product.sku}</p>

            <div className="mt-7">
              <div className="flex items-baseline gap-3 flex-wrap">
                <p className={`text-[26px] font-medium sm:text-[30px] ${product.originalPrice ? "text-promo" : "text-ink"}`}>{formatPrice(product.price)}</p>
                {product.originalPrice && <p className="text-[13px] text-muted-fg line-through">{formatPrice(product.originalPrice)}</p>}
                {discount > 0 && <span className="bg-promo text-white px-2 py-1 text-[10px] font-semibold">−{discount}%</span>}
              </div>
              <p className="text-[12.5px] text-muted-fg mt-1">ou em <span className="font-semibold text-ink/85">3x de {formatPrice(product.price / 3)}</span> sem juros</p>
            </div>

            <p className="mt-6 text-[14.5px] text-fg-soft leading-relaxed">{product.description}</p>

            <Link href="/guia-de-medidas" className="mt-6 inline-flex items-center gap-2 px-4 h-10 border border-border text-[12px] hover:border-ink transition">
              <Icon name="ruler" size={14}/> Tabela de Medidas
            </Link>

            {allColors.length > 0 && (
              <div className="mt-7">
                <p className="text-[13px] mb-3">Cor: <span className="font-semibold">{selectedColor?.name || "Selecione"}</span></p>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {allColors.map(c => (
                    <button key={c.name} onClick={() => { setSelectedColor(c); setSelectedSize(null); setQuantity(1) }} title={c.name}
                      className={`h-10 w-10 rounded-full transition ${selectedColor?.name === c.name ? "ring-1 ring-ink ring-offset-2" : "ring-1 ring-transparent hover:ring-ink/30"} ${c.value === "#FFFFFF" || c.value === "#FAF9F6" ? "border border-black/15" : ""}`}
                      style={{ background: c.value }} />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7">
              <p className="text-[13px] mb-3">Tamanho{!selectedSize && " — selecione"}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {allSizes.map(s => {
                  const stock = selectedColor ? getVariantStock(product, selectedColor.name, s) : 0
                  const available = availableSizes.includes(s) && stock > 0
                  return (
                    <button key={s} onClick={() => available && setSelectedSize(s)} disabled={!available}
                      className={`h-11 min-w-[64px] px-4 caps text-[12px] border transition ${selectedSize === s ? "bg-ink text-white border-ink" : "border-border text-ink hover:border-ink"} ${!available ? "opacity-35 line-through cursor-not-allowed" : ""}`}>
                      {s}
                    </button>
                  )
                })}
              </div>
              {selectedColor && selectedSize && currentStock > 0 && currentStock <= 5 && <p className="mt-2 text-[12px] text-promo">Restam {currentStock} unidades nessa variação.</p>}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center border border-border h-14">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-full w-12 grid place-items-center"><Icon name="minus" size={13}/></button>
                <span className="w-10 text-center text-[14px]">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(currentStock, quantity + 1))} disabled={quantity >= currentStock} className="h-full w-12 grid place-items-center disabled:opacity-30 disabled:cursor-not-allowed"><Icon name="plus" size={13}/></button>
              </div>
              <button onClick={handleAdd} disabled={!canAdd} className="flex-1 h-14 bg-ink text-white caps text-[12px] hover:bg-fg-soft transition disabled:opacity-45 disabled:cursor-not-allowed">
                {inCart ? "Atualizar Sacola" : "Adicionar à Sacola"}
              </button>
              <button onClick={() => { if (requiresLogin) { toast("Faça login para favoritar", { action: { label: "Entrar", onClick: () => window.location.href = "/login" } }); return }; toggleFavorite(product) }} className="h-14 w-14 border border-border grid place-items-center hover:border-ink transition" aria-label="Favoritar">
                <Icon name={isFav ? "heart-fill" : "heart"} size={16} color={isFav ? "#B91C1C" : "currentColor"}/>
              </button>
            </div>

            <a href={createWhatsAppLink(WHATSAPP_NUMBER, formatProductMessage(product.name))} target="_blank" rel="noopener noreferrer" className="mt-3 h-12 w-full inline-flex items-center justify-center gap-2 bg-wa text-white caps text-[11px] hover:brightness-95 transition">
              <Icon name="whatsapp" size={16} color="white"/> Comprar pelo WhatsApp
            </a>

            <div className="mt-8 border-t border-border">
              {[
                ["Descrição", product.description],
                ["Composição & Cuidados", product.composition || product.details.join(" · ") || "Peça selecionada com acabamento confortável e estampa de qualidade."],
                ["Entrega & Trocas", "Compra pelo WhatsApp. Confirmamos estoque, pagamento e entrega antes da finalização."],
              ].map(([t, b]) => (
                <details key={t} className="border-b border-border py-5 group">
                  <summary className="caps text-[11px] flex items-center justify-between cursor-pointer">{t}<span className="transition group-open:rotate-45"><Icon name="plus" size={13}/></span></summary>
                  <p className="mt-4 text-[14px] text-fg-soft leading-relaxed">{b}</p>
                </details>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
