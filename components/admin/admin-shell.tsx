"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Package, ShoppingCart, Image as ImageIcon, ClipboardCheck,
  LogOut, Eye, Menu, X, Home, ChevronRight,
} from "lucide-react"

const modules = [
  { label: "Visão geral", href: "/admin", icon: Home },
  { label: "Produtos", href: "/admin/produtos", icon: Package },
  { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
  { label: "Mídias", href: "/admin/midias", icon: ImageIcon },
  { label: "Validações", href: "/admin/catalogo", icon: ClipboardCheck },
]

export function AdminShell({ children, title, breadcrumb }: {
  children: React.ReactNode
  title?: string
  breadcrumb?: { label: string; href?: string }[]
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-white flex">
      {/* ─── Sidebar desktop ─── */}
      <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:border-r lg:border-neutral-800 lg:bg-neutral-950 lg:fixed lg:inset-y-0">
        <div className="px-4 py-5 border-b border-neutral-800">
          <h1 className="text-sm font-bold tracking-tight">Fashion Store</h1>
          <p className="text-[9px] uppercase tracking-widest text-neutral-600 mt-0.5">Painel admin</p>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {modules.map(m => {
            const Icon = m.icon
            const active = m.href === "/admin" ? pathname === "/admin" : pathname.startsWith(m.href)
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] font-medium transition ${
                  active
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {m.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-neutral-800 p-3 space-y-1">
          <Link href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900 transition">
            <Eye className="h-3.5 w-3.5" /> Abrir loja
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] text-neutral-500 hover:text-red-400 hover:bg-neutral-900 transition">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </aside>

      {/* ─── Main content ─── */}
      <div className="flex-1 lg:ml-56 min-w-0 overflow-x-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden border-b border-neutral-800 bg-neutral-950 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 h-12">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="text-neutral-400 hover:text-white -ml-1">
                <Menu className="h-5 w-5" />
              </button>
              <span className="text-[13px] font-semibold truncate">{title || "Admin"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/" target="_blank" className="text-neutral-600 hover:text-neutral-300"><Eye className="h-4 w-4" /></Link>
              <button onClick={handleLogout} className="text-neutral-600 hover:text-red-400"><LogOut className="h-4 w-4" /></button>
            </div>
          </div>
        </header>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col">
              <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-800">
                <div>
                  <h1 className="text-sm font-bold">Fashion Store</h1>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-600">Admin</p>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-neutral-500"><X className="h-5 w-5" /></button>
              </div>
              <nav className="flex-1 py-3 px-2 space-y-0.5">
                {modules.map(m => {
                  const Icon = m.icon
                  const active = m.href === "/admin" ? pathname === "/admin" : pathname.startsWith(m.href)
                  return (
                    <Link
                      key={m.href}
                      href={m.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-3 text-[13px] font-medium transition ${
                        active ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-200"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {m.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="border-t border-neutral-800 p-3 space-y-1">
                <Link href="/" target="_blank" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[12px] text-neutral-500 hover:text-neutral-200 transition">
                  <Eye className="h-3.5 w-3.5" /> Abrir loja
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-[12px] text-neutral-500 hover:text-red-400 transition">
                  <LogOut className="h-3.5 w-3.5" /> Sair
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 px-6 pt-5 text-[11px] text-neutral-600">
            <Link href="/admin" className="hover:text-neutral-300">Admin</Link>
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" />
                {b.href ? <Link href={b.href} className="hover:text-neutral-300">{b.label}</Link> : <span className="text-neutral-400">{b.label}</span>}
              </span>
            ))}
          </div>
        )}

        {/* Page content */}
        <div className="px-4 py-5 lg:px-6 lg:py-6">
          {children}
        </div>
      </div>
    </div>
  )
}
