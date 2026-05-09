"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Search, Heart, User, ShoppingBag, Menu, X, ChevronRight, MessageCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useAuth } from "@/contexts/auth-context"
import { SearchDialog } from "@/components/search-dialog"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"
import { catalogMenu, navLinks, promoMessages } from "@/lib/navigation/catalog-menu"
import { cn } from "@/lib/utils"

// Use centralized config
const megaMenu = catalogMenu
const promos = promoMessages

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeMega, setActiveMega] = useState<string | null>(null)
  const [promoIdx, setPromoIdx] = useState(0)
  const [mounted, setMounted] = useState(false)
  const megaRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const { getItemCount } = useCart()
  const { getFavoritesCount } = useFavorites()
  const { isAuthenticated } = useAuth()

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const t = setInterval(() => setPromoIdx(i => (i + 1) % promos.length), 4000)
    return () => clearInterval(t)
  }, [])

  const itemCount = mounted ? getItemCount() : 0
  const favCount = mounted ? getFavoritesCount() : 0

  const handleMegaEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveMega(label)
  }
  const handleMegaLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMega(null), 150)
  }

  const activeMegaData = megaMenu.find(m => m.label === activeMega)

  return (
    <>
      {/* ─── Promo Banner ─── */}
      <div className="w-full bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-3 py-1.5 sm:py-2">
          <p className="text-center text-[9px] font-medium tracking-[0.15em] uppercase sm:text-[10px]" key={promoIdx}>
            {promos[promoIdx]}
          </p>
        </div>
      </div>

      {/* ─── Main Header ─── */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/98 backdrop-blur-md" style={{ position: '-webkit-sticky' as unknown as undefined }}>
        {/* Top row: Logo center, icons */}
        <div className="mx-auto flex h-14 max-w-7xl items-center px-3 sm:h-16 sm:px-4">
          {/* Left: Hamburger (mobile) */}
          <div className="flex items-center gap-1 lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-[340px] p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <MobileMenu onClose={() => setMobileOpen(false)} pathname={pathname} />
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 lg:flex-1">
            <Image src="/brand/logo-premium.svg" alt="Fashion Store" width={32} height={32} className="h-7 w-7 sm:h-8 sm:w-8" priority />
            <div className="hidden min-[380px]:block">
              <span className="font-serif text-base font-bold tracking-tight sm:text-lg">Fashion Store</span>
              <span className="ml-1.5 hidden text-[8px] font-medium tracking-[0.15em] text-muted-foreground uppercase sm:inline">Estilo com propósito</span>
            </div>
          </Link>

          {/* Desktop nav (center) */}
          <nav className="hidden lg:flex lg:items-center lg:gap-0.5" ref={megaRef}>
            {megaMenu.map(item => (
              <div key={item.label}
                onMouseEnter={() => handleMegaEnter(item.label)}
                onMouseLeave={handleMegaLeave}
                className="relative"
              >
                <Link href={item.href}
                  className={cn(
                    "flex items-center gap-0.5 px-3 py-2 text-[13px] font-medium transition-colors hover:text-foreground",
                    activeMega === item.label ? "text-foreground" : "text-muted-foreground",
                    pathname === item.href && "text-foreground"
                  )}>
                  {item.label}
                  {item.sections.length > 1 && <ChevronDown className={cn("h-3 w-3 transition-transform", activeMega === item.label && "rotate-180")} />}
                </Link>
              </div>
            ))}
            {navLinks.map(l => (
              <Link key={l.name} href={l.href}
                className={cn("px-3 py-2 text-[13px] font-medium transition-colors hover:text-foreground",
                  pathname === l.href ? "text-foreground" : "text-muted-foreground"
                )}>
                {l.name}
              </Link>
            ))}
          </nav>

          {/* Right: Icons */}
          <div className="flex items-center gap-0.5 sm:gap-1 lg:flex-1 lg:justify-end">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSearchOpen(true)} aria-label="Buscar"><Search className="h-4 w-4" /></Button>

            <Link href="/favoritos">
              <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Favoritos">
                <Heart className="h-4 w-4" />
                {favCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[8px] font-bold text-background">{favCount}</span>}
              </Button>
            </Link>

            <Link href={isAuthenticated ? "/minha-conta" : "/login"} className="hidden sm:block">
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Conta"><User className="h-4 w-4" /></Button>
            </Link>

            <Link href="/sacola">
              <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Sacola">
                <ShoppingBag className="h-4 w-4" />
                {itemCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[8px] font-bold text-background">{itemCount}</span>}
              </Button>
            </Link>

            <a href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Vim pelo site e gostaria de mais informações.")} target="_blank" rel="noopener noreferrer" className="hidden sm:block">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-[#25D366]" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /></Button>
            </a>
          </div>
        </div>

        {/* ─── Mega Menu Dropdown ─── */}
        {activeMegaData && activeMegaData.sections.length > 0 && (
          <div
            className="absolute left-0 right-0 top-full z-50 hidden lg:block"
            onMouseEnter={() => handleMegaEnter(activeMegaData.label)}
            onMouseLeave={handleMegaLeave}
          >
            <div className="border-b border-border/40 bg-background shadow-lg">
              <div className="mx-auto grid max-w-7xl grid-cols-[1fr_240px] gap-8 px-8 py-6">
                {/* Sections */}
                <div className="flex gap-10">
                  {activeMegaData.sections.map(section => (
                    <div key={section.title}>
                      <h3 className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{section.title}</h3>
                      <ul className="space-y-1.5">
                        {section.links.map(link => (
                          <li key={link.name}>
                            <Link href={link.href} onClick={() => setActiveMega(null)}
                              className="text-[13px] text-foreground/80 transition-colors hover:text-foreground">
                              {link.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Featured card */}
                {activeMegaData.featured && (
                  <Link href={activeMegaData.featured.href} onClick={() => setActiveMega(null)}
                    className="group flex flex-col justify-center rounded-xl bg-muted/50 p-5 transition-colors hover:bg-muted">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">{activeMegaData.featured.title}</p>
                    <p className="mt-1 font-serif text-lg font-bold">{activeMegaData.featured.subtitle}</p>
                    <span className="mt-2 flex items-center gap-1 text-xs font-medium text-foreground/70 group-hover:text-foreground">
                      {activeMegaData.featured.cta} <ChevronRight className="h-3 w-3" />
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}

// ─── Mobile Menu ───
function MobileMenu({ onClose, pathname }: { onClose: () => void; pathname: string }) {
  const [expandedMega, setExpandedMega] = useState<string | null>(null)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="font-serif text-base font-bold">Menu</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        <Link href="/" onClick={onClose} className={cn("flex items-center px-5 py-2.5 text-sm font-medium", pathname === "/" && "text-foreground font-semibold")}>Início</Link>

        {megaMenu.map(item => (
          <div key={item.label}>
            <button
              onClick={() => setExpandedMega(expandedMega === item.label ? null : item.label)}
              className={cn("flex w-full items-center justify-between px-5 py-2.5 text-left text-sm font-medium", pathname === item.href && "text-foreground font-semibold")}
            >
              {item.label}
              <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", expandedMega === item.label && "rotate-180")} />
            </button>
            {expandedMega === item.label && (
              <div className="bg-muted/30 py-1">
                {item.sections.map(section => (
                  <div key={section.title} className="px-5 py-1.5">
                    <p className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">{section.title}</p>
                    {section.links.map(link => (
                      <Link key={link.name} href={link.href} onClick={onClose} className="block py-1.5 pl-2 text-[13px] text-foreground/80">
                        {link.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="my-2 border-t" />

        {navLinks.map(l => (
          <Link key={l.name} href={l.href} onClick={onClose}
            className={cn("flex items-center px-5 py-2.5 text-sm font-medium", pathname === l.href && "text-foreground font-semibold")}>
            {l.name}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-4 space-y-2">
        <a href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Vim pelo site.")} target="_blank" rel="noopener noreferrer" className="block">
          <Button className="h-10 w-full gap-2 rounded-full bg-[#25D366] text-white hover:bg-[#1DA851]"><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
        </a>
        <p className="text-center text-[9px] text-muted-foreground">Juiz de Fora/MG · Loja online</p>
      </div>
    </div>
  )
}
