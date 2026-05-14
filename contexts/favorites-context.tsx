"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import { useAuth } from "@/contexts/auth-context"
import type { Product } from "@/lib/data/products"

type FavoritesContextType = {
  favorites: Product[]
  favoriteIds: Set<string>
  toggleFavorite: (product: Product) => void
  isFavorite: (productId: string) => boolean
  getFavoritesCount: () => number
  /** true = precisa logar para favoritar */
  requiresLogin: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isHydrated } = useAuth()
  const [favorites, setFavorites] = useState<Product[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  // Load favorites from Supabase when user changes
  useEffect(() => {
    if (!isHydrated) return
    if (!isAuthenticated || !user) {
      setFavorites([])
      setFavoriteIds(new Set())
      return
    }

    loadFavorites(user.id)
  }, [isAuthenticated, user, isHydrated])

  const loadFavorites = async (userId: string) => {
    const sb = getSupabaseBrowser()
    if (!sb) return

    try {
      const { data, error } = await sb
        .from("customer_favorites")
        .select("product_id")
        .eq("user_id", userId)

      if (error) {
        console.error("[Favorites] Load error:", error)
        return
      }

      const ids = new Set((data || []).map((r: any) => String(r.product_id)))
      setFavoriteIds(ids)

      // Fetch product data for the favorites
      if (ids.size > 0) {
        try {
          const res = await fetch(`/api/products?ids=${Array.from(ids).join(",")}`)
          if (res.ok) {
            const products = await res.json()
            setFavorites(Array.isArray(products) ? products : [])
          }
        } catch { /* products will be fetched on page load */ }
      }
    } catch (e) {
      console.error("[Favorites] Exception:", e)
    }
  }

  const toggleFavorite = useCallback((product: Product) => {
    if (!isAuthenticated || !user) return

    const sb = getSupabaseBrowser()
    if (!sb) return

    const isFav = favoriteIds.has(product.id)

    if (isFav) {
      // Remove
      setFavoriteIds(prev => { const n = new Set(prev); n.delete(product.id); return n })
      setFavorites(prev => prev.filter(p => p.id !== product.id))
      sb.from("customer_favorites").delete()
        .eq("user_id", user.id).eq("product_id", product.id)
        .then(({ error }) => { if (error) console.error("[Favorites] Delete error:", error) })
    } else {
      // Add
      setFavoriteIds(prev => new Set(prev).add(product.id))
      setFavorites(prev => [...prev, product])
      sb.from("customer_favorites").insert({
        user_id: user.id,
        product_id: product.id,
      }).then(({ error }) => { if (error) console.error("[Favorites] Insert error:", error) })
    }
  }, [isAuthenticated, user, favoriteIds])

  const isFavorite = useCallback((productId: string) => favoriteIds.has(productId), [favoriteIds])
  const getFavoritesCount = useCallback(() => favoriteIds.size, [favoriteIds])

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        toggleFavorite,
        isFavorite,
        getFavoritesCount,
        requiresLogin: !isAuthenticated,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
