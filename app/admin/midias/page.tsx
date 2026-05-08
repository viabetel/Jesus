"use client"

import Image from "next/image"
import Link from "next/link"
import { products, hasVideo } from "@/lib/data/products"
import { AlertTriangle, Check, ExternalLink, Play } from "lucide-react"

export default function MediaAuditPage() {
  return (
    <div className="min-h-dvh bg-muted/30 p-4 sm:p-8">
      <h1 className="mb-1 font-serif text-2xl font-bold">Auditoria de Mídia</h1>
      <p className="mb-6 text-sm text-muted-foreground">{products.length} produtos · Organize e confira capas, galerias e vídeos</p>
      <div className="space-y-6">
        {products.map((p) => {
          const hasCover = !!p.media.cover
          const hasHover = !!p.media.hover
          const hasVid = hasVideo(p)
          const urls = p.media.gallery.map((m) => m.url)
          const dupes = urls.filter((u, i) => urls.indexOf(u) !== i)
          return (
            <div key={p.id} className="rounded-xl border bg-card p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-serif font-semibold">{p.name}</h2>
                  <p className="text-xs text-muted-foreground">/{p.slug} · {p.media.gallery.length} itens na galeria</p>
                </div>
                <Link href={`/produto/${p.slug}`} className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs hover:bg-muted">
                  Abrir produto <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              {/* Status badges */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${hasCover ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {hasCover ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />} Cover
                </span>
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${hasHover ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {hasHover ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />} Hover
                </span>
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${hasVid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {hasVid ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />} Vídeo
                </span>
                {dupes.length > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-800">
                    <AlertTriangle className="h-3 w-3" /> {dupes.length} URL duplicada
                  </span>
                )}
              </div>
              {/* Gallery grid */}
              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                {p.media.gallery.map((item, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-md bg-muted">
                    {item.type === "video" ? (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-muted">
                        <Play className="h-5 w-5 fill-foreground text-foreground" />
                        <span className="text-[8px] font-bold uppercase">Vídeo</span>
                      </div>
                    ) : (
                      <Image src={item.url} alt={item.alt} fill className="object-cover" sizes="100px" />
                    )}
                    <span className="absolute bottom-0 left-0 right-0 bg-black/70 py-0.5 text-center text-[7px] font-bold uppercase text-white">{item.role}</span>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 opacity-0 group-hover:opacity-100">
                      <div className="flex h-full w-full items-center justify-center bg-black/30"><ExternalLink className="h-4 w-4 text-white" /></div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
