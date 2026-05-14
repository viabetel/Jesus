"use client"

import { useState, useEffect } from "react"

import Image from "next/image"
import { Icon } from "@/components/fashion/Icon"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import { formatPrice } from "@/lib/format"
import { formatPhone } from "@/lib/phone"

type OrderResult = { id: string; orderNumber: string; total: number }

function buildWhatsAppMessage(order: OrderResult, validItems: ReturnType<typeof useCart>["items"]) {
  const lines = validItems
    .filter(i => !i.shouldRemove && i.product)
    .map((item, idx) => `${idx + 1}x ${item.product!.name} — ${item.variant?.size ?? "?"} — ${item.variant?.colorName ?? "?"} — ${formatPrice(item.product!.price * item.ref.quantity)}`)
    .join("\n")
  return `Olá! Fiz o pedido #${order.orderNumber} pelo site da Fashion Store e quero combinar pagamento/entrega.\n\n${lines}\n\nTotal: ${formatPrice(order.total)}`
}

export function CartContent() {
  const { items, refs, loading, removeItem, updateQuantity, getSubtotal, clearCart, revalidate } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [step, setStep] = useState<"cart" | "checkout" | "confirmed">("cart")
  const [name, setName] = useState("")
  const [whatsNum, setWhatsNum] = useState("")
  const [email, setEmail] = useState("")
  const [observation, setObs] = useState("")
  const [deliveryMode, setDeliveryMode] = useState<"whatsapp" | "entrega" | "retirada">("whatsapp")
  const [address, setAddress] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [order, setOrder] = useState<OrderResult | null>(null)

  // Pre-fill com dados do usuário autenticado ao entrar no checkout
  useEffect(() => {
    if (step === "checkout" && isAuthenticated && user) {
      if (!name && user.name) setName(user.name)
      if (!email && user.email) setEmail(user.email)
      if (!whatsNum && user.whatsapp) setWhatsNum(user.whatsapp)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isAuthenticated, user])

  const validItems = items.filter(i => !i.shouldRemove && i.product)
  const subtotal = getSubtotal()
  const total = subtotal

  if (loading) {
    return <div className="py-24 text-center text-[14px] text-muted-fg">Carregando sacola...</div>
  }

  // ═══ CONFIRMED ═══
  if (step === "confirmed" && order) {
    const waLink = createWhatsAppLink(WHATSAPP_NUMBER, buildWhatsAppMessage(order, validItems))
    return (
      <div className="mt-16 text-center max-w-lg mx-auto sm:mt-20">
        <div className="inline-grid h-16 w-16 place-items-center bg-[#25D366]/15 rounded-full mx-auto">
          <Icon name="check" size={28} color="#25D366" />
        </div>
        <h2 className="mt-6 font-serif italic font-bold text-[28px] leading-tight sm:text-[36px]">Pedido recebido!</h2>
        <p className="mt-2 caps text-[12px] text-muted-fg">Pedido #{order.orderNumber}</p>
        <p className="mt-4 text-[14px] text-fg-soft leading-relaxed sm:text-[15px]">
          Seu pedido foi registrado no sistema. Para combinar pagamento e entrega, fale com a gente pelo WhatsApp.
        </p>
        <p className="mt-2 text-[18px] font-medium">Total: {formatPrice(order.total)}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="h-14 px-8 bg-[var(--wa)] text-white caps text-[12px] inline-flex items-center justify-center gap-2 hover:brightness-95 transition"
          >
            <Icon name="whatsapp" size={17} color="white" /> Continuar pelo WhatsApp
          </a>
          <a href="/produtos" className="h-14 px-8 border border-[var(--border)] caps text-[12px] text-[var(--ink)] inline-flex items-center justify-center gap-2 hover:bg-[var(--cream)] transition">
            Voltar ao catálogo
          </a>
          {isAuthenticated && (
            <a href="/minha-conta?tab=pedidos" className="h-14 px-8 border border-[var(--border)] caps text-[12px] text-[var(--ink)] inline-flex items-center justify-center gap-2 hover:bg-[var(--cream)] transition">
              Ver meus pedidos
            </a>
          )}
        </div>
      </div>
    )
  }

  // ═══ EMPTY ═══
  if (validItems.length === 0) {
    return (
      <div className="mt-20 text-center sm:mt-24">
        <div className="inline-grid h-16 w-16 place-items-center bg-[var(--cream)] rounded-full mx-auto"><Icon name="bag" size={24} /></div>
        <p className="mt-6 font-serif italic font-bold text-[28px]">Sua sacola está vazia</p>
        <p className="mt-2 text-[14px] text-muted-fg">Explore o catálogo e escolha camisetas com mensagem, estilo e propósito.</p>
        <a href="/produtos" className="mt-8 inline-flex items-center gap-3 bg-[var(--ink)] text-white caps text-[11px] px-7 h-12 hover:bg-[var(--fg-soft)] transition">
          Ver Catálogo <Icon name="arrow-right" size={13} />
        </a>
      </div>
    )
  }

  // ═══ CHECKOUT FORM ═══
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!name.trim()) { setError("Informe seu nome."); return }
    if (!whatsNum.trim()) { setError("Informe seu WhatsApp."); return }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Informe um e-mail válido."); return }
    if (deliveryMode === "entrega" && !address.trim()) { setError("Informe o endereço de entrega."); return }

    setSubmitting(true)
    try {
      // Revalidate stock before submitting
      await revalidate()

      // Get auth token if logged in
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      const sb = getSupabaseBrowser()
      if (sb) {
        const { data: { session } } = await sb.auth.getSession()
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`
        }
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify({
          customerName: name.trim(),
          customerWhatsapp: whatsNum.trim(),
          customerEmail: email.trim(),
          items: refs.map(r => ({ productId: r.productId, variantSku: r.variantSku, quantity: r.quantity })),
          address: deliveryMode === "entrega" ? address.trim() : deliveryMode === "retirada" ? "Retirada" : undefined,
          observation: observation.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erro ao enviar pedido.")
        return
      }
      setOrder(data.order)
      setStep("confirmed")
      clearCart()
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  if (step === "checkout") {
    return (
      <div className="mt-8 max-w-2xl mx-auto">
        <button onClick={() => setStep("cart")} className="caps text-[11px] text-muted-fg hover:text-[var(--ink)] mb-6 flex items-center gap-1">
          <Icon name="arrow-left" size={13} /> Voltar à sacola
        </button>

        <h2 className="font-serif italic font-bold text-[28px] leading-none sm:text-[36px]">Dados do pedido</h2>
        <p className="mt-3 text-[13px] text-muted-fg sm:text-[14px]">Revise seus itens e preencha seus dados.</p>

        {/* Item review */}
        <div className="mt-6 rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="px-4 py-2.5 bg-[var(--cream)] border-b border-[var(--border)]">
            <p className="caps text-[10px] font-semibold text-muted-fg">{validItems.length} {validItems.length === 1 ? "item" : "itens"} na sacola</p>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {validItems.map(({ ref, product, variant }) => product && (
              <div key={ref.variantSku} className="flex gap-3 p-3">
                <div className="relative h-14 w-10 bg-[var(--stone)] overflow-hidden rounded shrink-0">
                  <Image src={product.image && product.image.length > 1 ? product.image : "/brand/placeholder-product.svg"} alt="" fill className="object-cover" sizes="40px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate">{product.name}</p>
                  <p className="text-[10px] text-muted-fg">{variant?.colorName} · {variant?.size} · Qtd: {ref.quantity}</p>
                </div>
                <p className="text-[12px] font-bold shrink-0">{formatPrice(product.price * ref.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-[var(--border)] flex justify-between items-center">
            <span className="text-[11px] font-semibold text-muted-fg">Total</span>
            <span className="text-[16px] font-bold">{formatPrice(subtotal)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="caps text-[10px] text-muted-fg block mb-2">Nome completo *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome"
              className="w-full h-12 px-4 border border-[var(--border)] bg-transparent text-[14px] outline-none focus:border-[var(--ink)] transition" />
          </div>
          <div>
            <label className="caps text-[10px] text-muted-fg block mb-2">WhatsApp *</label>
            <input type="tel" value={whatsNum} onChange={e => setWhatsNum(formatPhone(e.target.value))} placeholder="(32) 99999-9999"
              className="w-full h-12 px-4 border border-[var(--border)] bg-transparent text-[14px] outline-none focus:border-[var(--ink)] transition" />
          </div>
          <div>
            <label className="caps text-[10px] text-muted-fg block mb-2">E-mail *{isAuthenticated && <span className="text-[9px] ml-1 opacity-60">(da sua conta)</span>}</label>
            <input type="email" value={email} onChange={e => { if (!isAuthenticated) setEmail(e.target.value) }} readOnly={isAuthenticated} placeholder="seu@email.com"
              className={`w-full h-12 px-4 border border-[var(--border)] bg-transparent text-[14px] outline-none focus:border-[var(--ink)] transition ${isAuthenticated ? "opacity-60 cursor-not-allowed" : ""}`} />
          </div>
          {/* Delivery */}
          <div>
            <label className="caps text-[10px] text-muted-fg block mb-2">Forma de entrega *</label>
            <div className="grid gap-2 sm:grid-cols-3">
              {([["whatsapp", "Combinar pelo WhatsApp"], ["entrega", "Entrega"], ["retirada", "Retirada"]] as const).map(([val, label]) => (
                <button key={val} type="button" onClick={() => setDeliveryMode(val)}
                  className={`h-11 px-4 rounded-lg border text-[12px] font-medium transition ${
                    deliveryMode === val ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--border)] hover:border-[var(--ink)]"
                  }`}>{label}</button>
              ))}
            </div>
            {deliveryMode === "entrega" && (
              <div className="mt-3">
                <label className="caps text-[10px] text-muted-fg block mb-2">Endereço de entrega *</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, número, bairro, cidade"
                  className="w-full h-12 px-4 border border-[var(--border)] bg-transparent text-[14px] outline-none focus:border-[var(--ink)] transition" />
              </div>
            )}
            {deliveryMode === "retirada" && (
              <p className="mt-2 text-[11px] text-muted-fg">A retirada será combinada no atendimento pelo WhatsApp.</p>
            )}
          </div>

          <div>
            <label className="caps text-[10px] text-muted-fg block mb-2">Observação (opcional)</label>
            <textarea value={observation} onChange={e => setObs(e.target.value)} placeholder="Alguma preferência de entrega, presente, etc."
              rows={3}
              className="w-full px-4 py-3 border border-[var(--border)] bg-transparent text-[14px] outline-none focus:border-[var(--ink)] transition resize-none" />
          </div>

          {/* Summary */}
          <div className="border-t border-[var(--border)] pt-5 mt-6">
            <div className="flex justify-between text-[14px]"><span className="text-muted-fg">Itens</span><span>{validItems.length}</span></div>
            <div className="flex justify-between text-[14px] mt-2"><span className="text-muted-fg">Entrega</span><span>A combinar</span></div>
            <div className="flex justify-between font-medium text-[18px] mt-3 pt-3 border-t border-[var(--border)]"><span>Total estimado</span><span>{formatPrice(total)}</span></div>
          </div>

          {error && <p className="text-[13px] text-[var(--promo)] font-medium">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 bg-[var(--ink)] text-white caps text-[12px] hover:bg-[var(--fg-soft)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? "Enviando..." : "Enviar pedido"}
          </button>

          <p className="text-[12px] text-muted-fg text-center leading-relaxed">
            Após enviar, confirmamos tudo pelo WhatsApp. Seu pedido fica registrado no sistema.
          </p>
        </form>
      </div>
    )
  }

  // ═══ CART VIEW ═══
  const quickWhatsapp = createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Estou montando um pedido pelo site e tenho uma dúvida.")

  return (
    <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-14">
      <div>
        <div className="hidden md:grid grid-cols-[1fr_120px_120px_120px_40px] gap-4 caps text-[10.5px] text-muted-fg border-b border-[var(--border)] pb-3">
          <span>Produto</span><span>Preço</span><span>Qtd</span><span>Total</span><span />
        </div>
        <div className="divide-y divide-[var(--border)]">
          {validItems.map(item => {
            const product = item.product!
            const lineTotal = product.price * item.ref.quantity
            const maxQ = item.maxQuantity
            return (
              <div key={`${item.ref.productId}-${item.ref.variantSku}`} className="py-6 grid gap-4 md:grid-cols-[1fr_120px_120px_120px_40px] md:items-center min-w-0">
                <div className="flex gap-4">
                  <a href={`/produto/${product.slug}`} className="relative h-28 w-20 bg-[var(--stone)] overflow-hidden shrink-0 sm:h-32 sm:w-24">
                    <Image src={product.image && product.image.length > 1 ? product.image : "/brand/placeholder-product.svg"} alt={product.name} fill className="object-cover" sizes="96px" />
                  </a>
                  <div>
                    <a href={`/produto/${product.slug}`} className="caps text-[12px] text-[var(--ink)] hover:underline underline-offset-4">{product.name}</a>
                    <p className="mt-2 text-[12px] text-muted-fg">Tamanho: {item.variant?.size ?? "—"}</p>
                    <p className="text-[12px] text-muted-fg">Cor: {item.variant?.colorName ?? "—"}</p>
                    {item.warnings.length > 0 && <p className="mt-2 text-[11px] text-[var(--promo)]">{item.warnings[0]}</p>}
                  </div>
                </div>
                <div className="text-[13px] text-[var(--ink)] md:block hidden">{formatPrice(product.price)}</div>
                <div className="flex items-center border border-[var(--border)] h-11 w-fit">
                  <button onClick={() => updateQuantity(item.ref.productId, item.ref.variantSku, item.ref.quantity - 1)} className="h-full w-10 grid place-items-center"><Icon name="minus" size={12} /></button>
                  <span className="w-10 text-center text-[13px]">{item.ref.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.ref.productId, item.ref.variantSku, item.ref.quantity + 1)}
                    disabled={item.ref.quantity >= maxQ}
                    className="h-full w-10 grid place-items-center disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Icon name="plus" size={12} />
                  </button>
                </div>
                <div className="text-[13px] font-medium text-[var(--ink)]">{formatPrice(lineTotal)}</div>
                <button onClick={() => removeItem(item.ref.productId, item.ref.variantSku)} className="text-muted-fg hover:text-[var(--promo)] transition w-fit" aria-label="Remover"><Icon name="trash" size={16} /></button>
              </div>
            )
          })}
        </div>
        <button onClick={clearCart} className="mt-8 caps text-[11px] text-muted-fg hover:text-[var(--ink)] underline underline-offset-4">Limpar sacola</button>
      </div>

      <aside className="lg:sticky lg:top-44 self-start border border-[var(--border)] p-6 sm:p-8">
        <h2 className="font-serif italic font-bold text-[28px] leading-none">Resumo</h2>
        <div className="mt-7 space-y-4 text-[14px]">
          <div className="flex justify-between"><span className="text-muted-fg">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-fg">Entrega</span><span>A combinar</span></div>
          <div className="border-t border-[var(--border)] pt-4 flex justify-between font-medium text-[18px]"><span>Total estimado</span><span>{formatPrice(total)}</span></div>
        </div>

        <button
          onClick={() => setStep("checkout")}
          className="mt-8 h-14 w-full bg-[var(--ink)] text-white caps text-[12px] inline-flex items-center justify-center gap-2 hover:bg-[var(--fg-soft)] transition"
        >
          Enviar pedido
        </button>

        <a href={quickWhatsapp} target="_blank" rel="noopener noreferrer" className="mt-3 h-12 w-full border border-[var(--wa)] text-[var(--wa)] caps text-[11px] inline-flex items-center justify-center gap-2 hover:bg-[var(--wa)]/5 transition">
          <Icon name="whatsapp" size={15} color="#25D366" /> Tirar dúvida no WhatsApp
        </a>

        <p className="mt-4 text-[12px] text-muted-fg leading-relaxed">Após enviar o pedido, combinamos pagamento e entrega pelo WhatsApp.</p>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center border-t border-[var(--border)] pt-5">
          {["Estoque", "Pagamento", "Entrega"].map(t => <div key={t}><Icon name="check" size={14} className="mx-auto" /><p className="mt-1 caps text-[9px] text-muted-fg">{t}</p></div>)}
        </div>
      </aside>
    </div>
  )
}
