"use client"

import { useState, useEffect, use } from "react"
import Image from "next/image"
import { ArrowLeft, Loader2, AlertCircle, MessageCircle, MapPin, FileText } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen"
import { statusLabel, statusBadgeClass, OrderStatusTimeline } from "@/components/order-status"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"
import { formatPrice } from "@/lib/format"

type OrderDetail = {
  id: string; orderNumber: string; date: string; updatedAt: string
  status: string; customerName: string; customerWhatsapp: string
  customerEmail: string; address: string | null; observation: string | null
  items: { product_name?: string; productName?: string; productImage?: string; product_image?: string; sku?: string; size?: string; color?: string; quantity: number; price: number; line_total?: number; lineTotal?: number }[]
  subtotal: number; total: number
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { isAuthenticated, isHydrated, getAccessToken } = useAuth()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isHydrated) return
    if (!isAuthenticated) { window.location.replace(`/login?next=/minha-conta/pedidos/${id}`); return }

    getAccessToken().then(token => {
      if (!token) { setError("Sessão expirada."); setLoading(false); return }
      fetch(`/api/customer/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async r => {
          if (!r.ok) { const d = await r.json().catch(() => ({})); setError(d.error || "Pedido não encontrado."); return }
          setOrder(await r.json())
        })
        .catch(() => setError("Erro ao carregar pedido."))
        .finally(() => setLoading(false))
    })
  }, [isHydrated, isAuthenticated, id, getAccessToken])

  if (!isHydrated) return <AuthLoadingScreen />
  if (loading) return <AuthLoadingScreen message="Carregando pedido..." />

  if (error || !order) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-sm text-red-500">{error || "Pedido não encontrado."}</p>
          <a href="/minha-conta?tab=pedidos" className="mt-4 inline-block text-[12px] font-semibold underline">Voltar aos pedidos</a>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 bg-white border-b border-[var(--border)]">
        <div className="mx-auto max-w-3xl flex items-center gap-3 px-4 h-14 sm:px-6">
          <a href="/minha-conta?tab=pedidos" className="flex items-center gap-1.5 text-[12px] text-[var(--muted-foreground)] hover:text-[var(--ink)]">
            <ArrowLeft className="h-4 w-4" /> Pedidos
          </a>
          <span className="text-[12px] text-[var(--muted-foreground)]">/</span>
          <span className="text-[12px] font-medium">{order.orderNumber}</span>
        </div>
      </div>

      <main className="min-h-dvh pt-20 pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="font-serif text-xl font-bold sm:text-2xl">{order.orderNumber}</h1>
              <p className="text-[12px] text-[var(--muted-foreground)] mt-1">
                {new Date(order.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusBadgeClass(order.status)}`}>
              {statusLabel(order.status)}
            </span>
          </div>

          <div className="mt-4"><OrderStatusTimeline status={order.status} /></div>

          {/* Items */}
          <div className="mt-6 rounded-xl border bg-card">
            <div className="px-4 py-3 border-b"><h2 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Itens do pedido</h2></div>
            <div className="divide-y">
              {order.items.map((it, i) => {
                const name = it.productName || it.product_name || ""
                const img = it.productImage || it.product_image
                const line = it.lineTotal || it.line_total || it.price * it.quantity
                return (
                  <div key={i} className="flex gap-3 p-4">
                    <div className="h-16 w-12 bg-[var(--stone)] rounded overflow-hidden shrink-0">
                      {img && <Image src={img} alt="" width={48} height={64} className="object-cover h-full w-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{name}</p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">{it.color} · {it.size} · Qtd: {it.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-bold">{formatPrice(line)}</p>
                      {it.quantity > 1 && <p className="text-[10px] text-[var(--muted-foreground)]">{formatPrice(it.price)} cada</p>}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Total</span>
              <span className="text-[18px] font-bold">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Details */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-card p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Cliente</h3>
              <p className="text-[13px] font-medium">{order.customerName}</p>
              <p className="text-[12px] text-[var(--muted-foreground)]">{order.customerEmail}</p>
              <p className="text-[12px] text-[var(--muted-foreground)]">{order.customerWhatsapp}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Entrega</h3>
              {order.address ? (
                <p className="text-[13px] flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[var(--muted-foreground)]" />{order.address}</p>
              ) : (
                <p className="text-[13px] text-[var(--muted-foreground)]">A combinar pelo WhatsApp</p>
              )}
              {order.observation && (
                <p className="text-[12px] text-[var(--muted-foreground)] mt-2 italic flex items-start gap-1.5"><FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />"{order.observation}"</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3 flex-wrap">
            <a href={createWhatsAppLink(WHATSAPP_NUMBER, `Olá! Sobre meu pedido ${order.orderNumber}...`)}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-[12px] font-semibold text-white hover:bg-[#1DA851] transition">
              <MessageCircle className="h-4 w-4" /> Falar sobre este pedido
            </a>
            <a href="/minha-conta?tab=pedidos" className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-5 py-2.5 text-[12px] font-medium hover:bg-[var(--cream)] transition">
              <ArrowLeft className="h-4 w-4" /> Voltar aos pedidos
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
