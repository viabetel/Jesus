"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Product, ProductColor, ProductSize } from "@/lib/data/products"

export type CartItem = {
  product: Product
  size: ProductSize
  color: ProductColor
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (product: Product, size: ProductSize, color: ProductColor, quantity?: number) => void
  removeItem: (productId: string, size: ProductSize, colorName: string) => void
  updateQuantity: (productId: string, size: ProductSize, colorName: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
  isInCart: (productId: string, size?: ProductSize, colorName?: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("fashion-store-cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch {
        localStorage.removeItem("fashion-store-cart")
      }
    }
    setIsHydrated(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("fashion-store-cart", JSON.stringify(items))
    }
  }, [items, isHydrated])

  const addItem = (
    product: Product,
    size: ProductSize,
    color: ProductColor,
    quantity: number = 1
  ) => {
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.size === size &&
          item.color.name === color.name
      )

      if (existingIndex > -1) {
        const newItems = [...currentItems]
        newItems[existingIndex].quantity += quantity
        return newItems
      }

      return [...currentItems, { product, size, color, quantity }]
    })
  }

  const removeItem = (productId: string, size: ProductSize, colorName: string) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.size === size &&
            item.color.name === colorName
          )
      )
    )
  }

  const updateQuantity = (
    productId: string,
    size: ProductSize,
    colorName: string,
    quantity: number
  ) => {
    if (quantity < 1) {
      removeItem(productId, size, colorName)
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId &&
        item.size === size &&
        item.color.name === colorName
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getSubtotal = () => {
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    )
  }

  const isInCart = (productId: string, size?: ProductSize, colorName?: string) => {
    return items.some(
      (item) =>
        item.product.id === productId &&
        (size === undefined || item.size === size) &&
        (colorName === undefined || item.color.name === colorName)
    )
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
