"use client"

import Link from "next/link"
import { FashionHeader } from "@/components/fashion/Header"
import { FashionFooter } from "@/components/fashion/Footer"
import { Icon } from "@/components/fashion/Icon"
import { ProductCard } from "@/components/product-card"
import { useFavorites } from "@/contexts/favorites-context"

export default function FavoritesPage() {
  const { favorites } = useFavorites()

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 bg-white border-b border-[var(--border)]">
        <FashionHeader />
      </div>
      <main className="min-h-dvh pt-36 pb-24 bg-white">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
          <div className="text-[11px] caps tracking-[0.22em] text-[var(--muted-foreground)]">Fashion Store / Minha Lista</div>
          <div className="mt-4 flex items-end justify-between flex-wrap gap-6">
            <div>
              <h1 className="font-serif italic font-bold text-[32px] leading-none sm:text-[42px] lg:text-[52px]">Lista de Desejos</h1>
              <p className="mt-3 text-[13px] text-[var(--muted-foreground)] sm:text-[14px]">
                {favorites.length} {favorites.length === 1 ? "peça salva" : "peças salvas"}
              </p>
            </div>
          </div>

          {favorites.length === 0 ? (
            <div className="mt-20 text-center sm:mt-24">
              <div className="inline-grid h-14 w-14 place-items-center bg-[var(--cream)] rounded-full mx-auto sm:h-16 sm:w-16">
                <Icon name="heart" size={22}/>
              </div>
              <p className="mt-5 font-serif italic font-bold text-[22px] sm:mt-6 sm:text-[28px]">Sua lista está vazia</p>
              <p className="mt-2 text-[13px] text-[var(--muted-foreground)] max-w-md mx-auto sm:text-[14px]">
                Salve as peças favoritas tocando no ❤ — assim você acessa rapidamente em uma próxima visita.
              </p>
              <Link
                href="/produtos"
                className="mt-6 inline-flex items-center gap-3 bg-[var(--ink)] text-white caps text-[10px] px-6 h-11 hover:bg-[var(--fg-soft)] transition sm:mt-8 sm:text-[11px] sm:px-7 sm:h-12"
              >
                Explorar Catálogo <Icon name="arrow-right" size={13}/>
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:mt-12 sm:gap-x-6 sm:gap-y-14 md:grid-cols-3 lg:grid-cols-4">
              {favorites.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>
      <FashionFooter />
    </>
  )
}
