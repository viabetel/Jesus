"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Search, X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

type SearchProduct = {
  id: string; name: string; slug: string; category: string
  price: number; originalPrice?: number; images: string[]
  coverImage?: string; badge?: string
}

type SearchDialogProps = { open: boolean; onOpenChange: (open: boolean) => void }

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<SearchProduct[]>([])
  const router = useRouter()

  // Fetch products when dialog opens
  useEffect(() => {
    if (open && products.length === 0) {
      fetch("/api/products").then(r => r.json()).then(setProducts).catch(() => {})
    }
  }, [open, products.length])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return products.filter(
      p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    ).slice(0, 6)
  }, [query, products])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/produtos?busca=${encodeURIComponent(query.trim())}`)
      onOpenChange(false)
      setQuery("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <DialogTitle className="sr-only">Buscar produtos</DialogTitle>
        <form onSubmit={handleSubmit} className="flex items-center border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar produtos..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          {query && <button type="button" onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
        </form>
        {results.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {results.map(p => (
              <a key={p.id} href={`/produto/${p.slug}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted transition-colors" onClick={() => { onOpenChange(false); setQuery("") }}>
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image src={p.coverImage || p.images?.[0] || "/brand/placeholder-product.svg"} alt={p.name} fill className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                </div>
                <span className={cn("text-sm font-semibold", p.originalPrice && "text-red-600")}>{formatPrice(p.price)}</span>
              </a>
            ))}
          </div>
        )}
        {query && results.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
