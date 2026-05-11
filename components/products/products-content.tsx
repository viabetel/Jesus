"use client"

import { useState, useMemo, useCallback } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Filter, X, Search, SlidersHorizontal, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ProductCard } from "@/components/product-card"
import { categories, getProductColors, getProductSizes, getTotalStock, type ProductCategory, type Product } from "@/lib/data/products"
import { formatPrice } from "@/lib/format"

// Derive filter options from real product data
const sortOptions = [
  { value: "recent", label: "Mais recentes" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
  { value: "name", label: "A-Z" },
]
const MIN_PRICE = 0; const MAX_PRICE = 200; const PER_PAGE = 24

export function ProductsContent({ products }: { products: Product[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const allSizes = useMemo(() => [...new Set(products.flatMap(p => getProductSizes(p)))], [products])
  const allColors = useMemo(() => {
    const seen = new Map<string, string>()
    products.forEach(p => getProductColors(p).forEach(c => { if (!seen.has(c.name)) seen.set(c.name, c.value) }))
    return [...seen.entries()].map(([name, value]) => ({ name, value }))
  }, [products])

  // Read all URL params
  const urlDestaque = searchParams.get("destaque") || ""
  const urlTamanho = searchParams.get("tamanho") || ""
  const urlCor = searchParams.get("cor") || ""
  const urlPrecoMax = searchParams.get("preco_max") || ""

  const [search, setSearch] = useState(searchParams.get("busca") || "")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.get("categoria") ? [searchParams.get("categoria")!] : [])
  const [selectedSizes, setSelectedSizes] = useState<string[]>(urlTamanho ? [urlTamanho] : [])
  const [selectedColors, setSelectedColors] = useState<string[]>(urlCor ? [urlCor] : [])
  const [priceRange, setPriceRange] = useState([MIN_PRICE, urlPrecoMax ? Math.min(Number(urlPrecoMax), MAX_PRICE) : MAX_PRICE])
  const [showPromotions, setShowPromotions] = useState(false)
  const [showNewArrivals, setShowNewArrivals] = useState(false)
  const [sortBy, setSortBy] = useState("recent")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  const syncUrl = useCallback((cats: string[], q: string) => {
    const params = new URLSearchParams()
    if (cats.length === 1) params.set("categoria", cats[0])
    if (q) params.set("busca", q)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [router, pathname])

  const handleCategoryChange = (slug: string, checked: boolean) => {
    const next = checked ? [...selectedCategories, slug] : selectedCategories.filter(c => c !== slug)
    setSelectedCategories(next); setPage(1); syncUrl(next, search)
  }
  const handleSearchChange = (val: string) => { setSearch(val); setPage(1); syncUrl(selectedCategories, val) }

  const filteredProducts = useMemo(() => {
    let result = [...products].filter(p => p.status === "ativo")
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) || (p.tags || []).some(t => t.toLowerCase().includes(q)) ||
        getProductColors(p).some(c => c.name.toLowerCase().includes(q)) ||
        getProductSizes(p).some(s => s.toLowerCase().includes(q))
      )
    }
    if (selectedCategories.length > 0) {
      result = result.filter(p => {
        const slug = selectedCategories[0]

        // Categorias comerciais que não existem no array base `categories`
        // precisam ser tratadas antes do lookup, senão caem em `return true`
        // e mostram todos os produtos.
        if (slug === "lancamentos") return p.isNew
        if (slug === "promocoes") return p.isPromotion

        const cat = categories.find(c => c.slug === slug)
        if (!cat) return true
        return p.category === cat.name
      })
    }
    if (selectedSizes.length > 0) result = result.filter(p => getProductSizes(p).some(s => selectedSizes.includes(s)))
    if (selectedColors.length > 0) result = result.filter(p => getProductColors(p).some(c => selectedColors.includes(c.name)))
    if (priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE) result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    if (showPromotions) result = result.filter(p => p.isPromotion)
    if (showNewArrivals) result = result.filter(p => p.isNew)
    // URL destaque param
    if (urlDestaque === "mais-vendidos") result = result.filter(p => p.isBestseller)
    else if (urlDestaque === "pronta-entrega") result = result.filter(p => getTotalStock(p) > 0)
    else if (urlDestaque === "ultimas-unidades") { const low = result.filter(p => { const s = getTotalStock(p); return s > 0 && s <= 10 }); if (low.length > 0) result = low }
    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break
      case "price-desc": result.sort((a, b) => b.price - a.price); break
      case "name": result.sort((a, b) => a.name.localeCompare(b.name)); break
    }
    return result
  }, [search, selectedCategories, selectedSizes, selectedColors, priceRange, showPromotions, showNewArrivals, sortBy, urlDestaque, products])

  const totalPages = Math.ceil(filteredProducts.length / PER_PAGE)
  const effectivePage = page > totalPages ? 1 : page
  const paginated = filteredProducts.slice((effectivePage - 1) * PER_PAGE, effectivePage * PER_PAGE)

  const clearFilters = () => {
    setSearch(""); setSelectedCategories([]); setSelectedSizes([]); setSelectedColors([])
    setPriceRange([MIN_PRICE, MAX_PRICE]); setShowPromotions(false); setShowNewArrivals(false); setSortBy("recent"); setPage(1)
    router.replace(pathname, { scroll: false })
  }

  const hasActiveFilters = search || urlDestaque || selectedCategories.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0 || showPromotions || showNewArrivals || priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE

  const FiltersContent = ({ onApply }: { onApply?: () => void }) => (
    <div className="space-y-5">
      {/* Search */}
      <div><Label className="mb-1.5 block text-xs font-medium">Busca</Label><div className="relative"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Nome, cor, tag..." className="h-9 pl-8 text-xs" /></div></div>
      {/* Categories */}
      <div><Label className="mb-1.5 block text-xs font-medium">Categorias</Label><div className="space-y-1.5">
        {categories.map(cat => (<div key={cat.slug} className="flex items-center gap-2"><Checkbox id={`cat-${cat.slug}`} checked={selectedCategories.includes(cat.slug)} onCheckedChange={(c) => handleCategoryChange(cat.slug, !!c)} /><label htmlFor={`cat-${cat.slug}`} className="text-xs">{cat.name}</label></div>))}
      </div></div>
      {/* Sizes */}
      <div><Label className="mb-1.5 block text-xs font-medium">Tamanhos</Label><div className="flex flex-wrap gap-1.5">
        {allSizes.map(s => (<Button key={s} variant={selectedSizes.includes(s) ? "default" : "outline"} size="sm" className="h-7 min-w-[36px] rounded-full text-[10px]" onClick={() => { setSelectedSizes(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]); setPage(1) }}>{s}</Button>))}
      </div></div>
      {/* Colors */}
      <div><Label className="mb-1.5 block text-xs font-medium">Cores</Label><div className="flex flex-wrap gap-2">
        {allColors.map(c => (<button key={c.name} className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${selectedColors.includes(c.name) ? "border-foreground ring-1 ring-foreground ring-offset-1" : "border-border"}`} style={{ backgroundColor: c.value }} onClick={() => { setSelectedColors(p => p.includes(c.name) ? p.filter(x => x !== c.name) : [...p, c.name]); setPage(1) }} title={c.name} />))}
      </div></div>
      {/* Price */}
      <div><Label className="mb-1.5 block text-xs font-medium">Preço: {formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}</Label><Slider min={MIN_PRICE} max={MAX_PRICE} step={5} value={priceRange} onValueChange={(v) => { setPriceRange(v); setPage(1) }} className="mt-2" /></div>
      {/* Toggles */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2"><Checkbox id="promos" checked={showPromotions} onCheckedChange={(c) => { setShowPromotions(!!c); setPage(1) }} /><label htmlFor="promos" className="text-xs">Promoções</label></div>
        <div className="flex items-center gap-2"><Checkbox id="new" checked={showNewArrivals} onCheckedChange={(c) => { setShowNewArrivals(!!c); setPage(1) }} /><label htmlFor="new" className="text-xs">Lançamentos</label></div>
      </div>
      {hasActiveFilters && <Button variant="outline" size="sm" className="w-full rounded-full text-xs" onClick={() => { clearFilters(); onApply?.() }}>Limpar filtros</Button>}
      {onApply && <Button size="sm" className="w-full rounded-full text-xs" onClick={onApply}>Aplicar filtros</Button>}
    </div>
  )

  return (
    <div className="flex gap-6 lg:gap-8">
      {/* Desktop sidebar */}
      <aside className="hidden w-[220px] shrink-0 lg:block"><div className="sticky top-24"><FiltersContent /></div></aside>

      <div className="min-w-0 flex-1">
        {/* Mobile filter bar */}
        <div className="mb-3 flex items-center gap-2 sm:mb-4">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild className="lg:hidden"><Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-full text-[10px] sm:text-xs"><SlidersHorizontal className="h-3 w-3" /> Filtros {hasActiveFilters && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[8px] text-background">!</span>}</Button></SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-[320px] overflow-y-auto"><SheetHeader><SheetTitle>Filtros</SheetTitle></SheetHeader><div className="mt-4"><FiltersContent onApply={() => setMobileFiltersOpen(false)} /></div></SheetContent>
          </Sheet>
          <div className="flex-1" />
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1) }}>
            <SelectTrigger className="h-8 w-[140px] rounded-full text-[10px] sm:w-[160px] sm:text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{sortOptions.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
          </Select>
        </div>

        {/* Active filter tags */}
        {hasActiveFilters && (
          <div className="mb-3 flex flex-wrap gap-1">
            {search && <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px]">&ldquo;{search}&rdquo;<button onClick={() => handleSearchChange("")} className="hover:text-destructive"><X className="h-2.5 w-2.5" /></button></span>}
            {selectedCategories.map(cat => (<span key={cat} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px]">{categories.find(c => c.slug === cat)?.name || (cat === "lancamentos" ? "Lançamentos" : cat === "promocoes" ? "Promoções" : cat)}<button onClick={() => handleCategoryChange(cat, false)}><X className="h-2.5 w-2.5" /></button></span>))}
            {selectedSizes.map(s => (<span key={s} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px]">{s}<button onClick={() => setSelectedSizes(p => p.filter(x => x !== s))}><X className="h-2.5 w-2.5" /></button></span>))}
            <button onClick={clearFilters} className="text-[10px] text-muted-foreground underline">Limpar</button>
          </div>
        )}

        {/* Count */}
        <p className="mb-2 text-[10px] text-muted-foreground sm:text-xs">
          {filteredProducts.length} {filteredProducts.length === 1 ? "produto" : "produtos"}
          {totalPages > 1 && ` · pág. ${effectivePage}/${totalPages}`}
        </p>

        {/* Grid */}
        {paginated.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 2xl:grid-cols-4">
              {paginated.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-1.5">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }} disabled={effectivePage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map(p => (
                  <Button key={p} variant={effectivePage === p ? "default" : "outline"} size="icon" className="h-8 w-8 rounded-full text-[10px]" onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }) }}>{p}</Button>
                ))}
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }} disabled={effectivePage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/60"><ShoppingBag className="h-7 w-7 text-muted-foreground/50" /></div>
            <h3 className="mt-3 font-serif text-sm font-semibold sm:text-base">Nenhum produto encontrado</h3>
            <p className="mt-1 max-w-sm text-[10px] text-muted-foreground sm:text-xs">Tente ajustar os filtros.</p>
            <Button variant="outline" size="sm" className="mt-3 rounded-full text-xs" onClick={clearFilters}>Limpar filtros</Button>
          </div>
        )}
      </div>
    </div>
  )
}
