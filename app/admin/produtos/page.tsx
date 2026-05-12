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
import { AdminShell } from "@/components/admin/admin-shell"
import { statusLabel, statusColor } from "@/components/admin/status-helpers"

const PAGE_SIZE = 12

type StatusFilter = "all" | "ativo" | "rascunho" | "oculto" | "esgotado" | "sem-capa" | "sem-estoque" | "promocao" | "lancamento"

const filterLabels: Record<StatusFilter, string> = {
  all: "Todos", ativo: "Publicados", rascunho: "Não publicados", oculto: "Ocultos",
  esgotado: "Esgotados", "sem-capa": "Sem imagem", "sem-estoque": "Sem estoque",
  promocao: "Promoção", lancamento: "Lançamento",
}

export default function AdminProdutosPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" })
      if (!res.ok) { if (res.status === 401) { router.push("/admin/login"); return }; throw new Error(`HTTP ${res.status}`) }
      setProducts(await res.json())
    } catch (e) { setError(e instanceof Error ? e.message : "Erro") } finally { setLoading(false) }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    let r = products
    switch (statusFilter) {
      case "ativo": case "rascunho": case "oculto": case "esgotado":
        r = r.filter(p => p.status === statusFilter); break
      case "sem-capa": r = r.filter(p => !p.images || p.images.length === 0); break
      case "sem-estoque": r = r.filter(p => p.variants.filter(v => v.active).reduce((s, v) => s + v.stock, 0) === 0); break
      case "promocao": r = r.filter(p => p.isPromotion); break
      case "lancamento": r = r.filter(p => p.isNew); break
    }
    if (search) { const q = search.toLowerCase(); r = r.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.slug.includes(q)) }
    return r
  }, [products, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir "${name}"?\n\nRemove produto e TODAS as variantes.`)) return
    setDeletingId(id)
    try { const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error("falha"); setProducts(prev => prev.filter(p => p.id !== id)) }
    catch (e) { alert("Falha: " + (e instanceof Error ? e.message : "erro")) } finally { setDeletingId(null) }
  }

  const handleDuplicate = async (id: string, name: string) => {
    if (!confirm(`Duplicar "${name}" como não publicado?`)) return
    try { const res = await fetch(`/api/admin/products/${id}/duplicate`, { method: "POST" }); if (!res.ok) throw new Error("falha"); await load() }
    catch (e) { alert("Falha: " + (e instanceof Error ? e.message : "erro")) }
  }

  function getStock(p: Product) { return p.variants.filter(v => v.active).reduce((s, v) => s + v.stock, 0) }

  function getAlerts(p: Product): string[] {
    const a: string[] = []
    if (!p.images || p.images.length === 0) a.push("Sem imagem")
    if (!p.variants || p.variants.length === 0) a.push("Sem variantes")
    if (getStock(p) === 0 && p.status === "ativo") a.push("Sem estoque")
    return a
  }

  return (
    <AdminShell title="Produtos" breadcrumb={[{ label: "Produtos" }]}>
      <div className="max-w-6xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Produtos</h1>
            <p className="text-[12px] text-neutral-500">{products.length} cadastrados</p>
          </div>
          <Link href="/admin/produtos/novo" className="flex h-10 items-center gap-1.5 rounded-lg bg-white px-4 text-[12px] font-semibold text-neutral-950 hover:bg-neutral-200 transition w-fit">
            <Plus className="h-4 w-4" /> Novo produto
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input type="search" placeholder="Buscar nome, SKU, slug..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="h-10 w-full rounded-lg border border-neutral-800 bg-neutral-900 pl-10 pr-3 text-[13px] text-white outline-none focus:border-neutral-600" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {(Object.entries(filterLabels) as [StatusFilter, string][]).map(([k, v]) => (
              <button key={k} onClick={() => { setStatusFilter(k); setPage(1) }}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                  statusFilter === k ? "bg-white text-neutral-950" : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                }`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mt-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-neutral-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando...</div>
          ) : error ? (
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-400"><AlertCircle className="mr-2 inline h-4 w-4" />{error}</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-800 py-16 text-center text-sm text-neutral-500">
              {products.length === 0 ? "Nenhum produto cadastrado." : "Nenhum produto com esse filtro."}
            </div>
          ) : (
            <>
              {/* ─── Desktop table ─── */}
              <div className="hidden md:block overflow-hidden rounded-lg border border-neutral-800">
                <table className="w-full text-[12px]">
                  <thead className="bg-neutral-900 text-neutral-500 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Produto</th>
                      <th className="px-4 py-3 text-left font-medium">Categoria</th>
                      <th className="px-4 py-3 text-right font-medium">Preço</th>
                      <th className="px-4 py-3 text-right font-medium">Estoque</th>
                      <th className="px-4 py-3 text-center font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {paginated.map(p => {
                      const stock = getStock(p)
                      const alerts = getAlerts(p)
                      return (
                        <tr key={p.id} className="hover:bg-neutral-900/50 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-900 border border-neutral-800">
                                {p.images?.[0] ? <Image src={p.images[0]} alt="" fill className="object-cover" sizes="48px" unoptimized /> : <div className="flex h-full items-center justify-center text-neutral-700"><AlertCircle className="h-4 w-4" /></div>}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-medium">{p.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-neutral-600 font-mono">{p.sku}</span>
                                  {alerts.length > 0 && <span className="flex items-center gap-0.5 rounded bg-yellow-900/30 px-1.5 py-px text-[8px] font-medium text-yellow-400"><AlertCircle className="h-2 w-2" /> {alerts.join(", ")}</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-neutral-400">{p.category}</td>
                          <td className="px-4 py-3 text-right font-mono">R$ {p.price.toFixed(2)}</td>
                          <td className={`px-4 py-3 text-right font-mono ${stock === 0 ? "text-red-400" : stock <= 5 ? "text-yellow-400" : "text-neutral-300"}`}>{stock}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusColor[p.status] || "bg-neutral-800 text-neutral-400 border-neutral-700"}`}>
                              {statusLabel[p.status] || p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/admin/produtos/${p.id}`} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition" title="Editar"><Edit className="h-4 w-4" /></Link>
                              <Link href={`/produto/${p.slug}`} target="_blank" className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-800 hover:text-white transition" title="Ver no site"><ExternalLink className="h-4 w-4" /></Link>
                              <button onClick={() => handleDuplicate(p.id, p.name)} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 transition" title="Duplicar"><Copy className="h-4 w-4" /></button>
                              <button onClick={() => handleDelete(p.id, p.name)} disabled={deletingId === p.id} className="rounded-lg p-2 text-red-500/70 hover:bg-red-950/40 hover:text-red-400 transition disabled:opacity-50" title="Excluir">
                                {deletingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* ─── Mobile cards ─── */}
              <div className="md:hidden space-y-2.5">
                {paginated.map(p => {
                  const stock = getStock(p)
                  const alerts = getAlerts(p)
                  return (
                    <div key={p.id} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3.5">
                      <div className="flex gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-900 border border-neutral-800">
                          {p.images?.[0] ? <Image src={p.images[0]} alt="" fill className="object-cover" sizes="64px" unoptimized /> : <div className="flex h-full items-center justify-center text-neutral-700"><AlertCircle className="h-5 w-5" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold truncate">{p.name}</p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">{p.category} · {p.sku}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-medium ${statusColor[p.status] || "bg-neutral-800 text-neutral-400 border-neutral-700"}`}>
                              {statusLabel[p.status] || p.status}
                            </span>
                            <span className="text-[11px] font-mono font-medium">R$ {p.price.toFixed(2)}</span>
                            <span className={`text-[11px] font-mono ${stock === 0 ? "text-red-400" : stock <= 5 ? "text-yellow-400" : "text-neutral-400"}`}>
                              Est. {stock}
                            </span>
                          </div>
                          {alerts.length > 0 && <p className="text-[10px] text-yellow-400 mt-1.5">⚠ {alerts.join(" · ")}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-neutral-800">
                        <Link href={`/admin/produtos/${p.id}`} className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-neutral-800 text-[11px] font-medium text-neutral-200 hover:bg-neutral-700 transition">
                          <Edit className="h-3.5 w-3.5" /> Editar
                        </Link>
                        <Link href={`/produto/${p.slug}`} target="_blank" className="h-9 w-9 grid place-items-center rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button onClick={() => handleDuplicate(p.id, p.name)} className="h-9 w-9 grid place-items-center rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700 transition">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} disabled={deletingId === p.id} className="h-9 w-9 grid place-items-center rounded-lg text-red-500/70 hover:bg-red-950/40 transition disabled:opacity-50">
                          {deletingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-[11px] text-neutral-500">
                  <p>{filtered.length} produtos · Página {safePage}/{totalPages}</p>
                  <div className="flex gap-1.5">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                      className="flex h-8 items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 hover:bg-neutral-800 disabled:opacity-30 transition"><ChevronLeft className="h-3 w-3" /> Anterior</button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                      className="flex h-8 items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 hover:bg-neutral-800 disabled:opacity-30 transition">Próxima <ChevronRight className="h-3 w-3" /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
