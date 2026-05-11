"use client"
import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronRight, Copy, ExternalLink, AlertCircle, Check, Image as ImageIcon, Video, LogOut, Search, ChevronLeft } from "lucide-react"
import type { Product } from "@/lib/data/products"
import { buildGalleryEntries, detectProvider } from "@/lib/data/media"

const PER_PAGE = 6

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false)
  return <button onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500) }}
    className="flex h-5 w-5 items-center justify-center rounded bg-neutral-800 text-neutral-400 hover:bg-neutral-700" title="Copiar URL">
    {ok ? <Check className="h-2.5 w-2.5 text-green-400" /> : <Copy className="h-2.5 w-2.5" />}
  </button>
}

export default function AdminMidiasPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1); const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/products").then(r => r.json()).then((data) => { setProducts(Array.isArray(data) ? data : []); setLoading(false) }).catch(() => setLoading(false))
  }, [])
  const filtered = useMemo(() => !search ? products : products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase())), [search])
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const handleLogout = async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); router.refresh() }

  return (
    <div className="min-h-dvh bg-neutral-950 text-white">
      <header className="border-b border-neutral-800 px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2"><Link href="/admin" className="text-[10px] text-neutral-500 hover:text-neutral-300">← Admin</Link><h1 className="text-base font-semibold">Mídia</h1></div>
          <button onClick={handleLogout} className="flex items-center gap-1 rounded-lg border border-neutral-700 px-2.5 py-1 text-[10px] text-neutral-400 hover:text-white"><LogOut className="h-3 w-3" /> Sair</button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-4">
        <div className="relative mb-3"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-600" />
          <input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Buscar..." className="h-9 w-full rounded-lg border border-neutral-800 bg-neutral-900 pl-8 pr-3 text-xs text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none" />
        </div>
        <div className="space-y-1.5">
          {paginated.map(p => {
            const gallery = buildGalleryEntries(p)
            const imgs = gallery.filter(g => g.type === "image").length
            const vids = gallery.filter(g => g.type === "video").length
            const isExp = expanded === p.id
            const issues: string[] = []; if (imgs === 0) issues.push("Sem imagem"); if (vids === 0) issues.push("Sem vídeo")
            return (
              <div key={p.id} className="rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden">
                <button onClick={() => setExpanded(isExp ? null : p.id)} className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-neutral-900/60">
                  {isExp ? <ChevronDown className="h-3.5 w-3.5 text-neutral-600" /> : <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />}
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                    {p.images[0] ? <Image src={p.images[0]} alt="" fill className="object-cover" sizes="32px" /> : <ImageIcon className="h-3 w-3 text-neutral-700 m-auto" />}
                  </div>
                  <div className="flex-1 min-w-0"><p className="truncate text-xs font-medium">{p.name}</p><p className="text-[9px] text-neutral-500">{imgs} img · {vids} vídeo · {detectProvider(p.images[0] || "")}</p></div>
                  {issues.length > 0 && <div className="flex items-center gap-1 text-[9px] text-yellow-500"><AlertCircle className="h-2.5 w-2.5" />{issues.join(", ")}</div>}
                  <Link href={`/produto/${p.slug}`} target="_blank" onClick={e => e.stopPropagation()} className="text-neutral-600 hover:text-neutral-300"><ExternalLink className="h-3 w-3" /></Link>
                </button>
                {isExp && (
                  <div className="border-t border-neutral-800 px-3 py-3">
                    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8">
                      {gallery.map((item, i) => (
                        <div key={i} className="group relative">
                          <div className="relative aspect-square overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                            {item.type === "video" ? <div className="flex h-full w-full items-center justify-center text-neutral-600"><Video className="h-4 w-4" /></div>
                              : <Image src={item.url} alt={item.alt} fill className="object-cover" sizes="60px" />}
                          </div>
                          <div className="absolute inset-0 flex items-end justify-end gap-0.5 rounded-lg p-0.5 opacity-0 group-hover:opacity-100">
                            <CopyBtn text={item.url} />
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex h-5 w-5 items-center justify-center rounded bg-neutral-800 text-neutral-400 hover:bg-neutral-700"><ExternalLink className="h-2.5 w-2.5" /></a>
                          </div>
                          <p className="mt-0.5 text-[7px] text-neutral-600">{item.media.role}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 hover:bg-neutral-800 disabled:opacity-30"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <span className="text-[10px] text-neutral-500">{page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 hover:bg-neutral-800 disabled:opacity-30"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        )}
      </main>
    </div>
  )
}
