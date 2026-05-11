"use client"

import Link from "next/link"
import { Heart, ShoppingBag } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/contexts/favorites-context"

export default function FavoritesPage() {
  const { favorites } = useFavorites()

  return (
    <>
      <Header />
      <main className="min-h-dvh py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="mb-2 font-serif text-3xl font-bold">Meus Favoritos</h1>

          {favorites.length > 0 ? (
            <>
              <p className="mb-8 text-sm text-muted-foreground">
                {favorites.length}{" "}
                {favorites.length === 1 ? "item favoritado" : "itens favoritados"}
              </p>
              <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {favorites.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/60">
                <Heart className="h-9 w-9 text-muted-foreground/60" />
              </div>
              <h2 className="mt-6 font-serif text-xl font-semibold">
                Nenhum favorito ainda
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Favorite produtos para encontrá-los facilmente depois.
              </p>
              <Link href="/produtos" className="mt-8">
                <Button className="gap-2 rounded-full px-8">
                  <ShoppingBag className="h-4 w-4" />
                  Ver produtos
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
