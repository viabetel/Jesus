"use client"

import { useMemo, useState, type ReactNode } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { Icon } from "@/components/fashion/Icon"
import {
  categories,
  getProductColors,
  getProductSizes,
  getTotalStock,
  type Product,
} from "@/lib/data/products"
import { formatPrice } from "@/lib/format"

const MIN_PRICE = 0
const MAX_PRICE = 200
const PER_PAGE = 24

function normalizeColor(value: string) {
  return value.toLowerCase().trim()
}

export function ProductsContent({ products }: { products: Product[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const urlCategory = searchParams.get("categoria") || ""
  const urlBusca = searchParams.get("busca") || ""
  const urlDestaque = searchParams.get("destaque") || ""
  const urlTamanho = searchParams.get("tamanho") || ""
  const urlCor = searchParams.get("cor") || ""
  const urlPrecoMax = searchParams.get("preco_max") || ""

  const [filters, setFilters] = useState({
    categoria: urlCategory ? [urlCategory] : ([] as string[]),
    tamanho: urlTamanho ? [urlTamanho.toUpperCase()] : ([] as string[]),
    cor: urlCor ? [urlCor] : ([] as string[]),
    preco: [MIN_PRICE, urlPrecoMax ? Math.min(Number(urlPrecoMax), MAX_PRICE) : MAX_PRICE] as [number, number],
    disponibilidade: urlDestaque ? [urlDestaque] : ([] as string[]),
  })
  const [q, setQ] = useState(urlBusca)
  const [sort, setSort] = useState("Relevância")
  const [mobileFilters, setMobileFilters] = useState(false)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [page, setPage] = useState(1)

  const allSizes = useMemo(() => [...new Set(products.flatMap(p => getProductSizes(p)))], [products])
  const allColors = useMemo(() => {
    const seen = new Map<string, string>()
    products.forEach(p => getProductColors(p).forEach(c => { if (!seen.has(c.name)) seen.set(c.name, c.value) }))
    return [...seen.entries()].map(([name, value]) => ({ name, value }))
  }, [products])

  const categoryLabel = (name: string) => name === "Baby Look" ? "Feminino" : name

  const setSingleUrl = (next: typeof filters, nextQ = q) => {
    const params = new URLSearchParams()
    if (next.categoria[0]) params.set("categoria", next.categoria[0])
    if (next.tamanho[0]) params.set("tamanho", next.tamanho[0])
    if (next.cor[0]) params.set("cor", next.cor[0])
    if (next.disponibilidade[0]) params.set("destaque", next.disponibilidade[0])
    if (next.preco[1] < MAX_PRICE) params.set("preco_max", String(next.preco[1]))
    if (nextQ) params.set("busca", nextQ)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const toggle = (key: keyof typeof filters, value: string) => {
    const next = { ...filters }
    if (key === "preco") return
    const arr = next[key] as string[]
    next[key] = (arr.includes(value) ? arr.filter(v => v !== value) : [value]) as never
    setFilters(next)
    setPage(1)
    setSingleUrl(next)
  }

  const updateSearch = (value: string) => {
    setQ(value)
    setPage(1)
    setSingleUrl(filters, value)
  }

  const setPreco = (range: [number, number]) => {
    const next = { ...filters, preco: range }
    setFilters(next)
    setPage(1)
    setSingleUrl(next)
  }

  const clear = () => {
    const next = { categoria: [], tamanho: [], cor: [], preco: [MIN_PRICE, MAX_PRICE] as [number, number], disponibilidade: [] }
    setFilters(next); setQ(""); setPage(1); router.replace(pathname, { scroll: false })
  }

  const filteredProducts = useMemo(() => {
    let result = [...products].filter(p => p.status === "ativo")

    if (q) {
      const needle = q.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle) ||
        p.category.toLowerCase().includes(needle) ||
        (p.tags || []).some(t => t.toLowerCase().includes(needle))
      )
    }

    if (filters.categoria[0]) {
      const slug = filters.categoria[0]
      result = result.filter(p => {
        if (slug === "lancamentos") return !!p.isNew
        if (slug === "promocoes") return !!p.isPromotion
        const cat = categories.find(c => c.slug === slug)
        if (!cat) return true
        return p.category === cat.name
      })
    }

    if (filters.tamanho[0]) result = result.filter(p => getProductSizes(p).includes(filters.tamanho[0] as never))
    if (filters.cor[0]) result = result.filter(p => getProductColors(p).some(c => normalizeColor(c.name) === normalizeColor(filters.cor[0])))
    if (filters.preco[0] > MIN_PRICE || filters.preco[1] < MAX_PRICE) result = result.filter(p => p.price >= filters.preco[0] && p.price <= filters.preco[1])
    if (filters.disponibilidade[0] === "mais-vendidos") result = result.filter(p => p.isBestseller)
    if (filters.disponibilidade[0] === "pronta-entrega") result = result.filter(p => getTotalStock(p) > 0)
    if (filters.disponibilidade[0] === "ultimas-unidades") {
      const low = result.filter(p => { const s = getTotalStock(p); return s > 0 && s <= 10 })
      if (low.length > 0) result = low
    }

    switch (sort) {
      case "Menor preço": result.sort((a,b) => a.price - b.price); break
      case "Maior preço": result.sort((a,b) => b.price - a.price); break
      case "Mais novos": result.sort((a,b) => Number(!!b.isNew) - Number(!!a.isNew)); break
      case "Mais vendidos": result.sort((a,b) => Number(!!b.isBestseller) - Number(!!a.isBestseller)); break
      default: break
    }
    return result
  }, [products, q, filters, sort])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE))
  const effectivePage = Math.min(page, totalPages)
  const paginated = filteredProducts.slice((effectivePage - 1) * PER_PAGE, effectivePage * PER_PAGE)
  const activeCount = filters.categoria.length + filters.tamanho.length + filters.cor.length + filters.disponibilidade.length + (q ? 1 : 0) + ((filters.preco[0] !== MIN_PRICE || filters.preco[1] !== MAX_PRICE) ? 1 : 0)

  const FilterSection = ({ title, count, children }: { title: string; count?: number; children: ReactNode }) => (
    <div className="border-b border-border py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="caps text-[11px]">{title}</h3>
        {count ? <span className="text-[11px] text-muted-fg">{count}</span> : null}
      </div>
      {children}
    </div>
  )

  const Checkbox = ({ label, count, checked, onChange }: { label: string; count?: number | string; checked: boolean; onChange: () => void }) => (
    <button onClick={onChange} className="group flex w-full items-center justify-between gap-3 py-2 text-left">
      <span className="flex items-center gap-3">
        <span className={`grid h-4 w-4 place-items-center border transition ${checked ? "border-ink bg-ink text-white" : "border-border group-hover:border-ink"}`}>{checked && <Icon name="check" size={11}/>}</span>
        <span className="text-[13px] text-fg-soft group-hover:text-ink transition">{label}</span>
      </span>
      {count !== undefined && <span className="text-[11px] text-muted-fg">{count}</span>}
    </button>
  )

  const FilterPanel = (
    <aside className="filter-scroll">
      <div className="mb-6">
        <label className="caps text-[10.5px] text-muted-fg">Busca</label>
        <div className="mt-2 flex h-11 items-center border border-border px-3">
          <Icon name="search" size={15} className="text-muted-fg" />
          <input value={q} onChange={e => updateSearch(e.target.value)} placeholder="Nome, cor, tag..." className="ml-2 w-full bg-transparent outline-none text-[13px]" />
        </div>
      </div>

      <FilterSection title="Categoria" count={filters.categoria.length}>
        {[...categories.map(c => [categoryLabel(c.name), c.slug] as const), ["Lançamentos", "lancamentos"] as const, ["Promoções", "promocoes"] as const].map(([label, slug]) => (
          <Checkbox key={slug} label={label} count={products.filter(p => slug === "lancamentos" ? p.isNew : slug === "promocoes" ? p.isPromotion : p.category === categories.find(c => c.slug === slug)?.name).length} checked={filters.categoria.includes(slug)} onChange={() => toggle("categoria", slug)} />
        ))}
      </FilterSection>

      <FilterSection title="Preço">
        <div className="flex items-center justify-between text-[12px] text-muted-fg mb-3">
          <span>{formatPrice(filters.preco[0])}</span><span>{formatPrice(filters.preco[1])}</span>
        </div>
        <input className="w-full accent-[var(--ink)]" type="range" min={MIN_PRICE} max={MAX_PRICE} value={filters.preco[1]} onChange={e => setPreco([MIN_PRICE, Number(e.target.value)])} />
      </FilterSection>

      <FilterSection title="Tamanho" count={filters.tamanho.length}>
        <div className="grid grid-cols-4 gap-2">
          {allSizes.map(s => <button key={s} onClick={() => toggle("tamanho", s)} className={`h-10 border caps text-[11px] transition ${filters.tamanho.includes(s) ? "bg-ink text-white border-ink" : "border-border hover:border-ink"}`}>{s}</button>)}
        </div>
      </FilterSection>

      <FilterSection title="Cor" count={filters.cor.length}>
        <div className="grid grid-cols-6 gap-x-2 gap-y-3">
          {allColors.map(c => {
            const on = filters.cor.includes(c.name)
            return <button key={c.name} onClick={() => toggle("cor", c.name)} title={c.name} className={`relative h-9 w-9 rounded-full transition ${on ? "ring-1 ring-ink ring-offset-2" : "ring-1 ring-transparent hover:ring-ink/30 hover:ring-offset-2"} ${c.value === "#FFFFFF" ? "border border-black/15" : ""}`} style={{ background: c.value }}>{on && <Icon name="check" size={12} className={`absolute inset-0 m-auto ${c.value === "#FFFFFF" || c.value === "#FAF9F6" ? "text-ink" : "text-white"}`}/>}</button>
          })}
        </div>
      </FilterSection>

      <FilterSection title="Disponibilidade" count={filters.disponibilidade.length}>
        <Checkbox label="Pronta Entrega" count={products.filter(p => getTotalStock(p) > 0).length} checked={filters.disponibilidade.includes("pronta-entrega")} onChange={() => toggle("disponibilidade", "pronta-entrega")} />
        <Checkbox label="Mais Vendidos" count={products.filter(p => p.isBestseller).length} checked={filters.disponibilidade.includes("mais-vendidos")} onChange={() => toggle("disponibilidade", "mais-vendidos")} />
        <Checkbox label="Últimas Unidades" checked={filters.disponibilidade.includes("ultimas-unidades")} onChange={() => toggle("disponibilidade", "ultimas-unidades")} />
      </FilterSection>

      {activeCount > 0 && <button onClick={clear} className="mt-6 w-full h-11 border border-ink caps text-[11px] hover:bg-ink hover:text-white transition">Limpar filtros</button>}
    </aside>
  )

  return (
    <>
      <div className="mt-10 grid gap-12 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block sticky top-44 self-start max-h-[calc(100vh-12rem)] overflow-y-auto pr-3 -mr-3">
          {FilterPanel}
        </div>

        <div>
          <div className="flex items-center justify-between gap-6 flex-wrap border-y border-border py-4">
            <div className="flex items-center gap-5">
              <button onClick={() => setMobileFilters(true)} className="lg:hidden flex items-center gap-2 caps text-[11px]"><Icon name="filter" size={14}/> Filtros {activeCount > 0 && <span className="grid place-items-center h-4 min-w-[16px] px-1 bg-ink text-white text-[9px]">{activeCount}</span>}</button>
              <span className="text-[12.5px] text-muted-fg">{filteredProducts.length} produtos</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="hidden sm:flex items-center gap-3 pr-5 border-r border-border">
                <button onClick={() => setView("grid")} className={view === "grid" ? "text-ink" : "text-muted-fg"}><Icon name="grid" size={16}/></button>
                <button onClick={() => setView("list")} className={view === "list" ? "text-ink" : "text-muted-fg"}><Icon name="list" size={16}/></button>
              </div>
              <div className="flex items-center gap-2">
                <span className="caps text-[10.5px] text-muted-fg">Ordenar</span>
                <select value={sort} onChange={e => setSort(e.target.value)} className="caps text-[11px] bg-transparent border-0 outline-none cursor-pointer">
                  {["Relevância", "Menor preço", "Maior preço", "Mais novos", "Mais vendidos"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {activeCount > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              <span className="caps text-[10.5px] text-muted-fg mr-1">Aplicados:</span>
              {q && <button onClick={() => updateSearch("")} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cream text-[11.5px] hover:bg-stone transition">“{q}” <Icon name="x" size={10}/></button>}
              {Object.entries(filters).flatMap(([key, value]) => key === "preco" ? [] : (value as string[]).map(v => <button key={key + v} onClick={() => toggle(key as keyof typeof filters, v)} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cream text-[11.5px] hover:bg-stone transition">{v} <Icon name="x" size={10}/></button>))}
              {(filters.preco[1] !== MAX_PRICE) && <button onClick={() => setPreco([MIN_PRICE, MAX_PRICE])} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cream text-[11.5px] hover:bg-stone transition">até {formatPrice(filters.preco[1])} <Icon name="x" size={10}/></button>}
              <button onClick={clear} className="ml-2 text-[11px] text-muted-fg hover:text-ink underline underline-offset-2">Limpar tudo</button>
            </div>
          )}

          {paginated.length === 0 ? (
            <div className="mt-20 text-center border border-border py-20">
              <p className="font-serif italic font-bold text-[28px]">Nenhuma peça encontrada</p>
              <p className="mt-2 text-[14px] text-muted-fg">Tente remover filtros ou buscar por outro termo.</p>
              <button onClick={clear} className="mt-8 inline-flex items-center gap-3 bg-ink text-white caps text-[11px] px-7 h-12 hover:bg-fg-soft transition">Limpar filtros</button>
            </div>
          ) : (
            <div className={`mt-10 grid gap-x-6 gap-y-14 ${view === "grid" ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-3" : "grid-cols-1"}`}>
              {paginated.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-1">
              {Array.from({ length: totalPages }).slice(0, 6).map((_, idx) => <button key={idx} onClick={() => setPage(idx + 1)} className={`h-10 w-10 caps text-[11px] transition ${effectivePage === idx + 1 ? "bg-ink text-white" : "text-ink hover:bg-cream"}`}>{idx + 1}</button>)}
            </div>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[88%] max-w-[420px] bg-white p-6 overflow-y-auto animate-[slideIn_.35s_ease-out]">
            <div className="flex items-center justify-between mb-4"><h3 className="caps text-[12px]">Filtros</h3><button onClick={() => setMobileFilters(false)}><Icon name="x" size={18}/></button></div>
            {FilterPanel}
            <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-4 mt-6 bg-white border-t border-border"><button onClick={() => setMobileFilters(false)} className="w-full h-12 bg-ink text-white caps text-[11px]">Ver {filteredProducts.length} produtos</button></div>
          </div>
        </div>
      )}
    </>
  )
}
