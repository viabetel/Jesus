"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Search, X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { products } from "@/lib/data/products"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

type SearchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    ).slice(0, 6)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/produtos?busca=${encodeURIComponent(query.trim())}`)
      onOpenChange(false)
      setQuery("")
    }
  }

  const handleSelect = (slug: string) => {
    onOpenChange(false)
    setQuery("")
    router.push(`/produto/${slug}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[5%] w-[calc(100vw-24px)] max-w-lg translate-y-0 gap-0 overflow-hidden rounded-xl p-0 sm:top-[15%]">
        <DialogTitle className="sr-only">Buscar produtos</DialogTitle>
        <form onSubmit={handleSubmit} className="flex items-center border-b px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar camisetas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent px-3 py-4 text-base outline-none placeholder:text-muted-foreground"
            autoFocus
            autoComplete="off"
            enterKeyHint="search"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="p-1 text-muted-foreground hover:text-foreground touch-target" aria-label="Limpar busca">
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* Results */}
        <div className="max-h-[60dvh] overflow-y-auto">
          {query.trim() && results.length > 0 && (
            <div className="py-2">
              {results.map((product) => (
                <button
                  key={product.id}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted active:bg-muted"
                  onClick={() => handleSelect(product.slug)}
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={product.images[0] || "/brand/placeholder-product.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn("text-sm font-semibold", product.originalPrice && "text-red-600")}>
                      {formatPrice(product.price)}
                    </p>
                    {product.originalPrice && (
                      <p className="text-[10px] text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
                    )}
                  </div>
                </button>
              ))}
              <div className="border-t px-4 py-3">
                <button onClick={handleSubmit} className="w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground">
                  Ver todos os resultados para &ldquo;{query}&rdquo;
                </button>
              </div>
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">Nenhum produto encontrado para &ldquo;{query}&rdquo;</p>
              <Link href="/produtos" onClick={() => { onOpenChange(false); setQuery("") }} className="mt-2 block text-xs text-muted-foreground underline hover:text-foreground">
                Ver catálogo completo
              </Link>
            </div>
          )}

          {!query.trim() && (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              Digite para buscar camisetas...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
