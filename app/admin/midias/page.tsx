"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  AlertCircle,
  Check,
  Image as ImageIcon,
  Video,
  LogOut,
  Search,
  ChevronLeft,
} from "lucide-react"
import { products } from "@/lib/data/products"
import { buildMediaFromLegacy, detectProvider, type MediaItem } from "@/lib/data/media"

const ITEMS_PER_PAGE = 6

function ProviderBadge({ provider }: { provider: string }) {
  const colors: Record<string, string> = {
    drive: "bg-blue-900/50 text-blue-400",
    cloudinary: "bg-purple-900/50 text-purple-400",
    blob: "bg-green-900/50 text-green-400",
    local: "bg-neutral-800 text-neutral-400",
    external: "bg-yellow-900/50 text-yellow-400",
  }
  return (
    <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium uppercase ${colors[provider] || colors.external}`}>
      {provider}
    </span>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex h-6 w-6 items-center justify-center rounded bg-neutral-800 text-neutral-400 transition hover:bg-neutral-700 hover:text-white"
      title="Copiar URL"
    >
      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

function MediaThumb({ item }: { item: MediaItem }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="group relative">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
        {item.type === "video" ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-neutral-600">
            <Video className="h-6 w-6" />
            <span className="text-[9px]">Vídeo</span>
          </div>
        ) : imgError ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-red-500/60">
            <AlertCircle className="h-5 w-5" />
            <span className="text-[8px]">Erro</span>
          </div>
        ) : (
          <Image
            src={item.url}
            alt={item.alt}
            fill
            className="object-cover"
            sizes="80px"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* Overlay actions */}
      <div className="absolute inset-0 flex items-end justify-end gap-1 rounded-lg bg-black/0 p-1 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
        <CopyButton text={item.url} />
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-6 w-6 items-center justify-center rounded bg-neutral-800 text-neutral-400 transition hover:bg-neutral-700 hover:text-white"
          title="Abrir mídia"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Role + Provider */}
      <div className="mt-1 flex items-center gap-1">
        <span className="text-[9px] text-neutral-600">{item.role}</span>
        <ProviderBadge provider={item.sourceProvider} />
      </div>
    </div>
  )
}

function ProductRow({ product }: { product: typeof products[0] }) {
  const [expanded, setExpanded] = useState(false)
  const media = useMemo(() => buildMediaFromLegacy(product), [product])

  const allItems = [media.cover, media.hover, ...media.gallery].filter(Boolean) as MediaItem[]
  const imageCount = allItems.filter((m) => m.type === "image").length
  const videoCount = allItems.filter((m) => m.type === "video").length

  const issues: string[] = []
  if (!media.cover) issues.push("Sem capa")
  if (!media.hover) issues.push("Sem hover")
  if (videoCount === 0) issues.push("Sem vídeo")

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-neutral-900/60"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-neutral-600" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-neutral-600" />
        )}

        {/* Thumb preview */}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
          {media.cover ? (
            <Image src={media.cover.url} alt="" fill className="object-cover" sizes="40px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-4 w-4 text-neutral-700" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-white">{product.name}</p>
          <div className="flex items-center gap-2 text-[10px] text-neutral-500">
            <span>{imageCount} img</span>
            <span>{videoCount} vídeo</span>
            <ProviderBadge provider={detectProvider(product.images[0] || "")} />
          </div>
        </div>

        {/* Issues */}
        {issues.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-yellow-500">
            <AlertCircle className="h-3 w-3" />
            <span>{issues.join(", ")}</span>
          </div>
        )}

        {/* Link to product */}
        <Link
          href={`/produto/${product.slug}`}
          target="_blank"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 text-[10px] text-neutral-600 hover:text-neutral-300"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </button>

      {/* Expanded media grid */}
      {expanded && (
        <div className="border-t border-neutral-800 px-4 py-4">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {allItems.map((item) => (
              <MediaThumb key={item.id} item={item} />
            ))}
          </div>
          {allItems.length === 0 && (
            <p className="py-4 text-center text-xs text-neutral-600">Nenhuma mídia encontrada.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminMidiasPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!search) return products
    const q = search.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
  }, [search])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

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
            <h1 className="text-lg font-semibold">Mídia</h1>
            <span className="text-xs text-neutral-600">{products.length} produtos</span>
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
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
          <input
            type="search"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="h-10 w-full rounded-lg border border-neutral-800 bg-neutral-900 pl-9 pr-4 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
          />
        </div>

        {/* Product list */}
        <div className="space-y-2">
          {paginated.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </div>

        {paginated.length === 0 && (
          <p className="py-12 text-center text-sm text-neutral-600">Nenhum produto encontrado.</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 transition hover:bg-neutral-800 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-neutral-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 transition hover:bg-neutral-800 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
