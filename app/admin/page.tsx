"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Image as ImageIcon, ClipboardCheck, Package, ShoppingCart, LogOut } from "lucide-react"

const modules = [
  { title: "Produtos", desc: "Catálogo, variantes, preços e estoque.", href: "/admin/produtos", icon: Package, active: true },
  { title: "Pedidos", desc: "Pedidos recebidos, status e acompanhamento.", href: "/admin/pedidos", icon: ShoppingCart, active: true },
  { title: "Mídia", desc: "Galeria, capas, vídeos por produto.", href: "/admin/midias", icon: ImageIcon, active: true },
  { title: "Validações", desc: "Slug duplicado, imagem faltando, estoque.", href: "/admin/catalogo", icon: ClipboardCheck, active: true },
]

export default function AdminHubPage() {
  const router = useRouter()
  const handleLogout = async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); router.refresh() }

  return (
    <div className="min-h-dvh bg-neutral-950 text-white">
      <header className="border-b border-neutral-800 px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div><h1 className="text-base font-semibold">Fashion Store Admin</h1><p className="text-[10px] text-neutral-500">Painel de gestão</p></div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-[10px] text-neutral-500 hover:text-neutral-300">← Loja</Link>
            <button onClick={handleLogout} className="flex items-center gap-1 rounded-lg border border-neutral-700 px-2.5 py-1 text-[10px] text-neutral-400 hover:text-white"><LogOut className="h-3 w-3" /> Sair</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {modules.map(m => {
            const Icon = m.icon
            return (
              <Link key={m.title} href={m.href}>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 transition hover:border-neutral-700 hover:bg-neutral-900">
                  <div className="mb-2 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800"><Icon className="h-4 w-4 text-neutral-400" /></div>
                    <h2 className="text-sm font-semibold">{m.title}</h2>
                  </div>
                  <p className="text-[10px] leading-relaxed text-neutral-500">{m.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
