"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  HardDrive,
  FolderOpen,
  ArrowRight,
  Image as ImageIcon,
  Video,
  LogOut,
  Info,
} from "lucide-react"
import { products } from "@/lib/data/products"

export default function AdminDrivePage() {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState("")
  const [folderId, setFolderId] = useState("")

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
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs text-neutral-500 hover:text-neutral-300">← Admin</Link>
            <h1 className="text-lg font-semibold">Importação Drive</h1>
            <span className="rounded bg-blue-900/30 px-2 py-0.5 text-[9px] font-medium uppercase text-blue-400">Preview</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-400 transition hover:border-neutral-600 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-6">
        {/* Info banner */}
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-900/30 bg-blue-950/20 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
          <div>
            <p className="text-sm font-medium text-blue-300">Estrutura pronta — integração em desenvolvimento</p>
            <p className="mt-1 text-xs text-blue-500/70">
              Este módulo mostra a UI do fluxo de importação de mídia do Google Drive.
              A integração real com a API do Drive será feita na próxima versão após configurar as credenciais OAuth.
            </p>
          </div>
        </div>

        {/* Flow visualization */}
        <div className="mb-8 flex items-center justify-center gap-3 text-xs text-neutral-500">
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-2">
            <HardDrive className="h-4 w-4" />
            <span>Pasta do Drive</span>
          </div>
          <ArrowRight className="h-4 w-4 text-neutral-700" />
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-2">
            <FolderOpen className="h-4 w-4" />
            <span>Listar arquivos</span>
          </div>
          <ArrowRight className="h-4 w-4 text-neutral-700" />
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-2">
            <ImageIcon className="h-4 w-4" />
            <span>Atribuir papéis</span>
          </div>
          <ArrowRight className="h-4 w-4 text-neutral-700" />
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-2">
            <Video className="h-4 w-4" />
            <span>Salvar no catálogo</span>
          </div>
        </div>

        {/* Step 1: Select product */}
        <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900/30 p-5">
          <h2 className="mb-3 text-sm font-semibold">1. Selecionar produto</h2>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="h-10 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-white focus:border-neutral-500 focus:outline-none"
          >
            <option value="">Escolha um produto...</option>
            {products.map((p) => (
              <option key={p.id} value={p.slug}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Step 2: Drive folder */}
        <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900/30 p-5">
          <h2 className="mb-3 text-sm font-semibold">2. ID da pasta no Drive</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              placeholder="Ex: 1ABC123def456..."
              className="h-10 flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none"
            />
            <button
              disabled={!selectedProduct || !folderId}
              className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-30"
            >
              Listar arquivos
            </button>
          </div>
          <p className="mt-2 text-[10px] text-neutral-600">
            Cole o ID da pasta do Google Drive que contém as imagens e vídeos deste produto.
          </p>
        </div>

        {/* Step 3: Role assignment (mock) */}
        <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/10 p-5">
          <h2 className="mb-2 text-sm font-semibold text-neutral-500">3. Atribuir papéis (em breve)</h2>
          <p className="text-xs text-neutral-600">
            Após listar os arquivos da pasta, você poderá arrastar e atribuir cada imagem como:
            capa, hover, frente, costas, detalhe, modelo, lifestyle ou vídeo.
          </p>
          <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {["cover", "hover", "front", "back", "detail", "model", "video"].map((role) => (
              <div
                key={role}
                className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-neutral-800 text-[9px] text-neutral-700 uppercase"
              >
                {role}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
