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
import { products, categories, type ProductCategory } from "@/lib/data/products"
import { formatPrice } from "@/lib/format"

const sizes = ["P", "M", "G", "GG"]
const colors = [
  { name: "Preto", value: "#000000" },
  { name: "Branco", value: "#FFFFFF" },
  { name: "Off-white", value: "#FAF9F6" },
  { name: "Cinza", value: "#808080" },
  { name: "Areia", value: "#C2B280" },
]
const sortOptions = [
  { value: "recent", label: "Mais recentes" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
  { value: "name", label: "A-Z" },
]

const MIN_PRICE = 0
const MAX_PRICE = 200
const PRODUCTS_PER_PAGE = 24

export function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const initialCategory = searchParams.get("categoria") || ""
  const initialSearch = searchParams.get("busca") || ""

  const [search, setSearch] = useState(initialSearch)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : [])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE])
  const [showPromotions, setShowPromotions] = useState(false)
  const [showNewArrivals, setShowNewArrivals] = useState(false)
  const [sortBy, setSortBy] = useState("recent")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [catalogPage, setCatalogPage] = useState(1)

  // Sync filters to URL
  const syncUrl = useCallback((cats: string[], q: string) => {
    const params = new URLSearchParams()
    if (cats.length === 1) params.set("categoria", cats[0])
    if (q) params.set("busca", q)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [router, pathname])

  const handleCategoryChange = (slug: string, checked: boolean) => {
    const next = checked ? [...selectedCategories, slug] : selectedCategories.filter((c) => c !== slug)
    setSelectedCategories(next)
    setCatalogPage(1)
    syncUrl(next, search)
  }

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setCatalogPage(1)
    syncUrl(selectedCategories, val)
  }

  const filteredProducts = useMemo(() => {
    let result = [...products]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    }
    if (selectedCategories.length > 0) {
      result = result.filter((p) => {
        const slug = p.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")
        return selectedCategories.some((cat) => cat === slug || p.category.toLowerCase() === cat.toLowerCase())
      })
    }
    if (selectedSizes.length > 0) result = result.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)))
    if (selectedColors.length > 0) result = result.filter((p) => p.colors.some((c) => selectedColors.includes(c.name)))
    if (priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE) {
      result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
    }
    if (showPromotions) result = result.filter((p) => p.isPromotion)
    if (showNewArrivals) result = result.filter((p) => p.isNew)
    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break
      case "price-desc": result.sort((a, b) => b.price - a.price); break
      case "name": result.sort((a, b) => a.name.localeCompare(b.name)); break
    }
    return result
  }, [search, selectedCategories, selectedSizes, selectedColors, priceRange, showPromotions, showNewArrivals, sortBy])

  // Pagination — reset when filters change
  const totalCatalogPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const paginatedProducts = useMemo(() => {
    const effectivePage = catalogPage > Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) ? 1 : catalogPage
    const start = (effectivePage - 1) * PRODUCTS_PER_PAGE
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE)
  }, [filteredProducts, catalogPage])

  const clearFilters = () => {
    setSearch(""); setSelectedCategories([]); setSelectedSizes([]); setSelectedColors([])
    setPriceRange([MIN_PRICE, MAX_PRICE]); setShowPromotions(false); setShowNewArrivals(false); setSortBy("recent")
    setCatalogPage(1)
    router.replace(pathname, { scroll: false })
  }

  const hasActiveFilters = search || selectedCategories.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0 || showPromotions || showNewArrivals || priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE

  const FiltersContent = ({ onApply }: { onApply?: () => void }) => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Categorias</h3>
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <div key={cat.slug} className="flex items-center gap-2.5">
              <Checkbox id={`f-${cat.slug}`} checked={selectedCategories.includes(cat.slug)} onCheckedChange={(checked) => handleCategoryChange(cat.slug, !!checked)} />
              <Label htmlFor={`f-${cat.slug}`} className="text-sm font-normal">{cat.name}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold">Tamanhos</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Button key={size} variant={selectedSizes.includes(size) ? "default" : "outline"} size="sm" className="h-9 min-w-[44px] rounded-full touch-target" onClick={() => setSelectedSizes((p) => p.includes(size) ? p.filter((s) => s !== size) : [...p, size])}>
              {size}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold">Cores</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button key={color.name} className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all touch-target ${selectedColors.includes(color.name) ? "border-foreground ring-2 ring-foreground ring-offset-2" : "border-border"}`} style={{ backgroundColor: color.value }} onClick={() => setSelectedColors((p) => p.includes(color.name) ? p.filter((c) => c !== color.name) : [...p, color.name])} title={color.name} aria-label={`Cor ${color.name}${selectedColors.includes(color.name) ? " (selecionada)" : ""}`} />
          ))}
        </div>
        {selectedColors.length > 0 && <p className="mt-1.5 text-xs text-muted-foreground">Selecionadas: {selectedColors.join(", ")}</p>}
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold">Faixa de preço</h3>
        <Slider min={MIN_PRICE} max={MAX_PRICE} step={10} value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} className="mt-2" />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold">Filtros especiais</h3>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <Checkbox id="fp" checked={showPromotions} onCheckedChange={(c) => setShowPromotions(!!c)} />
            <Label htmlFor="fp" className="text-sm font-normal">Em promoção</Label>
          </div>
          <div className="flex items-center gap-2.5">
            <Checkbox id="fn" checked={showNewArrivals} onCheckedChange={(c) => setShowNewArrivals(!!c)} />
            <Label htmlFor="fn" className="text-sm font-normal">Lançamentos</Label>
          </div>
        </div>
      </div>
      {/* Mobile: Apply button */}
      {onApply && (
        <Button className="w-full touch-target" onClick={onApply}>
          Aplicar filtros ({filteredProducts.length})
        </Button>
      )}
      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" /> Limpar filtros
        </Button>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* Desktop Filters */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24 rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <h2 className="text-sm font-semibold">Filtros</h2>
          </div>
          <FiltersContent />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Search + Sort */}
        <div className="mb-4 flex items-center gap-2 sm:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" inputMode="search" placeholder="Buscar produtos..." value={search} onChange={(e) => handleSearchChange(e.target.value)} autoComplete="off" enterKeyHint="search" className="h-10 pl-9 text-base sm:h-11" />
          </div>
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 sm:h-11 sm:w-auto sm:gap-2 sm:px-4">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {hasActiveFilters && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] text-background">!</span>}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-[380px]">
              <SheetHeader><SheetTitle>Filtros</SheetTitle></SheetHeader>
              <div className="mt-6 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 120px)" }}>
                <FiltersContent onApply={() => setMobileFiltersOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="hidden h-10 w-[150px] shrink-0 sm:flex sm:h-11">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {search && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                &ldquo;{search}&rdquo;
                <button onClick={() => handleSearchChange("")} className="ml-0.5 hover:text-destructive touch-target" aria-label="Remover busca"><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedCategories.map((cat) => (
              <span key={cat} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                {categories.find((c) => c.slug === cat)?.name || cat}
                <button onClick={() => handleCategoryChange(cat, false)} className="ml-0.5 hover:text-destructive"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {selectedSizes.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                {s} <button onClick={() => setSelectedSizes((p) => p.filter((x) => x !== s))}><X className="h-3 w-3" /></button>
              </span>
            ))}
            <button onClick={clearFilters} className="text-xs text-muted-foreground underline hover:text-foreground">Limpar</button>
          </div>
        )}

        {/* Results */}
        <p className="mb-3 text-xs text-muted-foreground sm:mb-4 sm:text-sm">
          {filteredProducts.length} {filteredProducts.length === 1 ? "produto" : "produtos"}
          {totalCatalogPages > 1 && ` — página ${catalogPage} de ${totalCatalogPages}`}
        </p>

        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4">
              {paginatedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>

            {/* Pagination */}
            {totalCatalogPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => { setCatalogPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                  disabled={catalogPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalCatalogPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={catalogPage === p ? "default" : "outline"}
                    size="icon"
                    className="h-9 w-9 rounded-full text-xs"
                    onClick={() => { setCatalogPage(p); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => { setCatalogPage((p) => Math.min(totalCatalogPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                  disabled={catalogPage === totalCatalogPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="mt-4 font-serif text-base font-semibold sm:text-lg">Nenhum produto encontrado</h3>
            <p className="mt-1.5 max-w-sm text-xs text-muted-foreground sm:text-sm">Tente ajustar os filtros ou buscar por outro termo.</p>
            <Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={clearFilters}>Limpar filtros</Button>
          </div>
        )}
      </div>
    </div>
  )
}
