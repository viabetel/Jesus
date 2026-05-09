"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, MessageCircle, RefreshCw, Package } from "lucide-react"
import { createWhatsAppLink, WHATSAPP_NUMBER } from "@/lib/whatsapp"
import { whatsappLink } from "@/lib/phone"
import type { Order, OrderStatus } from "@/lib/services/orders"

const statusColors: Record<OrderStatus, string> = {
  recebido: "bg-blue-900/40 text-blue-400",
  confirmado: "bg-yellow-900/40 text-yellow-400",
  enviado: "bg-purple-900/40 text-purple-400",
  entregue: "bg-green-900/40 text-green-400",
  cancelado: "bg-red-900/40 text-red-400",
}

const statusFlow: OrderStatus[] = ["recebido", "confirmado", "enviado", "entregue"]

export default function AdminPedidosPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders")
      if (res.ok) setOrders(await res.json())
    } catch { /* silently fail */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, status }) })
    if (res.ok) fetchOrders()
  }

  const handleLogout = async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); router.refresh() }

  return (
    <div className="min-h-dvh bg-neutral-950 text-white">
      <header className="border-b border-neutral-800 px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-[10px] text-neutral-500 hover:text-neutral-300">← Admin</Link>
            <h1 className="text-base font-semibold">Pedidos</h1>
            <span className="text-[10px] text-neutral-600">{orders.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchOrders} className="text-neutral-500 hover:text-white"><RefreshCw className="h-3.5 w-3.5" /></button>
            <button onClick={handleLogout} className="flex items-center gap-1 rounded-lg border border-neutral-700 px-2.5 py-1 text-[10px] text-neutral-400 hover:text-white"><LogOut className="h-3 w-3" /> Sair</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-4">
        {loading ? (
          <p className="py-8 text-center text-xs text-neutral-600">Carregando...</p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <Package className="h-8 w-8 text-neutral-700" />
            <p className="text-xs text-neutral-500">Nenhum pedido registrado.</p>
            <p className="max-w-xs text-center text-[10px] text-neutral-600">Pedidos aparecem aqui quando clientes finalizam pelo WhatsApp e o sistema registra.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map(order => (
              <div key={order.id} className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-xs font-semibold">{order.number}</p>
                    <p className="text-[10px] text-neutral-500">{order.customerName} · {order.customerWhatsapp}</p>
                    <p className="text-[9px] text-neutral-600">{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
                  </div>
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${statusColors[order.status]}`}>{order.status}</span>
                </div>

                {/* Items */}
                <div className="mb-2 space-y-0.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-neutral-400">{item.quantity}× {item.productName} — {item.color} {item.size}</span>
                      <span className="text-neutral-500">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-neutral-800 pt-1.5">
                  <p className="text-xs font-bold">R$ {order.total.toFixed(2)}</p>
                  <div className="flex gap-1.5">
                    {(() => {
                      const customerLink = whatsappLink(
                        order.customerWhatsapp,
                        `Olá ${order.customerName}! Sobre seu pedido ${order.number}...`
                      )
                      const fallback = createWhatsAppLink(
                        WHATSAPP_NUMBER,
                        `Sobre o pedido ${order.number}`
                      )
                      return (
                        <a
                          href={customerLink ?? fallback}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-6 items-center gap-1 rounded bg-[#25D366] px-2 text-[9px] font-medium text-white hover:bg-[#1DA851]"
                          title={customerLink ? "Chamar cliente" : "WhatsApp inválido — abrindo loja"}
                        >
                          <MessageCircle className="h-2.5 w-2.5" /> Chamar
                        </a>
                      )
                    })()}
                    {order.status !== "entregue" && order.status !== "cancelado" && (
                      <>
                        {statusFlow.indexOf(order.status) < statusFlow.length - 1 && (
                          <button onClick={() => updateStatus(order.id, statusFlow[statusFlow.indexOf(order.status) + 1])}
                            className="flex h-6 items-center rounded bg-neutral-800 px-2 text-[9px] text-neutral-300 hover:bg-neutral-700">
                            → {statusFlow[statusFlow.indexOf(order.status) + 1]}
                          </button>
                        )}
                        <button onClick={() => updateStatus(order.id, "cancelado")}
                          className="flex h-6 items-center rounded bg-red-950/50 px-2 text-[9px] text-red-400 hover:bg-red-900/50">
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
