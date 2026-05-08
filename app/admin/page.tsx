"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Image as ImageIcon,
  ClipboardCheck,
  HardDrive,
  Package,
  AlertTriangle,
  LogOut,
} from "lucide-react"

const modules = [
  {
    title: "Mídia",
    description: "Galeria, capas, vídeos e auditoria visual de todos os produtos.",
    href: "/admin/midias",
    icon: ImageIcon,
    status: "ativo" as const,
  },
  {
    title: "Catálogo & Validações",
    description: "Verificar slugs duplicados, imagens faltando, preços e estoque.",
    href: "/admin/catalogo",
    icon: ClipboardCheck,
    status: "ativo" as const,
  },
  {
    title: "Importação Drive",
    description: "Fluxo de importação de mídia do Google Drive (estrutura pronta).",
    href: "/admin/drive",
    icon: HardDrive,
    status: "preview" as const,
  },
  {
    title: "Produtos & Variantes",
    description: "Gestão de variantes cor × tamanho × estoque por produto.",
    href: "#",
    icon: Package,
    status: "em projeto" as const,
  },
]

export default function AdminHubPage() {
  const router = useRouter()
  const [unprotected, setUnprotected] = useState(false)

  useEffect(() => {
    // Check if admin is unprotected (no ADMIN_PASSWORD set)
    // The middleware sets x-admin-unprotected header but we can't read it client-side
    // So we check by trying to fetch a known admin page without auth
    // Simple approach: just check if env var exists via a lightweight API
    // For now, we show the banner if there's no cookie AND we got through
    const hasCookie = document.cookie.includes("fs_admin=")
    if (!hasCookie) setUnprotected(true)
  }, [])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Fashion Store Admin</h1>
            <p className="text-xs text-neutral-500">Painel de gestão interna</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300">
              ← Voltar à loja
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-400 transition hover:border-neutral-600 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Unprotected banner */}
        {unprotected && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-800/50 bg-yellow-950/30 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-yellow-400">Admin sem proteção</p>
              <p className="mt-0.5 text-xs text-yellow-600">
                A variável <code className="rounded bg-yellow-900/50 px-1 py-0.5">ADMIN_PASSWORD</code> não está definida.
                Configure no <code className="rounded bg-yellow-900/50 px-1 py-0.5">.env</code> para proteger o painel.
              </p>
            </div>
          </div>
        )}

        {/* Modules grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {modules.map((mod) => {
            const Icon = mod.icon
            const isDisabled = mod.status === "em projeto"

            const card = (
              <div
                className={`group relative rounded-xl border p-5 transition ${
                  isDisabled
                    ? "cursor-not-allowed border-neutral-800 bg-neutral-900/30 opacity-50"
                    : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900"
                }`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800">
                    <Icon className="h-5 w-5 text-neutral-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold">{mod.title}</h2>
                    {mod.status !== "ativo" && (
                      <span className={`text-[10px] font-medium uppercase tracking-wider ${
                        mod.status === "preview" ? "text-blue-400" : "text-neutral-600"
                      }`}>
                        {mod.status}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-neutral-500">{mod.description}</p>
              </div>
            )

            if (isDisabled) return <div key={mod.title}>{card}</div>

            return (
              <Link key={mod.title} href={mod.href}>
                {card}
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
