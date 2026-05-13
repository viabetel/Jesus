"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle, RefreshCw, Package, ArrowRight, CheckCircle2, Truck, X, Info } from "lucide-react"
import { createWhatsAppLink, WHATSAPP_NUMBER } from "@/lib/whatsapp"
import { whatsappLink } from "@/lib/phone"
import type { Order, OrderStatus } from "@/lib/services/orders"
import { AdminShell } from "@/components/admin/admin-shell"
import { orderStatusLabel, orderStatusColor } from "@/components/admin/status-helpers"

const statusFlow: OrderStatus[] = ["recebido", "confirmado", "enviado", "entregue"]

const flowSteps = [
  { status: "recebido", label: "Recebido", desc: "Cliente enviou o pedido. Verifique os itens e entre em contato para confirmar pagamento.", icon: Package },
  { status: "confirmado", label: "Confirmado", desc: "Pagamento combinado/confirmado. Prepare o envio da peça.", icon: CheckCircle2 },
  { status: "enviado", label: "Enviado", desc: "Peça enviada ou pronta para retirada. Informe o rastreio ao cliente.", icon: Truck },
  { status: "entregue", label: "Entregue", desc: "Cliente recebeu a peça. Pedido concluído.", icon: CheckCircle2 },
]

function buildWhatsAppMessageForOrder(order: Order) {
  const items = order.items.map((it, idx) =>
    `${idx + 1}. ${it.quantity}× ${it.productName} — ${it.color} ${it.size} — R$ ${it.lineTotal.toFixed(2)}`
  ).join("\n")
  return `Olá ${order.customerName}! 😊\n\nSobre seu pedido *${order.number}*:\n\n${items}\n\n*Total: R$ ${order.total.toFixed(2)}*\n\nVamos combinar o pagamento e a entrega?`
}

export default function AdminPedidosPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<OrderStatus | "all">("all")
  const [showGuide, setShowGuide] = useState(false)

  const fetchOrders = useCallback(async () => {
    try { const res = await fetch("/api/admin/orders"); if (res.ok) setOrders(await res.json()) }
    catch { /* silently fail */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, status }) })
    if (res.ok) fetchOrders()
  }

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter)

  const counts: Record<string, number> = {}
  for (const o of orders) counts[o.status] = (counts[o.status] || 0) + 1

  return (
    <AdminShell title="Pedidos" breadcrumb={[{ label: "Pedidos" }]}>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Pedidos</h1>
            <p className="text-[12px] text-neutral-500">{orders.length} registrados</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowGuide(!showGuide)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 px-3 py-2 text-[11px] text-neutral-400 hover:text-white transition">
              <Info className="h-3.5 w-3.5" /> {showGuide ? "Ocultar guia" : "Guia do fluxo"}
            </button>
            <button onClick={fetchOrders} className="flex items-center gap-1.5 rounded-lg border border-neutral-800 px-3 py-2 text-[11px] text-neutral-400 hover:text-white transition">
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </button>
          </div>
        </div>

        {/* Flow Guide */}
        {showGuide && (
          <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
            <h3 className="text-[12px] font-semibold text-neutral-200 mb-3">Fluxo do pedido</h3>
            <div className="space-y-3">
              {flowSteps.map((step, idx) => {
                const Icon = step.icon
                return (
                  <div key={step.status} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 ${
                        idx === 0 ? "bg-blue-900/50 text-blue-400" :
                        idx === 1 ? "bg-yellow-900/50 text-yellow-400" :
                        idx === 2 ? "bg-purple-900/50 text-purple-400" :
                        "bg-green-900/50 text-green-400"
                      }`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      {idx < flowSteps.length - 1 && <div className="w-px h-4 bg-neutral-800 mt-1" />}
                    </div>
                    <div className="min-w-0 pb-1">
                      <p className="text-[12px] font-semibold text-neutral-200">{idx + 1}. {step.label}</p>
                      <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 rounded-lg bg-neutral-800/50 p-3 text-[11px] text-neutral-400 leading-relaxed">
              <p className="font-semibold text-neutral-300 mb-1">Ações em cada etapa:</p>
              <p>• <span className="text-blue-400">Recebido →</span> Clique <span className="font-medium text-white">"Chamar cliente"</span> para combinar pagamento via WhatsApp, depois avance para <span className="font-medium text-white">"Confirmado"</span>.</p>
              <p>• <span className="text-yellow-400">Confirmado →</span> Prepare o envio. Quando despachar, avance para <span className="font-medium text-white">"Enviado"</span>.</p>
              <p>• <span className="text-purple-400">Enviado →</span> Compartilhe o rastreio com o cliente. Quando confirmar recebimento, marque como <span className="font-medium text-white">"Entregue"</span>.</p>
              <p>• <span className="text-red-400">Cancelar</span> — libera o estoque reservado e encerra o pedido.</p>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
          {(["all", ...statusFlow, "cancelado"] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                filter === s ? "bg-white text-neutral-950" : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
              }`}>
              {s === "all" ? "Todos" : orderStatusLabel[s] || s}
              {s !== "all" && counts[s] ? ` (${counts[s]})` : ""}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {loading ? (
            <p className="py-12 text-center text-xs text-neutral-600">Carregando...</p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Package className="h-10 w-10 text-neutral-700" />
              <p className="text-sm text-neutral-500">
                {orders.length === 0 ? "Nenhum pedido registrado." : "Nenhum pedido com esse filtro."}
              </p>
              <p className="max-w-xs text-[11px] text-neutral-600">Pedidos aparecem quando clientes finalizam pelo site.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(order => {
                const waMessage = buildWhatsAppMessageForOrder(order)
                const customerLink = whatsappLink(order.customerWhatsapp, waMessage) 
                  ?? createWhatsAppLink(WHATSAPP_NUMBER, waMessage)
                const nextStatus = statusFlow.indexOf(order.status) >= 0 && statusFlow.indexOf(order.status) < statusFlow.length - 1
                  ? statusFlow[statusFlow.indexOf(order.status) + 1]
                  : null
                const canChange = order.status !== "entregue" && order.status !== "cancelado"
                const stepIndex = statusFlow.indexOf(order.status)

                return (
                  <div key={order.id} className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4 sm:p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[14px] font-bold">{order.number}</p>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${orderStatusColor[order.status] || "bg-neutral-800 text-neutral-400"}`}>
                            {orderStatusLabel[order.status] || order.status}
                          </span>
                        </div>
                        <p className="text-[12px] text-neutral-400 mt-0.5">{order.customerName}</p>
                        <p className="text-[11px] text-neutral-500">{order.customerWhatsapp} {order.customerEmail && `· ${order.customerEmail}`}</p>
                        <p className="text-[10px] text-neutral-600 mt-1">{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {canChange && stepIndex >= 0 && (
                      <div className="mb-3 flex items-center gap-1">
                        {flowSteps.map((s, idx) => (
                          <div key={s.status} className="flex items-center gap-1 flex-1">
                            <div className={`h-1.5 flex-1 rounded-full transition ${
                              idx <= stepIndex ? "bg-emerald-500" : "bg-neutral-800"
                            }`} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Items */}
                    <div className="mb-3 space-y-1 border-t border-neutral-800 pt-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="text-neutral-400 truncate">{item.quantity}× {item.productName} — {item.color} {item.size}</span>
                          <span className="text-neutral-500 font-mono shrink-0">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {order.observation && (
                      <p className="text-[11px] text-neutral-500 italic border-t border-neutral-800 pt-2 mb-2">&ldquo;{order.observation}&rdquo;</p>
                    )}

                    {/* Footer */}
                    <div className="flex flex-col gap-3 border-t border-neutral-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[15px] font-bold">R$ {order.total.toFixed(2)}</p>
                      <div className="flex gap-2 flex-wrap">
                        <a
                          href={customerLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 items-center gap-1.5 rounded-lg bg-[#25D366] px-3 text-[11px] font-medium text-white hover:bg-[#1DA851] transition"
                        >
                          <MessageCircle className="h-3 w-3" /> Chamar cliente
                        </a>
                        {canChange && nextStatus && (
                          <button onClick={() => updateStatus(order.id, nextStatus)}
                            className="flex h-8 items-center gap-1.5 rounded-lg bg-neutral-800 px-3 text-[11px] text-neutral-300 hover:bg-neutral-700 transition">
                            <ArrowRight className="h-3 w-3" /> {orderStatusLabel[nextStatus] || nextStatus}
                          </button>
                        )}
                        {canChange && (
                          <button onClick={() => {
                            if (confirm(`Cancelar pedido ${order.number}? O estoque será liberado.`)) {
                              updateStatus(order.id, "cancelado")
                            }
                          }}
                            className="flex h-8 items-center gap-1.5 rounded-lg bg-red-950/50 px-3 text-[11px] text-red-400 hover:bg-red-900/50 transition">
                            <X className="h-3 w-3" /> Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
