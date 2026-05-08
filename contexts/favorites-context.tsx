"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Product } from "@/lib/data/products"

type FavoritesContextType = {
  favorites: Product[]
  addFavorite: (product: Product) => void
  removeFavorite: (productId: string) => void
  toggleFavorite: (product: Product) => void
  isFavorite: (productId: string) => boolean
  getFavoritesCount: () => number
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem("fashion-store-favorites")
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch {
        localStorage.removeItem("fashion-store-favorites")
      }
    }
    setIsHydrated(true)
  }, [])

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("fashion-store-favorites", JSON.stringify(favorites))
    }
  }, [favorites, isHydrated])

  const addFavorite = (product: Product) => {
    setFavorites((current) => {
      if (current.some((p) => p.id === product.id)) {
        return current
      }
      return [...current, product]
    })
  }

  const removeFavorite = (productId: string) => {
    setFavorites((current) => current.filter((p) => p.id !== productId))
  }

  const toggleFavorite = (product: Product) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id)
    } else {
      addFavorite(product)
    }
  }

  const isFavorite = (productId: string) => {
    return favorites.some((p) => p.id === productId)
  }

  const getFavoritesCount = () => {
    return favorites.length
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        getFavoritesCount,
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
