"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Icon } from "@/components/fashion/Icon"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import { SearchDialog } from "@/components/search-dialog"
import { homeMedia } from "@/lib/home-media"

/* ─── Nav data — Fashion Store cristã multisex ─── */
const NAV = [
  {
    label: "Masculino", key: "masculino", href: "/produtos?categoria=camisetas",
    hero: { title: "Linha Masculina", kicker: "Camisetas cristãs para homens", img: homeMedia.menu.masculino.src },
    tabs: [
      { name: "Comprar", links: [
        { label: "Todas as peças masculinas", href: "/produtos?categoria=camisetas" },
        { label: "Camisetas masculinas", href: "/produtos?categoria=camisetas" },
        { label: "Oversized masculino", href: "/produtos?categoria=oversized" },
        { label: "Pronta entrega", href: "/produtos?categoria=camisetas&destaque=pronta-entrega" },
      ]},
      { name: "Por tamanho", links: [
        { label: "Tamanho P", href: "/produtos?categoria=camisetas&tamanho=P" },
        { label: "Tamanho M", href: "/produtos?categoria=camisetas&tamanho=M" },
        { label: "Tamanho G", href: "/produtos?categoria=camisetas&tamanho=G" },
        { label: "Tamanho GG", href: "/produtos?categoria=camisetas&tamanho=GG" },
      ]},
    ],
  },
  {
    label: "Feminino", key: "feminino", href: "/produtos?categoria=baby-look",
    hero: { title: "Linha Feminina", kicker: "Peças cristãs com leveza e propósito", img: homeMedia.menu.feminino.src },
    tabs: [
      { name: "Comprar", links: [
        { label: "Todas as peças femininas", href: "/produtos?categoria=baby-look" },
        { label: "Camisetas femininas", href: "/produtos?categoria=baby-look" },
        { label: "Lançamentos", href: "/produtos?categoria=lancamentos" },
        { label: "Pronta entrega", href: "/produtos?categoria=baby-look&destaque=pronta-entrega" },
      ]},
      { name: "Por tamanho", links: [
        { label: "Tamanho P", href: "/produtos?categoria=baby-look&tamanho=P" },
        { label: "Tamanho M", href: "/produtos?categoria=baby-look&tamanho=M" },
        { label: "Tamanho G", href: "/produtos?categoria=baby-look&tamanho=G" },
        { label: "Tamanho GG", href: "/produtos?categoria=baby-look&tamanho=GG" },
      ]},
    ],
  },
  {
    label: "Oversized", key: "oversized", href: "/produtos?categoria=oversized",
    hero: { title: "Oversized", kicker: "Modelagem ampla, presença e propósito", img: homeMedia.menu.oversized.src },
    tabs: [
      { name: "Comprar", links: [
        { label: "Todos oversized", href: "/produtos?categoria=oversized" },
        { label: "Masculino", href: "/produtos?categoria=oversized" },
        { label: "Feminino", href: "/produtos?categoria=oversized" },
        { label: "Novidades", href: "/produtos?categoria=lancamentos" },
      ]},
      { name: "Por tamanho", links: [
        { label: "Tamanho P", href: "/produtos?categoria=oversized&tamanho=P" },
        { label: "Tamanho M", href: "/produtos?categoria=oversized&tamanho=M" },
        { label: "Tamanho G", href: "/produtos?categoria=oversized&tamanho=G" },
        { label: "Tamanho GG", href: "/produtos?categoria=oversized&tamanho=GG" },
      ]},
    ],
  },
  {
    label: "Coleções", key: "colecoes", href: "/produtos",
    hero: { title: "Coleções", kicker: "Escolha por mensagem, estilo ou ocasião", img: homeMedia.menu.colecoes.src },
    tabs: [
      { name: "Em Alta", links: [
        { label: "Todos os Produtos", href: "/produtos" },
        { label: "Lançamentos", href: "/produtos?categoria=lancamentos" },
        { label: "Mais Vendidos", href: "/produtos?destaque=mais-vendidos" },
        { label: "Para Presentear", href: "/produtos" },
      ]},
      { name: "Categorias", links: [
        { label: "Masculino", href: "/produtos?categoria=camisetas" },
        { label: "Feminino", href: "/produtos?categoria=baby-look" },
        { label: "Oversized", href: "/produtos?categoria=oversized" },
      ]},
    ],
  },
  { label: "Lançamentos", key: "lancamentos", href: "/produtos?categoria=lancamentos", noMega: true },
  { label: "Promoções", key: "promocoes", href: "/produtos?categoria=promocoes", noMega: true },
  { label: "Pronta Entrega", key: "pronta", href: "/produtos?destaque=pronta-entrega", noMega: true },
  { label: "Sobre", key: "sobre", href: "/quem-somos", noMega: true },
] as const

type NavItem = typeof NAV[number]
type NavWithMega = NavItem & { tabs: { name: string; links: { label: string; href: string }[] }[]; hero: { title: string; kicker: string; img: string } }

function hasMega(n: NavItem): n is NavWithMega {
  return !('noMega' in n && n.noMega)
}

export function FashionHeader({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname()
  const [active, setActive] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const { getItemCount } = useCart()
  const { getFavoritesCount } = useFavorites()

  // Avoid hydration mismatch
  useEffect(() => { setMounted(true) }, [])

  const cartCount = mounted ? getItemCount() : 0
  const favCount = mounted ? getFavoritesCount() : 0

  const openMega = useCallback((key: string) => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = undefined }
    setActive(key)
    setActiveTab(0)
  }, [])
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setActive(null), 120)
  }, [])
  const cancelClose = useCallback(() => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = undefined }
  }, [])

  const current = NAV.find(n => n.key === active)
  const megaCurrent = current && hasMega(current) ? current : null

  const textColor = transparent ? "text-white" : "text-ink"
  const hoverOpacity = transparent ? "opacity-90 hover:opacity-100" : "opacity-80 hover:opacity-100"
  const borderColor = transparent ? "border-white/25" : "border-border"
  const navItemActive = transparent ? "text-white" : "text-ink"
  const navItemDefault = transparent ? "text-white/90 hover:text-white" : "text-ink/85 hover:text-ink"
  const underlineColor = transparent ? "bg-white" : "bg-ink"

  return (
    <>
      <header className={transparent ? "absolute inset-x-0 top-0 z-40 text-white" : `${textColor}`}>
        {/* ─── Top utility row ─── */}
        <div className="mx-auto max-w-[1600px] px-6 pt-4 grid grid-cols-3 items-center sm:px-10 sm:pt-6">
          {/* Socials */}
          <div className="hidden items-center gap-4 sm:flex sm:gap-5">
            {(["facebook","pinterest","instagram","tiktok","linkedin"] as const).map(s => (
              <a key={s} className={`${hoverOpacity} transition cursor-pointer`}>
                <Icon name={s} size={transparent ? 16 : 15}/>
              </a>
            ))}
          </div>
          {/* Wordmark */}
          <Link href="/" className="cursor-pointer text-center select-none col-start-2">
            <span className="font-serif italic font-bold text-[28px] leading-none tracking-tight sm:text-[34px] lg:text-[40px]">
              Fashion<span className="text-[14px] not-italic font-normal align-top ml-0.5 sm:text-[16px] lg:text-[18px]">®</span>
            </span>
          </Link>
          {/* Utilities */}
          <div className="flex items-center justify-end gap-4 sm:gap-5 lg:gap-6">
            <button onClick={() => setSearchOpen(true)} className={`${hoverOpacity} transition`} aria-label="Buscar">
              <Icon name="search" size={transparent ? 19 : 18}/>
            </button>
            <Link href="/login" className={`hidden sm:block ${hoverOpacity} transition`} aria-label="Conta">
              <Icon name="user" size={transparent ? 19 : 18}/>
            </Link>
            <Link href="/favoritos" className={`${hoverOpacity} transition relative`} aria-label="Favoritos">
              <Icon name="heart" size={transparent ? 19 : 18}/>
              {favCount > 0 && (
                <span className={`absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full text-[9px] font-semibold ${transparent ? "bg-white text-ink" : "bg-ink text-white"}`}>{favCount}</span>
              )}
            </Link>
            <Link href="/sacola" className={`relative ${hoverOpacity} transition`} aria-label="Sacola">
              <Icon name="bag" size={transparent ? 19 : 18}/>
              {cartCount > 0 && (
                <span className={`absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full text-[9px] font-semibold ${transparent ? "bg-white text-ink" : "bg-ink text-white"}`}>{cartCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* ─── Main nav row ─── */}
        <nav className="relative mt-3 sm:mt-5">
          <div
            className="mx-auto max-w-[1600px] px-6 h-12 flex items-center justify-center gap-5 overflow-x-auto sm:px-10 sm:h-14 sm:gap-7 lg:gap-9"
            onMouseLeave={scheduleClose}
            onMouseEnter={cancelClose}
          >
            {NAV.map(n => (
              <Link
                key={n.key}
                href={n.href}
                onMouseEnter={() => hasMega(n) ? openMega(n.key) : (setActive(null))}
                className={`group cursor-pointer caps text-[10px] py-4 flex items-center gap-1 shrink-0 transition relative sm:text-[11.5px] lg:text-[12.5px] ${
                  active === n.key ? navItemActive : navItemDefault
                }`}
              >
                <span className="relative">
                  {n.label}
                  <span className={`absolute left-0 right-0 -bottom-1 h-px ${underlineColor} origin-left transition-transform duration-300 ${
                    active === n.key ? "scale-x-100" : "scale-x-0"
                  }`}/>
                </span>
                {hasMega(n) && <Icon name="chevron-down" size={11} className={`transition-transform duration-300 ${active === n.key ? "rotate-180" : ""}`}/>}
              </Link>
            ))}
          </div>

          {/* ─── Mega menu panel ─── */}
          <div
            className={`mega absolute left-0 right-0 top-full overflow-hidden bg-white text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25)] transition-[max-height,opacity] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              megaCurrent ? "max-h-[640px] opacity-100 mega-open" : "max-h-0 opacity-100"
            }`}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            {megaCurrent && (
              <div className="mega-inner mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-1 gap-8 sm:px-10 sm:py-10 lg:grid-cols-[240px_1fr_440px] lg:gap-10">
                {/* Left — category tabs */}
                <div className="hidden lg:block space-y-2">
                  {megaCurrent.tabs.map((t, i) => (
                    <button
                      key={t.name}
                      onMouseEnter={() => setActiveTab(i)}
                      className={`mega-tab w-full flex items-center justify-between px-5 py-4 caps text-[11.5px] transition ${
                        activeTab === i ? "bg-ink text-white" : "bg-cream text-ink hover:bg-stone"
                      }`}
                      style={{ animationDelay: `${60 + i * 40}ms` }}
                    >
                      {t.name}
                      <Icon name="chevron-right" size={12}/>
                    </button>
                  ))}
                </div>
                {/* Middle — links + CTA */}
                <div className="flex flex-col">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                    {megaCurrent.tabs[activeTab].links.map((l, i) => (
                      <Link
                        key={l.label}
                        href={l.href}
                        onClick={() => setActive(null)}
                        className="mega-link cursor-pointer text-[14px] text-ink/85 hover:text-ink hover:translate-x-1 transition-all py-2.5 sm:text-[15px]"
                        style={{ animationDelay: `${120 + i * 30}ms` }}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-auto pt-6 sm:pt-8">
                    <Link
                      href={megaCurrent.href}
                      onClick={() => setActive(null)}
                      className="mega-link inline-flex items-center gap-2 cursor-pointer caps text-[11.5px] text-ink border-b border-ink/20 hover:border-ink pb-1 transition-all group"
                    >
                      Ver Linha Completa
                      <span className="transition-transform duration-300 group-hover:translate-x-1"><Icon name="arrow-right" size={13}/></span>
                    </Link>
                  </div>
                </div>
                {/* Right — featured image */}
                <Link
                  href={megaCurrent.href}
                  onClick={() => setActive(null)}
                  className="mega-feature relative hidden aspect-[5/4] cursor-pointer overflow-hidden group bg-stone lg:block"
                >
                  <Image
                    src={megaCurrent.hero.img}
                    alt={megaCurrent.hero.title}
                    fill
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                    quality={95}
                    sizes="440px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"/>
                  <div className="absolute inset-0 p-7 flex flex-col justify-end items-start gap-3">
                    <span className="caps text-[10px] text-white/85">{megaCurrent.hero.kicker}</span>
                    <h4 className="font-serif italic font-bold text-white text-[28px] leading-none">{megaCurrent.hero.title}</h4>
                    <span className="mt-2 bg-white px-5 py-2.5 caps text-[10px] text-ink hover:bg-cream transition">Linha Completa</span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
