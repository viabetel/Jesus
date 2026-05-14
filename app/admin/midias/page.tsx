"use client"
import { AdminShell } from "@/components/admin/admin-shell"
import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, ChevronRight, Copy, ExternalLink, AlertCircle, Check, Image as ImageIcon, Video, Search, ChevronLeft } from "lucide-react"

const PER_PAGE = 6

type MediaItem = { id: number; url: string; kind: string; role: string; colorKey?: string; colorName?: string }
type ProductWithMedia = {
  id: string; name: string; slug: string; images: string[]
  coverImage?: string | null
  media: MediaItem[]
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false)
  return <button onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500) }}
    className="flex h-5 w-5 items-center justify-center rounded bg-neutral-800 text-neutral-400 hover:bg-neutral-700" title="Copiar URL">
    {ok ? <Check className="h-2.5 w-2.5 text-green-400" /> : <Copy className="h-2.5 w-2.5" />}
  </button>
}

export default function AdminMidiasPage() {
  const [products, setProducts] = useState<ProductWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1); const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then(r => r.json()),
      fetch("/api/admin/products").then(async (r) => {
        // Fetch all media in a separate call
        const prods = await r.json()
        const ids = Array.isArray(prods) ? prods.map((p: any) => p.id) : []
        if (ids.length === 0) return {}
        // Fetch media for all products via individual calls (batch)
        const mediaRes = await Promise.all(
          ids.map((id: string) =>
            fetch(`/api/admin/products/${id}/media`).then(r => r.ok ? r.json() : []).catch(() => [])
          )
        )
        const map: Record<string, MediaItem[]> = {}
        ids.forEach((id: string, i: number) => { map[id] = Array.isArray(mediaRes[i]) ? mediaRes[i] : [] })
        return map
      })
    ]).then(([prods, mediaMap]) => {
      const prodsArr = Array.isArray(prods) ? prods : []
      const enriched: ProductWithMedia[] = prodsArr.map((p: any) => ({
        id: p.id, name: p.name, slug: p.slug, images: p.images || [],
        coverImage: p.coverImage || null,
        media: (mediaMap as any)[p.id] || [],
      }))
      setProducts(enriched)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => !search ? products : products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase())
  ), [search, products])
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <AdminShell title="Mídias" breadcrumb={[{label:"Mídias"}]}>
      <div className="max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Mídias</h1>
            <p className="mt-1 text-[12px] text-neutral-500">{products.length} produtos · Imagens e vídeos de product_media.</p>
          </div>
        </div>
        <div className="relative mb-3"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-600" />
          <input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Buscar..."
            className="h-9 w-full rounded-lg border border-neutral-800 bg-neutral-900 pl-8 pr-3 text-xs text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none" />
        </div>
        {loading ? <p className="py-12 text-center text-xs text-neutral-600">Carregando...</p> : (
        <div className="space-y-1.5">
          {paginated.map(p => {
            const imgs = p.media.filter(m => m.kind === "image").length
            const vids = p.media.filter(m => m.kind === "video").length
            const legacyImgs = p.images.filter(img => !!img).length
            const totalImgs = imgs || legacyImgs
            const isExp = expanded === p.id
            const issues: string[] = []
            if (totalImgs === 0) issues.push("Sem imagem")
            if (vids === 0) issues.push("Sem vídeo")
            const thumbUrl = p.coverImage || p.media.find(m => m.kind === "image")?.url || p.images.find(i => !!i) || null

            return (
              <div key={p.id} className="rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden">
                <button onClick={() => setExpanded(isExp ? null : p.id)} className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-neutral-900/60">
                  {isExp ? <ChevronDown className="h-3.5 w-3.5 text-neutral-600" /> : <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />}
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                    {thumbUrl ? <Image src={thumbUrl} alt="" fill className="object-cover" sizes="32px" /> : <ImageIcon className="h-3 w-3 text-neutral-700 m-auto" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium">{p.name}</p>
                    <p className="text-[9px] text-neutral-500">
                      {imgs > 0 ? `${imgs} media` : `${legacyImgs} legacy`} · {vids} vídeo
                    </p>
                  </div>
                  {issues.length > 0 && <div className="flex items-center gap-1 text-[9px] text-yellow-500"><AlertCircle className="h-2.5 w-2.5" />{issues.join(", ")}</div>}
                  <Link href={`/admin/produtos/${p.id}`} onClick={e => e.stopPropagation()} className="text-neutral-600 hover:text-neutral-300"><ExternalLink className="h-3 w-3" /></Link>
                </button>
                {isExp && (
                  <div className="border-t border-neutral-800 px-3 py-3">
                    {p.media.length > 0 ? (
                      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8">
                        {p.media.map((item) => (
                          <div key={item.id} className="group relative">
                            <div className="relative aspect-square overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                              {item.kind === "video"
                                ? <div className="flex h-full w-full items-center justify-center text-neutral-600"><Video className="h-4 w-4" /></div>
                                : <Image src={item.url} alt="" fill className="object-cover" sizes="60px" />}
                            </div>
                            <div className="absolute inset-0 flex items-end justify-end gap-0.5 rounded-lg p-0.5 opacity-0 group-hover:opacity-100">
                              <CopyBtn text={item.url} />
                            </div>
                            <p className="mt-0.5 text-[7px] text-neutral-600">{item.role}{item.colorName ? ` · ${item.colorName}` : ""}</p>
                          </div>
                        ))}
                      </div>
                    ) : p.images.filter(i => !!i).length > 0 ? (
                      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8">
                        {p.images.filter(i => !!i).map((url, i) => (
                          <div key={i} className="group relative">
                            <div className="relative aspect-square overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                              <Image src={url} alt="" fill className="object-cover" sizes="60px" />
                            </div>
                            <p className="mt-0.5 text-[7px] text-neutral-600">legacy</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-neutral-600 py-4 text-center">Nenhuma mídia cadastrada.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        )}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 hover:bg-neutral-800 disabled:opacity-30"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <span className="text-[10px] text-neutral-500">{page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 hover:bg-neutral-800 disabled:opacity-30"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
