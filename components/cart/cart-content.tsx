"use client"

import Link from "next/link"
import Image from "next/image"
import { Icon } from "@/components/fashion/Icon"
import { useCart } from "@/contexts/cart-context"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"
import { formatPrice } from "@/lib/format"

function buildMessage(items: ReturnType<typeof useCart>["items"], total: number) {
  const lines = items
    .filter(i => !i.shouldRemove && i.product)
    .map((item, idx) => `${idx + 1}x ${item.product!.name} — Tam. ${item.variant?.size ?? "a confirmar"} — Cor ${item.variant?.colorName ?? "a confirmar"} — Qtd. ${item.ref.quantity} — ${formatPrice(item.product!.price * item.ref.quantity)}`)
    .join("\n")
  return `Olá! Vim pelo site da Fashion Store e quero finalizar meu pedido:\n\n${lines}\n\nTotal estimado: ${formatPrice(total)}\n\nPode confirmar disponibilidade, pagamento e entrega?`
}

export function CartContent() {
  const { items, loading, removeItem, updateQuantity, getSubtotal, clearCart } = useCart()
  const validItems = items.filter(i => !i.shouldRemove && i.product)
  const subtotal = getSubtotal()
  const shipping = subtotal > 0 ? 0 : 0
  const total = subtotal + shipping
  const whatsapp = createWhatsAppLink(WHATSAPP_NUMBER, buildMessage(validItems, total))

  if (loading) {
    return <div className="py-24 text-center text-[14px] text-muted-fg">Carregando sacola...</div>
  }

  if (validItems.length === 0) {
    return (
      <div className="mt-20 text-center sm:mt-24">
        <div className="inline-grid h-16 w-16 place-items-center bg-cream rounded-full mx-auto"><Icon name="bag" size={24}/></div>
        <p className="mt-6 font-serif italic font-bold text-[28px]">Sua sacola está vazia</p>
        <p className="mt-2 text-[14px] text-muted-fg">Explore o catálogo e escolha camisetas com mensagem, estilo e propósito.</p>
        <Link href="/produtos" className="mt-8 inline-flex items-center gap-3 bg-ink text-white caps text-[11px] px-7 h-12 hover:bg-fg-soft transition">
          Ver Catálogo <Icon name="arrow-right" size={13}/>
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-14">
      <div>
        <div className="hidden md:grid grid-cols-[1fr_120px_120px_120px_40px] gap-4 caps text-[10.5px] text-muted-fg border-b border-border pb-3">
          <span>Produto</span><span>Preço</span><span>Qtd</span><span>Total</span><span />
        </div>
        <div className="divide-y divide-border">
          {validItems.map(item => {
            const product = item.product!
            const lineTotal = product.price * item.ref.quantity
            return (
              <div key={`${item.ref.productId}-${item.ref.variantSku}`} className="py-6 grid gap-4 md:grid-cols-[1fr_120px_120px_120px_40px] md:items-center">
                <div className="flex gap-4">
                  <Link href={`/produto/${product.slug}`} className="relative h-28 w-20 bg-stone overflow-hidden shrink-0 sm:h-32 sm:w-24">
                    <Image src={product.image || "/brand/placeholder-product.svg"} alt={product.name} fill className="object-cover" sizes="96px" />
                  </Link>
                  <div>
                    <Link href={`/produto/${product.slug}`} className="caps text-[12px] text-ink hover:underline underline-offset-4">{product.name}</Link>
                    <p className="mt-2 text-[12px] text-muted-fg">Tamanho: {item.variant?.size ?? "—"}</p>
                    <p className="text-[12px] text-muted-fg">Cor: {item.variant?.colorName ?? "—"}</p>
                    {item.warnings.length > 0 && <p className="mt-2 text-[11px] text-promo">{item.warnings[0]}</p>}
                  </div>
                </div>
                <div className="text-[13px] text-ink md:block hidden">{formatPrice(product.price)}</div>
                <div className="flex items-center border border-border h-11 w-fit">
                  <button onClick={() => updateQuantity(item.ref.productId, item.ref.variantSku, item.ref.quantity - 1)} className="h-full w-10 grid place-items-center"><Icon name="minus" size={12}/></button>
                  <span className="w-10 text-center text-[13px]">{item.ref.quantity}</span>
                  <button onClick={() => updateQuantity(item.ref.productId, item.ref.variantSku, item.ref.quantity + 1)} className="h-full w-10 grid place-items-center"><Icon name="plus" size={12}/></button>
                </div>
                <div className="text-[13px] font-medium text-ink">{formatPrice(lineTotal)}</div>
                <button onClick={() => removeItem(item.ref.productId, item.ref.variantSku)} className="text-muted-fg hover:text-promo transition w-fit" aria-label="Remover"><Icon name="trash" size={16}/></button>
              </div>
            )
          })}
        </div>
        <button onClick={clearCart} className="mt-8 caps text-[11px] text-muted-fg hover:text-ink underline underline-offset-4">Limpar sacola</button>
      </div>

      <aside className="lg:sticky lg:top-44 self-start border border-border p-6 sm:p-8">
        <h2 className="font-serif italic font-bold text-[28px] leading-none">Resumo</h2>
        <div className="mt-7 space-y-4 text-[14px]">
          <div className="flex justify-between"><span className="text-muted-fg">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-fg">Entrega</span><span>A combinar</span></div>
          <div className="border-t border-border pt-4 flex justify-between font-medium text-[18px]"><span>Total estimado</span><span>{formatPrice(total)}</span></div>
        </div>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-8 h-14 w-full bg-wa text-white caps text-[12px] inline-flex items-center justify-center gap-2 hover:brightness-95 transition">
          <Icon name="whatsapp" size={17} color="white"/> Finalizar pelo WhatsApp
        </a>
        <p className="mt-4 text-[12px] text-muted-fg leading-relaxed">Ao finalizar, confirmamos estoque, pagamento e entrega diretamente pelo WhatsApp.</p>
        <div className="mt-8 grid grid-cols-3 gap-3 text-center border-t border-border pt-6">
          {["Estoque", "Pagamento", "Entrega"].map(t => <div key={t}><Icon name="check" size={14} className="mx-auto"/><p className="mt-1 caps text-[9px] text-muted-fg">{t}</p></div>)}
        </div>
      </aside>
    </div>
  )
}
