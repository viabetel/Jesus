"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Product, ProductColor, ProductSize } from "@/lib/data/products"
import { getVariantStock } from "@/lib/data/products"

export type CartItem = {
  product: Product
  size: ProductSize
  color: ProductColor
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (product: Product, size: ProductSize, color: ProductColor, quantity?: number) => boolean
  removeItem: (productId: string, size: ProductSize, colorName: string) => void
  updateQuantity: (productId: string, size: ProductSize, colorName: string, quantity: number) => boolean
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
  isInCart: (productId: string, size?: ProductSize, colorName?: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("fashion-store-cart")
    if (saved) { try { setItems(JSON.parse(saved)) } catch { localStorage.removeItem("fashion-store-cart") } }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) localStorage.setItem("fashion-store-cart", JSON.stringify(items))
  }, [items, isHydrated])

  const addItem = (product: Product, size: ProductSize, color: ProductColor, quantity: number = 1): boolean => {
    // Validate variant exists and has stock
    const variantStock = getVariantStock(product, color.name, size)
    if (variantStock === 0) return false

    let success = true
    setItems((curr) => {
      const idx = curr.findIndex(i => i.product.id === product.id && i.size === size && i.color.name === color.name)
      if (idx > -1) {
        const newQty = curr[idx].quantity + quantity
        if (newQty > variantStock) { success = false; return curr }
        const next = [...curr]
        next[idx] = { ...next[idx], quantity: newQty }
        return next
      }
      if (quantity > variantStock) { success = false; return curr }
      return [...curr, { product, size, color, quantity }]
    })
    return success
  }

  const removeItem = (productId: string, size: ProductSize, colorName: string) => {
    setItems(curr => curr.filter(i => !(i.product.id === productId && i.size === size && i.color.name === colorName)))
  }

  const updateQuantity = (productId: string, size: ProductSize, colorName: string, quantity: number): boolean => {
    if (quantity < 1) { removeItem(productId, size, colorName); return true }
    let success = true
    setItems(curr => curr.map(i => {
      if (i.product.id === productId && i.size === size && i.color.name === colorName) {
        const stock = getVariantStock(i.product, colorName, size)
        if (quantity > stock) { success = false; return i }
        return { ...i, quantity }
      }
      return i
    }))
    return success
  }

  const clearCart = () => setItems([])
  const getItemCount = () => items.reduce((t, i) => t + i.quantity, 0)
  const getSubtotal = () => items.reduce((t, i) => t + i.product.price * i.quantity, 0)
  const isInCart = (pid: string, size?: ProductSize, colorName?: string) =>
    items.some(i => i.product.id === pid && (size === undefined || i.size === size) && (colorName === undefined || i.color.name === colorName))

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, getItemCount, getSubtotal, isInCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within a CartProvider")
  return ctx
}
