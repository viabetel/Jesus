"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ExternalLink, AlertTriangle, CheckCircle2, Search, Image as ImageIcon, Video, Copy, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { products } from "@/lib/data/products"
import { getProductMedia, countMediaByType, getDuplicateUrls, getVideoThumbnail } from "@/lib/data/media"
import { cn } from "@/lib/utils"

type Issue = "no-cover" | "no-video" | "duplicate" | "low-images" | "no-hover"

const ISSUE_LABELS: Record<Issue, { label: string; tone: "warn" | "info" | "danger" }> = {
  "no-cover": { label: "Sem capa", tone: "danger" },
  "no-video": { label: "Sem vídeo", tone: "info" },
  "duplicate": { label: "URL repetida", tone: "warn" },
  "low-images": { label: "Poucas fotos (< 4)", tone: "info" },
  "no-hover": { label: "Sem hover", tone: "info" },
}

export function MediaAuditContent() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "with-issues" | "no-video">("all")

  const auditData = useMemo(() => {
    return products.map((p) => {
      const media = getProductMedia(p)
      const counts = countMediaByType(media)
      const duplicates = getDuplicateUrls(media)
      const issues: Issue[] = []
      if (!media.cover || media.cover === "/brand/placeholder-product.svg") issues.push("no-cover")
      if (!p.video) issues.push("no-video")
      if (duplicates.length > 0) issues.push("duplicate")
      if (counts.images < 4) issues.push("low-images")
      if (!media.hover) issues.push("no-hover")
      return { product: p, media, counts, duplicates, issues }
    })
  }, [])

  const filtered = useMemo(() => {
    let result = auditData
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((d) =>
        d.product.name.toLowerCase().includes(q) ||
        d.product.slug.toLowerCase().includes(q) ||
        d.product.category.toLowerCase().includes(q)
      )
    }
    if (filter === "with-issues") result = result.filter((d) => d.issues.length > 0)
    if (filter === "no-video") result = result.filter((d) => !d.product.video)
    return result
  }, [auditData, search, filter])

  const stats = useMemo(() => ({
    total: auditData.length,
    withVideo: auditData.filter((d) => d.product.video).length,
    withIssues: auditData.filter((d) => d.issues.length > 0).length,
    totalImages: auditData.reduce((sum, d) => sum + d.counts.images, 0),
  }), [auditData])

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Admin · Interno</p>
              <h1 className="font-serif text-xl font-bold sm:text-2xl">Auditoria de mídia</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Verifique capa, hover, galeria, vídeo e duplicidades de cada produto.
              </p>
            </div>
            <Link href="/" className="text-xs text-muted-foreground underline hover:text-foreground">
              ← Voltar para a loja
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <StatCard label="Produtos" value={stats.total} />
          <StatCard label="Com vídeo" value={`${stats.withVideo}/${stats.total}`} />
          <StatCard label="Total imagens" value={stats.totalImages} />
          <StatCard label="Com pendências" value={stats.withIssues} tone={stats.withIssues > 0 ? "warn" : "ok"} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, slug, categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>Todos</FilterButton>
            <FilterButton active={filter === "with-issues"} onClick={() => setFilter("with-issues")}>Com pendências</FilterButton>
            <FilterButton active={filter === "no-video"} onClick={() => setFilter("no-video")}>Sem vídeo</FilterButton>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {filtered.map(({ product, media, counts, duplicates, issues }) => (
            <article key={product.id} className="overflow-hidden rounded-xl border bg-card shadow-sm">
              {/* Header do produto */}
              <header className="flex flex-wrap items-start justify-between gap-3 border-b bg-muted/30 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words font-serif text-sm font-semibold sm:text-base">{product.name}</h2>
                    {issues.length === 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> OK
                      </span>
                    ) : (
                      issues.map((issue) => (
                        <span
                          key={issue}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            ISSUE_LABELS[issue].tone === "danger" && "bg-red-100 text-red-700",
                            ISSUE_LABELS[issue].tone === "warn" && "bg-amber-100 text-amber-800",
                            ISSUE_LABELS[issue].tone === "info" && "bg-sky-100 text-sky-700",
                          )}
                        >
                          <AlertTriangle className="h-3 w-3" /> {ISSUE_LABELS[issue].label}
                        </span>
                      ))
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span>id: <code className="rounded bg-muted px-1">{product.id}</code></span>
                    <span>slug: <code className="rounded bg-muted px-1">{product.slug}</code></span>
                    <span>{product.category}</span>
                    <span><ImageIcon className="inline h-3 w-3" /> {counts.images}</span>
                    <span><Video className="inline h-3 w-3" /> {counts.videos}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Link href={`/produto/${product.slug}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11px]">
                      <Eye className="h-3 w-3" /> Abrir produto
                    </Button>
                  </Link>
                </div>
              </header>

              {/* Mídia em duas colunas: capa+hover e galeria */}
              <div className="grid gap-4 p-4 lg:grid-cols-[280px_1fr]">
                {/* Capa + hover */}
                <div className="space-y-2">
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Capa</p>
                    <MediaThumb url={media.cover} alt="Capa" badge="cover" />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Hover</p>
                    {media.hover ? (
                      <MediaThumb url={media.hover} alt="Hover" badge="hover" />
                    ) : (
                      <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed bg-muted/30 text-[10px] text-muted-foreground">
                        — sem hover —
                      </div>
                    )}
                  </div>
                </div>

                {/* Galeria completa por papel */}
                <div className="min-w-0">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Galeria ({media.gallery.length} itens)
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                    {media.gallery.map((item, i) => (
                      <MediaThumb
                        key={i}
                        url={item.url}
                        alt={item.alt}
                        badge={item.role}
                        type={item.type}
                        thumbnail={item.thumbnail}
                        duplicate={duplicates.includes(item.url)}
                      />
                    ))}
                  </div>
                  {duplicates.length > 0 && (
                    <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-2.5 text-[11px] text-amber-800">
                      <p className="font-semibold">URLs repetidas:</p>
                      <ul className="mt-1 space-y-0.5">
                        {duplicates.map((url) => (
                          <li key={url} className="break-all"><code className="rounded bg-amber-100 px-1 py-px">{url}</code></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
              Nenhum produto encontrado com esse filtro.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, tone }: { label: string; value: string | number; tone?: "ok" | "warn" }) {
  return (
    <div className={cn(
      "rounded-xl border bg-card p-3",
      tone === "warn" && "border-amber-300 bg-amber-50",
      tone === "ok" && "border-emerald-200 bg-emerald-50/50",
    )}>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-serif text-lg font-bold sm:text-xl">{value}</p>
    </div>
  )
}

function FilterButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[11px] font-medium transition",
        active ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-foreground"
      )}
    >
      {children}
    </button>
  )
}

function MediaThumb({
  url,
  alt,
  badge,
  type = "image",
  thumbnail,
  duplicate,
}: {
  url: string
  alt: string
  badge?: string
  type?: "image" | "video"
  thumbnail?: string
  duplicate?: boolean
}) {
  const displayUrl = type === "video" ? (thumbnail ?? getVideoThumbnail(url) ?? "/brand/placeholder-product.svg") : url
  return (
    <div className={cn("group relative overflow-hidden rounded-lg border bg-muted", duplicate && "ring-2 ring-amber-400")}>
      <div className="relative aspect-square">
        {/* unoptimized=true para Drive thumbnails (que não estão no remotePatterns) */}
        <Image
          src={displayUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width:640px) 33vw, 120px"
          unoptimized={displayUrl.includes("drive.google.com")}
        />
        {type === "video" && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Video className="h-5 w-5 text-white" />
          </span>
        )}
        {badge && (
          <span className="absolute left-1 top-1 rounded-full bg-black/70 px-1.5 py-px text-[8px] font-bold uppercase tracking-wider text-white">
            {badge}
          </span>
        )}
        {duplicate && (
          <span className="absolute right-1 top-1 rounded-full bg-amber-500 px-1.5 py-px text-[8px] font-bold text-white" title="URL repetida">
            <Copy className="inline h-2.5 w-2.5" />
          </span>
        )}
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1 border-t px-1.5 py-1 text-[9px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        Abrir <ExternalLink className="h-2.5 w-2.5" />
      </a>
    </div>
  )
}
