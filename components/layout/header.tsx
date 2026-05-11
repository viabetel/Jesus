"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Search, Heart, User, ShoppingBag, Menu, X,
  ChevronRight, ChevronDown, MessageCircle,
  Ruler, Package, Sparkles, Tag, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useAuth } from "@/contexts/auth-context"
import { SearchDialog } from "@/components/search-dialog"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"
import {
  catalogMenu,
  navLinks,
  promoMessages,
  mobileMenuGroups,
  type MegaMenuFeatured,
} from "@/lib/navigation/catalog-menu"
import { cn } from "@/lib/utils"

/* ─── Gradient fallbacks when images aren't available ─── */
const GRADIENTS: Record<string, string> = {
  "Camisetas":      "from-stone-800 via-stone-700 to-stone-900",
  "Oversized":      "from-zinc-900 via-neutral-800 to-zinc-900",
  "Baby Look":      "from-rose-50 via-amber-50 to-stone-100",
  "Coleções":       "from-amber-50 via-orange-50 to-stone-100",
  "Promoções":      "from-red-900 via-red-800 to-stone-900",
  "Pronta Entrega": "from-emerald-900 via-emerald-800 to-stone-900",
}
const LIGHT_BG = new Set(["Baby Look", "Coleções"])

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeMega, setActiveMega] = useState<string | null>(null)
  const [promoIdx, setPromoIdx] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const megaTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const { getItemCount } = useCart()
  const { getFavoritesCount } = useFavorites()
  const { isAuthenticated } = useAuth()

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const t = setInterval(() => setPromoIdx(i => (i + 1) % promoMessages.length), 4000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", h, { passive: true })
    return () => window.removeEventListener("scroll", h)
  }, [])

  const itemCount = mounted ? getItemCount() : 0
  const favCount = mounted ? getFavoritesCount() : 0

  const openMega = useCallback((label: string) => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current)
    setActiveMega(label)
  }, [])
  const closeMega = useCallback(() => {
    megaTimeout.current = setTimeout(() => setActiveMega(null), 220)
  }, [])

  const activeMegaData = catalogMenu.find(m => m.label === activeMega)

  return (
    <>
      {/* ═══ PROMO BAR ═══ */}
      <div className="w-full bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-2">
          <p className="text-center text-[10px] font-medium tracking-[0.18em] uppercase sm:text-[11px]" key={promoIdx}>
            {promoMessages[promoIdx]}
          </p>
        </div>
      </div>

      {/* ═══ HEADER ═══ */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full bg-background/98 backdrop-blur-md transition-shadow duration-300",
          scrolled && !activeMega ? "shadow-[0_1px_10px_rgba(0,0,0,0.05)]" : "shadow-none"
        )}
        style={{ position: '-webkit-sticky' as unknown as undefined }}
      >
        <div className="border-b border-border/30">
          <div className="mx-auto flex h-[56px] max-w-7xl items-center gap-2 px-4 sm:h-[62px] lg:px-6">

            {/* Mobile hamburger */}
            <div className="lg:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 -ml-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[88vw] max-w-[360px] p-0">
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <MobileDrawer onClose={() => setMobileOpen(false)} pathname={pathname} />
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 lg:mr-6">
              <Image src="/brand/logo-dark.svg" alt="Fashion Store" width={32} height={32} className="h-7 w-7 sm:h-8 sm:w-8" priority />
              <span className="hidden text-[15px] font-bold tracking-tight min-[400px]:block lg:text-base" style={{ fontFamily: "var(--font-serif)" }}>
                Fashion Store
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex lg:items-center lg:gap-0">
              {catalogMenu.map(item => (
                <div
                  key={item.label}
                  onMouseEnter={() => openMega(item.label)}
                  onMouseLeave={closeMega}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-1 px-3 py-2 text-[13px] font-semibold transition-colors duration-150",
                      activeMega === item.label ? "text-foreground" : "text-foreground/55 hover:text-foreground",
                      pathname === item.href && "text-foreground",
                      item.highlight === "promo" && "text-red-600/80 hover:text-red-600",
                      item.highlight === "fast" && "text-emerald-700/80 hover:text-emerald-700",
                    )}
                  >
                    {item.highlight === "promo" && <Tag className="h-3 w-3" />}
                    {item.highlight === "fast" && <Zap className="h-3 w-3" />}
                    {item.label}
                    {item.sections.length > 0 && (
                      <ChevronDown className={cn("h-3 w-3 opacity-40 transition-transform duration-200", activeMega === item.label && "rotate-180 opacity-70")} />
                    )}
                    {activeMega === item.label && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-foreground" />
                    )}
                  </Link>
                </div>
              ))}
              {navLinks.map(l => (
                <Link key={l.name} href={l.href}
                  className={cn("px-2.5 py-2 text-[13px] font-medium transition-colors", pathname === l.href ? "text-foreground" : "text-foreground/45 hover:text-foreground")}>
                  {l.name}
                </Link>
              ))}
            </nav>

            <div className="flex-1" />

            {/* Desktop search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-4 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-muted/70 lg:flex"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Buscar produtos...</span>
              <kbd className="ml-4 rounded border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60">⌘K</kbd>
            </button>

            {/* Icons */}
            <div className="flex items-center gap-0">
              {/* Mobile search */}
              <Button variant="ghost" size="icon" className="h-10 w-10 lg:hidden" onClick={() => setSearchOpen(true)} aria-label="Buscar">
                <Search className="h-[18px] w-[18px]" />
              </Button>

              <Link href="/favoritos">
                <Button variant="ghost" size="icon" className="relative h-10 w-10" aria-label="Favoritos">
                  <Heart className="h-[18px] w-[18px]" />
                  {favCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background">{favCount}</span>}
                </Button>
              </Link>

              <Link href={isAuthenticated ? "/minha-conta" : "/login"} className="hidden sm:block">
                <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Conta"><User className="h-[18px] w-[18px]" /></Button>
              </Link>

              <Link href="/sacola">
                <Button variant="ghost" size="icon" className="relative h-10 w-10" aria-label="Sacola">
                  <ShoppingBag className="h-[18px] w-[18px]" />
                  {itemCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background">{itemCount}</span>}
                </Button>
              </Link>

              {/* Desktop WhatsApp with label */}
              <a href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Vim pelo site e gostaria de mais informações.")} target="_blank" rel="noopener noreferrer"
                className="ml-1.5 hidden items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#1DA851] lg:flex">
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* ═══ MEGA MENU PANEL ═══ */}
        {activeMegaData && activeMegaData.sections.length > 0 && (
          <div
            className="absolute left-0 right-0 top-full z-50 hidden lg:block"
            onMouseEnter={() => openMega(activeMegaData.label)}
            onMouseLeave={closeMega}
          >
            <div className="fixed inset-0 top-0 -z-10 bg-black/15" onClick={() => setActiveMega(null)} />
            <div className="border-b border-border/40 bg-background shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-[340px_1fr] gap-10 py-8">

                  {/* Featured card */}
                  {activeMegaData.featured && (
                    <FeaturedCard
                      featured={activeMegaData.featured}
                      label={activeMegaData.label}
                      onClose={() => setActiveMega(null)}
                    />
                  )}

                  {/* Link sections + quick actions */}
                  <div className="flex gap-10 py-1">
                    {activeMegaData.sections.map(section => (
                      <div key={section.title} className="min-w-[150px]">
                        <h3 className="mb-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/35">
                          {section.title}
                        </h3>
                        <ul className="space-y-0.5">
                          {section.links.map(link => (
                            <li key={link.name}>
                              <Link href={link.href} onClick={() => setActiveMega(null)}
                                className="group/link flex items-center gap-2 rounded-lg px-2.5 py-[7px] -ml-2.5 text-[13px] font-medium text-foreground/65 transition-all hover:bg-muted/50 hover:text-foreground">
                                {link.name}
                                {link.badge && (
                                  <span className="rounded bg-foreground px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-background">{link.badge}</span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {/* Quick actions — right side */}
                    <div className="ml-auto min-w-[155px] border-l border-border/25 pl-8">
                      <h3 className="mb-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/35">Acesso rápido</h3>
                      <ul className="space-y-0.5">
                        {[
                          { icon: Sparkles, label: "Mais vendidos", href: "/produtos?destaque=mais-vendidos", color: "text-amber-500" },
                          { icon: Package, label: "Pronta entrega", href: "/produtos?destaque=pronta-entrega", color: "text-emerald-600" },
                          { icon: Ruler, label: "Guia de medidas", href: "/guia-de-medidas", color: "text-blue-500" },
                          { icon: MessageCircle, label: "WhatsApp", href: createWhatsAppLink(WHATSAPP_NUMBER, "Olá!"), color: "text-[#25D366]", external: true },
                        ].map(item => {
                          const Icon = item.icon
                          const Comp = item.external ? "a" : Link
                          const extra = item.external ? { target: "_blank", rel: "noopener noreferrer" } : {}
                          return (
                            <li key={item.label}>
                              <Comp href={item.href} onClick={() => setActiveMega(null)} {...extra as Record<string, string>}
                                className="flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] -ml-2.5 text-[13px] font-medium text-foreground/65 transition-all hover:bg-muted/50 hover:text-foreground">
                                <Icon className={cn("h-3.5 w-3.5", item.color)} />
                                {item.label}
                              </Comp>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}

/* ═══ Featured Card ═══ */
function FeaturedCard({ featured, label, onClose }: { featured: MegaMenuFeatured; label: string; onClose: () => void }) {
  const [imgErr, setImgErr] = useState(false)
  const gradient = GRADIENTS[label] || "from-stone-800 to-stone-900"
  const light = LIGHT_BG.has(label)
  const hasImg = !imgErr && featured.image

  return (
    <Link href={featured.href} onClick={onClose} className="group relative block overflow-hidden rounded-2xl" style={{ minHeight: 340 }}>
      {hasImg ? (
        <Image src={featured.image} alt={featured.title} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" sizes="340px" onError={() => setImgErr(true)} />
      ) : (
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)}>
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: "radial-gradient(circle at 25% 75%, white 1px, transparent 1px), radial-gradient(circle at 75% 25%, white 0.5px, transparent 0.5px)",
            backgroundSize: "50px 50px, 35px 35px",
          }} />
        </div>
      )}
      {!light && <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />}
      {light && <div className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-transparent" />}

      <div className={cn("relative flex h-full min-h-[340px] flex-col justify-end p-6", light ? "text-foreground" : "text-white")}>
        {featured.eyebrow && (
          <span className={cn("mb-2.5 inline-flex self-start rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em]",
            light ? "bg-foreground/8 text-foreground/65" : "bg-white/15 text-white/85 backdrop-blur-sm")}>
            {featured.eyebrow}
          </span>
        )}
        <h4 className="text-[19px] font-bold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>{featured.title}</h4>
        <p className={cn("mt-1.5 text-[12.5px] leading-relaxed", light ? "text-foreground/55" : "text-white/65")}>{featured.subtitle}</p>
        <span className={cn("mt-5 inline-flex items-center gap-1.5 self-start rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-300",
          light ? "bg-foreground text-background group-hover:bg-foreground/90" : "bg-white text-foreground group-hover:bg-white/95")}>
          {featured.cta}
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

/* ═══ Mobile Drawer ═══ */
function MobileDrawer({ onClose, pathname }: { onClose: () => void; pathname: string }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
        <div className="flex items-center gap-2">
          <Image src="/brand/logo-dark.svg" alt="Fashion Store" width={26} height={26} className="h-6 w-6" />
          <span className="text-[14px] font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>Fashion Store</span>
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9 -mr-2" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>

      <div className="border-b border-border/20 px-4 py-3">
        <button onClick={() => { onClose(); setTimeout(() => document.querySelector<HTMLButtonElement>('[aria-label="Buscar"]')?.click(), 150) }}
          className="flex w-full items-center gap-3 rounded-xl bg-muted/40 px-4 py-3 text-[13px] text-muted-foreground transition-colors hover:bg-muted/60">
          <Search className="h-4 w-4" />Buscar produtos...
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <Link href="/" onClick={onClose} className={cn("flex items-center px-5 py-3 text-[14px] font-semibold", pathname === "/" ? "text-foreground" : "text-foreground/65")}>Início</Link>
        <div className="mx-5 border-t border-border/20" />

        {mobileMenuGroups.map(group => (
          <div key={group.title}>
            <div className="px-5 pt-5 pb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/30">{group.title}</span>
            </div>
            {group.items.map(item => {
              const megaEntry = catalogMenu.find(m => m.href === item.href)
              const hasSub = megaEntry && megaEntry.sections.length > 0
              const isExp = expanded === item.name

              if (!hasSub) return (
                <Link key={item.name} href={item.href} onClick={onClose}
                  className="flex items-center justify-between px-5 py-3 text-[14px] font-medium text-foreground/65 transition-colors">
                  {item.name}<ChevronRight className="h-3.5 w-3.5 text-foreground/25" />
                </Link>
              )

              return (
                <div key={item.name}>
                  <button onClick={() => setExpanded(isExp ? null : item.name)}
                    className="flex w-full items-center justify-between px-5 py-3 text-left text-[14px] font-medium text-foreground/65">
                    {item.name}
                    <ChevronDown className={cn("h-3.5 w-3.5 text-foreground/25 transition-transform duration-200", isExp && "rotate-180")} />
                  </button>
                  {isExp && megaEntry && (
                    <div className="bg-muted/25 pb-2">
                      <Link href={megaEntry.href} onClick={onClose} className="flex items-center gap-1.5 px-7 py-2.5 text-[13px] font-semibold text-foreground/75">
                        Ver todos<ChevronRight className="h-3 w-3" />
                      </Link>
                      {megaEntry.sections.map(s => (
                        <div key={s.title} className="px-7 py-1">
                          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-foreground/25">{s.title}</p>
                          {s.links.map(l => (
                            <Link key={l.name} href={l.href} onClick={onClose}
                              className="flex items-center gap-2 py-2 text-[13px] text-foreground/60 hover:text-foreground">
                              {l.name}
                              {l.badge && <span className="rounded bg-foreground px-1.5 py-px text-[7px] font-bold uppercase text-background">{l.badge}</span>}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        <div className="mx-5 mt-2 border-t border-border/20" />
        {navLinks.map(l => (
          <Link key={l.name} href={l.href} onClick={onClose}
            className="flex items-center justify-between px-5 py-3 text-[14px] font-medium text-foreground/65">
            {l.name}<ChevronRight className="h-3.5 w-3.5 text-foreground/25" />
          </Link>
        ))}
        <div className="mx-5 border-t border-border/20" />
        <Link href="/login" onClick={onClose} className="flex items-center gap-3 px-5 py-3 text-[14px] font-medium text-foreground/65">
          <User className="h-4 w-4" />Minha conta
        </Link>
      </nav>

      <div className="border-t border-border/30 p-4 space-y-2.5 safe-bottom">
        <a href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Vim pelo site.")} target="_blank" rel="noopener noreferrer" className="block">
          <Button className="h-12 w-full gap-2 rounded-xl bg-[#25D366] text-[13px] font-bold text-white shadow-md hover:bg-[#1DA851]">
            <MessageCircle className="h-4 w-4" />Falar no WhatsApp
          </Button>
        </a>
        <p className="text-center text-[10px] text-foreground/25">Juiz de Fora/MG · Loja online</p>
      </div>
    </div>
  )
}
