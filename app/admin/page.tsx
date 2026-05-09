"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Package, ShoppingCart, Image as ImageIcon, ClipboardCheck, LogOut, Plus, AlertTriangle, TrendingUp, Archive, Eye } from "lucide-react"

type Stats = { totalProducts: number; activeProducts: number; totalOrders: number; lowStock: number }

const modules = [
  { title: "Produtos", desc: "Catálogo completo, variantes, preços e estoque.", href: "/admin/produtos", icon: Package, color: "from-blue-500/20 to-blue-600/5 border-blue-800/30" },
  { title: "Pedidos", desc: "Pedidos recebidos, status e acompanhamento.", href: "/admin/pedidos", icon: ShoppingCart, color: "from-green-500/20 to-green-600/5 border-green-800/30" },
  { title: "Mídia", desc: "Galeria, capas, vídeos e auditoria visual.", href: "/admin/midias", icon: ImageIcon, color: "from-purple-500/20 to-purple-600/5 border-purple-800/30" },
  { title: "Validações", desc: "Slug duplicado, imagem faltando, estoque baixo.", href: "/admin/catalogo", icon: ClipboardCheck, color: "from-yellow-500/20 to-yellow-600/5 border-yellow-800/30" },
]

export default function AdminHubPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then(r => r.json()).catch(() => []),
      fetch("/api/admin/orders").then(r => r.json()).catch(() => []),
    ]).then(([products, orders]) => {
      const prods = Array.isArray(products) ? products : []
      const ords = Array.isArray(orders) ? orders : []
      setStats({
        totalProducts: prods.length,
        activeProducts: prods.filter((p: Record<string, unknown>) => p.status === "ativo").length,
        totalOrders: ords.length,
        lowStock: prods.filter((p: Record<string, unknown>) => {
          const variants = (p.variants as Array<{ stock: number; active: boolean }>) || []
          const total = variants.filter(v => v.active).reduce((s, v) => s + v.stock, 0)
          return total > 0 && total <= 5
        }).length,
      })
    })
  }, [])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login"); router.refresh()
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight sm:text-xl">Fashion Store</h1>
            <p className="text-[10px] text-neutral-500 tracking-wider uppercase">Painel administrativo</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-neutral-300"><Eye className="h-3 w-3" /> Ver loja</Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-[10px] text-neutral-400 transition hover:border-neutral-600 hover:text-white"><LogOut className="h-3 w-3" /> Sair</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Stats cards */}
        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {[
              { label: "Produtos", value: stats.totalProducts, icon: Package, accent: "text-blue-400" },
              { label: "Ativos", value: stats.activeProducts, icon: TrendingUp, accent: "text-green-400" },
              { label: "Pedidos", value: stats.totalOrders, icon: ShoppingCart, accent: "text-purple-400" },
              { label: "Estoque baixo", value: stats.lowStock, icon: AlertTriangle, accent: stats.lowStock > 0 ? "text-yellow-400" : "text-neutral-500" },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-3.5 w-3.5 ${s.accent}`} />
                    <span className="text-[9px] font-medium uppercase tracking-wider text-neutral-500">{s.label}</span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Quick actions */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/admin/produtos/novo">
            <button className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-neutral-950 transition hover:bg-neutral-200">
              <Plus className="h-3 w-3" /> Novo produto
            </button>
          </Link>
          <Link href="/admin/pedidos">
            <button className="flex items-center gap-1.5 rounded-full border border-neutral-700 px-4 py-2 text-[11px] font-medium text-neutral-300 transition hover:border-neutral-500 hover:text-white">
              <ShoppingCart className="h-3 w-3" /> Ver pedidos
            </button>
          </Link>
          <Link href="/api/admin/migrate" target="_blank">
            <button className="flex items-center gap-1.5 rounded-full border border-neutral-700 px-4 py-2 text-[11px] font-medium text-neutral-300 transition hover:border-neutral-500 hover:text-white">
              <Archive className="h-3 w-3" /> Migrar legado
            </button>
          </Link>
        </div>

        {/* Modules grid */}
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
