"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Package, ShoppingCart, Image as ImageIcon, ClipboardCheck,
  LogOut, Plus, AlertTriangle, TrendingUp, Eye, ImageOff,
  PackageX, Clock, CheckCircle2, XCircle,
} from "lucide-react"

type ProductRow = {
  id: string; name: string; status: string; images: string[]
  variants: { stock: number; active: boolean }[]
  coverImage?: string | null
}
type OrderRow = { id: string; status: string }

const modules = [
  { title: "Produtos", desc: "Catálogo, variantes, preços, estoque e mídia.", href: "/admin/produtos", icon: Package, color: "from-blue-500/15 to-blue-600/5 border-blue-800/30" },
  { title: "Pedidos", desc: "Pedidos recebidos, status e acompanhamento.", href: "/admin/pedidos", icon: ShoppingCart, color: "from-green-500/15 to-green-600/5 border-green-800/30" },
  { title: "Mídia", desc: "Galeria, capas, vídeos e auditoria por produto.", href: "/admin/midias", icon: ImageIcon, color: "from-purple-500/15 to-purple-600/5 border-purple-800/30" },
  { title: "Validações", desc: "Checklist, slugs, estoque e problemas.", href: "/admin/catalogo", icon: ClipboardCheck, color: "from-yellow-500/15 to-yellow-600/5 border-yellow-800/30" },
]

export default function AdminHubPage() {
  const router = useRouter()
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

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login"); router.refresh()
  }

  // Computed stats
  const active = products.filter(p => p.status === "ativo").length
  const drafts = products.filter(p => p.status === "rascunho").length
  const noCover = products.filter(p => !p.coverImage && (!p.images || p.images.length === 0)).length
  const noStock = products.filter(p => {
    const total = (p.variants || []).filter(v => v.active).reduce((s, v) => s + v.stock, 0)
    return total === 0
  }).length
  const lowStock = products.filter(p => {
    const total = (p.variants || []).filter(v => v.active).reduce((s, v) => s + v.stock, 0)
    return total > 0 && total <= 5
  }).length
  const pendingOrders = orders.filter(o => o.status === "recebido").length
  const confirmedOrders = orders.filter(o => o.status === "confirmado" || o.status === "enviado").length

  return (
    <div className="min-h-dvh bg-neutral-950 text-white">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight sm:text-xl">Fashion Store</h1>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500">Painel administrativo</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-neutral-300"><Eye className="h-3 w-3" /> Loja</Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-[10px] text-neutral-400 hover:text-white"><LogOut className="h-3 w-3" /> Sair</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Stats grid */}
        {loaded && (
          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
            <StatCard label="Produtos ativos" value={active} icon={TrendingUp} accent="text-emerald-400" />
            <StatCard label="Rascunhos" value={drafts} icon={Package} accent={drafts > 0 ? "text-yellow-400" : "text-neutral-500"} />
            <StatCard label="Pedidos pendentes" value={pendingOrders} icon={Clock} accent={pendingOrders > 0 ? "text-blue-400" : "text-neutral-500"} />
            <StatCard label="Em andamento" value={confirmedOrders} icon={ShoppingCart} accent={confirmedOrders > 0 ? "text-purple-400" : "text-neutral-500"} />
          </div>
        )}

        {/* Alerts */}
        {loaded && (noCover > 0 || noStock > 0 || lowStock > 0 || pendingOrders > 0) && (
          <div className="mb-6 space-y-1.5">
            {pendingOrders > 0 && (
              <AlertRow icon={Clock} color="blue" href="/admin/pedidos">
                {pendingOrders} pedido(s) aguardando confirmação
              </AlertRow>
            )}
            {noCover > 0 && (
              <AlertRow icon={ImageOff} color="red" href="/admin/midias">
                {noCover} produto(s) sem imagem de capa
              </AlertRow>
            )}
            {noStock > 0 && (
              <AlertRow icon={PackageX} color="red" href="/admin/produtos">
                {noStock} produto(s) com estoque zerado
              </AlertRow>
            )}
            {lowStock > 0 && (
              <AlertRow icon={AlertTriangle} color="yellow" href="/admin/produtos">
                {lowStock} produto(s) com estoque baixo (≤ 5 un.)
              </AlertRow>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/admin/produtos/novo">
            <button className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-neutral-950 hover:bg-neutral-200">
              <Plus className="h-3 w-3" /> Novo produto
            </button>
          </Link>
          <Link href="/admin/pedidos">
            <button className="flex items-center gap-1.5 rounded-full border border-neutral-700 px-4 py-2 text-[11px] font-medium text-neutral-300 hover:text-white">
              <ShoppingCart className="h-3 w-3" /> Ver pedidos
            </button>
          </Link>
          <Link href="/" target="_blank">
            <button className="flex items-center gap-1.5 rounded-full border border-neutral-700 px-4 py-2 text-[11px] font-medium text-neutral-300 hover:text-white">
              <Eye className="h-3 w-3" /> Abrir vitrine
            </button>
          </Link>
        </div>

        {/* Modules */}
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Módulos</h2>
        <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
          {modules.map(m => {
            const Icon = m.icon
            return (
              <Link key={m.title} href={m.href}>
                <div className={`group rounded-xl border bg-gradient-to-br p-4 transition hover:scale-[1.01] sm:p-5 ${m.color}`}>
                  <div className="mb-2.5 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800/80"><Icon className="h-4 w-4 text-neutral-300" /></div>
                    <h3 className="text-sm font-semibold">{m.title}</h3>
                  </div>
                  <p className="text-[10px] leading-relaxed text-neutral-400">{m.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: React.ElementType; accent: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 sm:p-4">
      <div className="mb-1 flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${accent}`} />
        <span className="text-[9px] font-medium uppercase tracking-wider text-neutral-500">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  )
}

function AlertRow({ children, icon: Icon, color, href }: { children: React.ReactNode; icon: React.ElementType; color: "red" | "yellow" | "blue"; href: string }) {
  const colors = {
    red: "border-red-900/50 bg-red-950/20 text-red-300",
    yellow: "border-yellow-900/50 bg-yellow-950/20 text-yellow-300",
    blue: "border-blue-900/50 bg-blue-950/20 text-blue-300",
  }
  return (
    <Link href={href} className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[11px] font-medium transition hover:opacity-80 ${colors[color]}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1">{children}</span>
      <span className="text-[9px] opacity-60">Ver →</span>
    </Link>
  )
}
