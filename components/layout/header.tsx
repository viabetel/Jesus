"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Heart, User, ShoppingBag, Menu, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/contexts/cart-context"
import { useFavorites } from "@/contexts/favorites-context"
import { useAuth } from "@/contexts/auth-context"
import { SearchDialog } from "@/components/search-dialog"
import { WHATSAPP_NUMBER, createWhatsAppLink, STORE_TAGLINE } from "@/lib/whatsapp"

const navigation = [
  { name: "Início", href: "/" },
  { name: "Produtos", href: "/produtos" },
  { name: "Guia de Medidas", href: "/guia-de-medidas" },
  { name: "Quem Somos", href: "/quem-somos" },
  { name: "Contato", href: "/contato" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { getItemCount } = useCart()
  const { getFavoritesCount } = useFavorites()
  const { isAuthenticated } = useAuth()

  useEffect(() => setMounted(true), [])
  const itemCount = mounted ? getItemCount() : 0
  const favCount = mounted ? getFavoritesCount() : 0

  return (
    <>
      {/* Top Bar */}
      <div className="w-full bg-[#1a1a1a] text-[#FAF9F6]">
        <div className="mx-auto max-w-7xl px-3 py-2">
          <p className="text-center text-[10px] font-medium tracking-[0.1em] uppercase sm:text-[11px] sm:tracking-[0.15em]">
            Loja online · WhatsApp · Juiz de Fora/MG
          </p>
        </div>
      </div>

      {/* Main Header — -webkit-sticky for Safari */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm" style={{ position: '-webkit-sticky' as any }}>
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:h-16 sm:px-4">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-10 w-10 touch-target" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80vw] max-w-[320px]">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex flex-col gap-5 pt-4">
                  <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
                    <Image src="/brand/logo-dark.png" alt="Fashion Store" width={40} height={40} className="h-10 w-10 object-contain" />
                    <div>
                      <span className="font-serif text-base font-semibold">Fashion Store</span>
                      <span className="block text-[9px] tracking-widest text-muted-foreground uppercase">{STORE_TAGLINE}</span>
                    </div>
                  </Link>
                  <div className="h-px bg-border" />
                  <nav className="flex flex-col gap-0.5">
                    {navigation.map((item) => (
                      <Link key={item.name} href={item.href} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted active:bg-muted" onClick={() => setIsOpen(false)}>
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="h-px bg-border" />
                  <div className="flex flex-col gap-0.5">
                    <Link href="/favoritos" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-muted" onClick={() => setIsOpen(false)}>
                      <Heart className="h-4 w-4" /> Favoritos {favCount > 0 && `(${favCount})`}
                    </Link>
                    <Link href={isAuthenticated ? "/minha-conta" : "/login"} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-muted" onClick={() => setIsOpen(false)}>
                      <User className="h-4 w-4" /> {isAuthenticated ? "Minha Conta" : "Entrar"}
                    </Link>
                    <Link href="/sacola" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-muted" onClick={() => setIsOpen(false)}>
                      <ShoppingBag className="h-4 w-4" /> Sacola {itemCount > 0 && `(${itemCount})`}
                    </Link>
                  </div>
                  <a href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Vim pelo site da Fashion Store.")} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-white active:bg-[#1DA851]">
                    <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
                  </a>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <Image src="/brand/logo-dark.png" alt="Fashion Store" width={36} height={36} className="h-9 w-9 object-contain sm:h-10 sm:w-10" priority />
              <span className="hidden font-serif text-base font-semibold tracking-tight sm:block lg:text-lg">Fashion Store</span>
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden lg:flex lg:items-center lg:gap-7">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} className="text-[13px] font-medium tracking-wide uppercase text-foreground/80 transition-colors hover:text-foreground">
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="h-10 w-10 touch-target" aria-label="Buscar">
              <Search className="h-[18px] w-[18px]" />
            </Button>
            <Link href="/sacola">
              <Button variant="ghost" size="icon" className="relative h-10 w-10 touch-target" aria-label="Sacola">
                <ShoppingBag className="h-[18px] w-[18px]" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background">{itemCount > 9 ? '9+' : itemCount}</span>
                )}
              </Button>
            </Link>
            <Link href={isAuthenticated ? "/minha-conta" : "/login"} className="hidden sm:inline-flex">
              <Button variant="ghost" size="icon" className="h-10 w-10 touch-target" aria-label="Conta">
                <User className="h-[18px] w-[18px]" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
