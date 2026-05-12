"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle, RefreshCw, Package } from "lucide-react"
import { createWhatsAppLink, WHATSAPP_NUMBER } from "@/lib/whatsapp"
import { whatsappLink } from "@/lib/phone"
import type { Order, OrderStatus } from "@/lib/services/orders"
import { AdminShell } from "@/components/admin/admin-shell"
import { orderStatusLabel, orderStatusColor } from "@/components/admin/status-helpers"

const statusFlow: OrderStatus[] = ["recebido", "confirmado", "enviado", "entregue"]

export default function AdminPedidosPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <AdminShell title="Pedidos" breadcrumb={[{ label: "Pedidos" }]}>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Pedidos</h1>
            <p className="text-[12px] text-neutral-500">{orders.length} registrados</p>
          </div>
          <button onClick={fetchOrders} className="flex items-center gap-1.5 rounded-lg border border-neutral-800 px-3 py-2 text-[11px] text-neutral-400 hover:text-white transition">
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </button>
        </div>

        <div className="mt-5">
          {loading ? (
            <p className="py-12 text-center text-xs text-neutral-600">Carregando...</p>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Package className="h-10 w-10 text-neutral-700" />
              <p className="text-sm text-neutral-500">Nenhum pedido registrado.</p>
              <p className="max-w-xs text-[11px] text-neutral-600">Pedidos aparecem quando clientes finalizam pelo site.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => {
                const customerLink = whatsappLink(order.customerWhatsapp, `Olá ${order.customerName}! Sobre seu pedido ${order.number}...`)
                const fallback = createWhatsAppLink(WHATSAPP_NUMBER, `Sobre o pedido ${order.number}`)
                const nextStatus = statusFlow.indexOf(order.status) >= 0 && statusFlow.indexOf(order.status) < statusFlow.length - 1
                  ? statusFlow[statusFlow.indexOf(order.status) + 1]
                  : null
                const canChange = order.status !== "entregue" && order.status !== "cancelado"

                return (
                  <div key={order.id} className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4 sm:p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-[14px] font-bold">{order.number}</p>
                        <p className="text-[12px] text-neutral-400 mt-0.5">{order.customerName}</p>
                        <p className="text-[11px] text-neutral-500">{order.customerWhatsapp}</p>
                        <p className="text-[10px] text-neutral-600 mt-1">{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${orderStatusColor[order.status] || "bg-neutral-800 text-neutral-400"}`}>
                        {orderStatusLabel[order.status] || order.status}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="mb-3 space-y-1 border-t border-neutral-800 pt-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-400">{item.quantity}× {item.productName} — {item.color} {item.size}</span>
                          <span className="text-neutral-500 font-mono">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {order.observation && (
                      <p className="text-[11px] text-neutral-500 italic border-t border-neutral-800 pt-2 mb-2">&ldquo;{order.observation}&rdquo;</p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                      <p className="text-[15px] font-bold">R$ {order.total.toFixed(2)}</p>
                      <div className="flex gap-2 flex-wrap">
                        <a
                          href={customerLink ?? fallback}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 items-center gap-1.5 rounded-lg bg-[#25D366] px-3 text-[11px] font-medium text-white hover:bg-[#1DA851] transition"
                        >
                          <MessageCircle className="h-3 w-3" /> Chamar cliente
                        </a>
                        {canChange && nextStatus && (
                          <button onClick={() => updateStatus(order.id, nextStatus)}
                            className="flex h-8 items-center rounded-lg bg-neutral-800 px-3 text-[11px] text-neutral-300 hover:bg-neutral-700 transition">
                            → {orderStatusLabel[nextStatus] || nextStatus}
                          </button>
                        )}
                        {canChange && (
                          <button onClick={() => updateStatus(order.id, "cancelado")}
                            className="flex h-8 items-center rounded-lg bg-red-950/50 px-3 text-[11px] text-red-400 hover:bg-red-900/50 transition">
                            Cancelar
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
