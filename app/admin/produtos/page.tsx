"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Search, Plus, Edit, Trash2, ExternalLink, RefreshCw,
  ChevronLeft, ChevronRight, AlertCircle, Loader2, Copy,
} from "lucide-react"
import type { Product } from "@/lib/data/products"
import { LogoutButton } from "../logout-button"

const PAGE_SIZE = 12

type StatusFilter = "all" | "ativo" | "rascunho" | "oculto" | "esgotado" | "sem-capa" | "sem-estoque" | "promocao" | "lancamento"

export default function AdminProdutosPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [page, setPage] = useState(1)
  const [migrating, setMigrating] = useState(false)
  const [migrateMsg, setMigrateMsg] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" })
      if (!res.ok) {
        if (res.status === 401) { router.push("/admin/login"); return }
        throw new Error(`HTTP ${res.status}`)
      }
      setProducts(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    let r = products
    switch (statusFilter) {
      case "ativo": case "rascunho": case "oculto": case "esgotado":
        r = r.filter(p => p.status === statusFilter); break
      case "sem-capa":
        r = r.filter(p => !p.images || p.images.length === 0); break
      case "sem-estoque":
        r = r.filter(p => p.variants.filter(v => v.active).reduce((s, v) => s + v.stock, 0) === 0); break
      case "promocao":
        r = r.filter(p => p.isPromotion); break
      case "lancamento":
        r = r.filter(p => p.isNew); break
    }
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.slug.includes(q)
      )
    }
    return r
  }, [products, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir "${name}"?\n\nIsto remove o produto e TODAS as variantes/reservas vinculadas.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (e) {
      alert("Falha ao excluir: " + (e instanceof Error ? e.message : "erro"))
    } finally {
      setDeletingId(null)
    }
  }

  const handleDuplicate = async (id: string, name: string) => {
    if (!confirm(`Duplicar "${name}"?\n\nSerá criada uma cópia como rascunho.`)) return
    try {
      const res = await fetch(`/api/admin/products/${id}/duplicate`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message ?? "Erro")
      alert(data.message)
      await load()
    } catch (e) {
      alert("Falha ao duplicar: " + (e instanceof Error ? e.message : "erro"))
    }
  }

  const handleMigrate = async () => {
    if (!confirm("Importar produtos do array estático para o Supabase?\n\nIdempotente: pode rodar múltiplas vezes sem duplicar.")) return
    setMigrating(true)
    setMigrateMsg(null)
    try {
      const res = await fetch("/api/admin/migrate", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro")
      setMigrateMsg(data.message)
      await load()
    } catch (e) {
      setMigrateMsg("Erro: " + (e instanceof Error ? e.message : "desconhecido"))
    } finally {
      setMigrating(false)
    }
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-white">
      <header className="border-b border-neutral-800 px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-[10px] text-neutral-500 hover:text-neutral-300">← Admin</Link>
            <h1 className="text-base font-semibold">Produtos</h1>
            <span className="text-[10px] text-neutral-600">{products.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="flex h-8 items-center gap-1.5 rounded border border-neutral-700 bg-neutral-900 px-3 text-[11px] text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
              title="Importar produtos do array estático para o banco"
            >
              {migrating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Migrar legado
            </button>
            <Link
              href="/admin/produtos/novo"
              className="flex h-8 items-center gap-1.5 rounded bg-emerald-600 px-3 text-[11px] font-medium text-white hover:bg-emerald-500"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo produto
            </Link>
            <LogoutButton />
          </div>
        </div>
        {migrateMsg && (
          <div className="mx-auto mt-2 max-w-6xl text-[11px] text-emerald-400">{migrateMsg}</div>
        )}
      </header>

      <div className="mx-auto max-w-6xl space-y-4 p-4">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
            <input
              type="search"
              placeholder="Buscar nome, SKU, slug..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="h-9 w-full rounded border border-neutral-800 bg-neutral-900 pl-8 pr-3 text-xs text-white outline-none focus:border-neutral-600"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as StatusFilter); setPage(1) }}
            className="h-9 rounded border border-neutral-800 bg-neutral-900 px-3 text-xs text-white outline-none"
          >
            <option value="all">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="rascunho">Rascunhos</option>
            <option value="oculto">Ocultos</option>
            <option value="esgotado">Esgotados</option>
            <option value="sem-capa">Sem capa</option>
            <option value="sem-estoque">Sem estoque</option>
            <option value="promocao">Promoção</option>
            <option value="lancamento">Lançamento</option>
          </select>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-neutral-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando produtos...
          </div>
        ) : error ? (
          <div className="rounded border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-400">
            <AlertCircle className="mr-2 inline h-4 w-4" />
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded border border-dashed border-neutral-800 py-16 text-center text-sm text-neutral-500">
            {products.length === 0
              ? "Nenhum produto no banco. Use \"Migrar legado\" para importar do array estático."
              : "Nenhum produto encontrado com esse filtro."}
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded border border-neutral-800">
              <table className="w-full text-xs">
                <thead className="bg-neutral-900 text-neutral-500">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Produto</th>
                    <th className="px-3 py-2 text-left font-medium">SKU</th>
                    <th className="px-3 py-2 text-left font-medium">Categoria</th>
                    <th className="px-3 py-2 text-right font-medium">Preço</th>
                    <th className="px-3 py-2 text-right font-medium">Estoque</th>
                    <th className="px-3 py-2 text-center font-medium">Status</th>
                    <th className="px-3 py-2 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {paginated.map(p => {
                    const totalStock = p.variants.filter(v => v.active).reduce((s, v) => s + v.stock, 0)
                    const alerts: string[] = []
                    if (!p.images || p.images.length === 0) alerts.push("Sem imagem")
                    if (!p.variants || p.variants.length === 0) alerts.push("Sem variantes")
                    if (totalStock === 0 && p.status === "ativo") alerts.push("Sem estoque")
                    if (!p.description || p.description.length < 10) alerts.push("Sem descrição")
                    return (
                      <tr key={p.id} className="hover:bg-neutral-900/50">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2.5">
                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-neutral-900 border border-neutral-800">
                              {p.images?.[0] ? <Image src={p.images[0]} alt="" fill className="object-cover" sizes="44px" unoptimized /> : <div className="flex h-full w-full items-center justify-center text-neutral-700"><AlertCircle className="h-4 w-4" /></div>}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-medium">{p.name}</p>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-neutral-500">{p.slug}</span>
                                {alerts.length > 0 && (
                                  <span className="flex items-center gap-0.5 rounded bg-yellow-900/30 px-1 py-px text-[8px] font-medium text-yellow-400">
                                    <AlertCircle className="h-2 w-2" /> {alerts.length}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px] text-neutral-400">{p.sku}</td>
                        <td className="px-3 py-2 text-[10px] text-neutral-400">{p.category}</td>
                        <td className="px-3 py-2 text-right font-mono">R$ {p.price.toFixed(2)}</td>
                        <td className={`px-3 py-2 text-right font-mono ${totalStock === 0 ? "text-red-400" : totalStock <= 5 ? "text-yellow-400" : "text-neutral-300"}`}>
                          {totalStock}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`rounded px-1.5 py-0.5 text-[9px] ${
                            p.status === "ativo" ? "bg-emerald-900/40 text-emerald-400"
                              : p.status === "rascunho" ? "bg-yellow-900/40 text-yellow-400"
                              : p.status === "oculto" ? "bg-neutral-800 text-neutral-400"
                              : "bg-red-900/40 text-red-400"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/produto/${p.slug}`}
                              target="_blank"
                              className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-white"
                              title="Ver no site"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                            <Link
                              href={`/admin/produtos/${p.id}`}
                              className="rounded p-1 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                              title="Editar"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDuplicate(p.id, p.name)}
                              className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
                              title="Duplicar"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              disabled={deletingId === p.id}
                              className="rounded p-1 text-red-500 hover:bg-red-950/40 disabled:opacity-50"
                              title="Excluir"
                            >
                              {deletingId === p.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Trash2 className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <p>Página {safePage} de {totalPages} · {filtered.length} produtos</p>
                <div className="flex gap-1.5">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                    className="flex h-7 items-center gap-1 rounded border border-neutral-800 bg-neutral-900 px-2.5 text-[10px] hover:bg-neutral-800 disabled:opacity-30">
                    <ChevronLeft className="h-3 w-3" /> Anterior
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                    className="flex h-7 items-center gap-1 rounded border border-neutral-800 bg-neutral-900 px-2.5 text-[10px] hover:bg-neutral-800 disabled:opacity-30">
                    Próxima <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
