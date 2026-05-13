"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Package, ShoppingCart, Plus, AlertTriangle, TrendingUp,
  ImageOff, PackageX, Clock,
} from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"

type ProductRow = {
  id: string; name: string; status: string; images: string[]
  variants: { stock: number; active: boolean }[]
  coverImage?: string | null
}
type OrderRow = { id: string; status: string }

export default function AdminHubPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then(r => r.json()).catch(() => []),
      fetch("/api/admin/orders").then(r => r.json()).catch(() => []),
    ]).then(([p, o]) => {
      setProducts(Array.isArray(p) ? p : [])
      setOrders(Array.isArray(o) ? o : [])
      setLoaded(true)
    })
  }, [])

  const active = products.filter(p => p.status === "ativo").length
  const drafts = products.filter(p => p.status === "rascunho").length
  // Produto sem capa = sem coverImage E sem images válidas
  const noCover = products.filter(p => {
    if (p.coverImage) return false
    const validImages = (p.images || []).filter(img => !!img)
    return validImages.length === 0
  }).length
  const noStock = products.filter(p => (p.variants || []).filter(v => v.active).reduce((s, v) => s + v.stock, 0) === 0).length
  const lowStock = products.filter(p => { const s = (p.variants || []).filter(v => v.active).reduce((a, v) => a + v.stock, 0); return s > 0 && s <= 5 }).length
  const pendingOrders = orders.filter(o => o.status === "recebido").length
  const confirmedOrders = orders.filter(o => o.status === "confirmado" || o.status === "enviado").length

  return (
    <AdminShell title="Visão geral">
      <div className="max-w-4xl">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Visão geral</h1>
        <p className="mt-1 text-[12px] text-neutral-500">Resumo rápido da loja.</p>

        {/* Stats */}
        {loaded && (
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            <StatCard label="Publicados" value={active} icon={TrendingUp} accent="text-emerald-400" />
            <StatCard label="Não publicados" value={drafts} icon={Package} accent={drafts > 0 ? "text-yellow-400" : "text-neutral-500"} />
            <StatCard label="Pedidos pendentes" value={pendingOrders} icon={Clock} accent={pendingOrders > 0 ? "text-blue-400" : "text-neutral-500"} />
            <StatCard label="Em andamento" value={confirmedOrders} icon={ShoppingCart} accent={confirmedOrders > 0 ? "text-purple-400" : "text-neutral-500"} />
          </div>
        )}

        {/* Alerts */}
        {loaded && (noCover > 0 || noStock > 0 || lowStock > 0 || pendingOrders > 0) && (
          <div className="mt-5 space-y-1.5">
            {pendingOrders > 0 && <AlertRow icon={Clock} color="blue" href="/admin/pedidos">{pendingOrders} pedido(s) aguardando confirmação</AlertRow>}
            {noCover > 0 && <AlertRow icon={ImageOff} color="red" href="/admin/midias">{noCover} produto(s) sem imagem de capa</AlertRow>}
            {noStock > 0 && <AlertRow icon={PackageX} color="red" href="/admin/produtos">{noStock} produto(s) com estoque zerado</AlertRow>}
            {lowStock > 0 && <AlertRow icon={AlertTriangle} color="yellow" href="/admin/produtos">{lowStock} produto(s) com estoque baixo (≤5)</AlertRow>}
          </div>
        )}

        {/* Quick actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/admin/produtos/novo">
            <button className="flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[11px] font-semibold text-neutral-950 hover:bg-neutral-200 transition">
              <Plus className="h-3.5 w-3.5" /> Novo produto
            </button>
          </Link>
          <Link href="/admin/pedidos">
            <button className="flex items-center gap-1.5 rounded-full border border-neutral-700 px-5 py-2.5 text-[11px] font-medium text-neutral-300 hover:text-white transition">
              <ShoppingCart className="h-3.5 w-3.5" /> Ver pedidos
            </button>
          </Link>
        </div>
      </div>
    </AdminShell>
  )
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: React.ElementType; accent: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5 sm:p-4">
      <div className="mb-1.5 flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${accent}`} />
        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  )
}

function AlertRow({ children, icon: Icon, color, href }: { children: React.ReactNode; icon: React.ElementType; color: "red" | "yellow" | "blue"; href: string }) {
  const c = { red: "border-red-900/50 bg-red-950/20 text-red-300", yellow: "border-yellow-900/50 bg-yellow-950/20 text-yellow-300", blue: "border-blue-900/50 bg-blue-950/20 text-blue-300" }
  return (
    <Link href={href} className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-[11px] font-medium transition hover:opacity-80 ${c[color]}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1">{children}</span>
      <span className="text-[9px] opacity-60">Ver →</span>
    </Link>
  )
}
