"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

// ===== Tipos =====

/** O que salvamos no localStorage. lastSeenPrice é só snapshot pra aviso visual. */
export type CartRef = {
  productId: string
  variantSku: string
  quantity: number
  /** Snapshot do preço na hora de adicionar — SÓ pra mostrar "preço mudou". NÃO é fonte de verdade. */
  lastSeenPrice?: number
}

/** Dados hidratados via API. Se o produto sumiu, `product` é null. */
export type HydratedCartItem = {
  ref: CartRef
  product: {
    name: string
    slug: string
    price: number
    originalPrice?: number
    image: string
    status: string
  } | null
  variant: {
    colorName: string
    colorHex: string
    size: string
    active: boolean
  } | null
  availableStock: number
  maxQuantity: number
  warnings: string[]
  shouldRemove: boolean
}

type CartContextType = {
  /** Refs crus (o que está salvo no localStorage) */
  refs: CartRef[]
  /** Itens hidratados com dados atuais do servidor */
  items: HydratedCartItem[]
  /** true enquanto hidrata pela primeira vez */
  loading: boolean
  /** Adiciona por productId+variantSku+quantity (não recebe Product) */
  addItem: (productId: string, variantSku: string, quantity?: number, lastSeenPrice?: number) => void
  removeItem: (productId: string, variantSku: string) => void
  updateQuantity: (productId: string, variantSku: string, quantity: number) => void
  clearCart: () => void
  /** Força revalidação dos itens (ex: antes do checkout) */
  revalidate: () => Promise<HydratedCartItem[]>
  getItemCount: () => number
  getSubtotal: () => number
  isInCart: (productId: string, variantSku?: string) => boolean
}

const STORAGE_KEY = "fashion-store-cart-v2"
const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [refs, setRefs] = useState<CartRef[]>([])
  const [items, setItems] = useState<HydratedCartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  // ===== Persistência: load =====
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as CartRef[]
        if (Array.isArray(parsed) && parsed.every(r => r.productId && r.variantSku && typeof r.quantity === "number")) {
          setRefs(parsed)
        }
      }
      // Migração: se existir formato antigo, converter
      const old = localStorage.getItem("fashion-store-cart")
      if (old && !saved) {
        try {
          const oldItems = JSON.parse(old) as Array<{
            product?: { id?: string; sku?: string }
            size?: string
            color?: { name?: string }
            quantity?: number
          }>
          if (Array.isArray(oldItems)) {
            const migrated: CartRef[] = []
            for (const it of oldItems) {
              if (it.product?.id && it.product?.sku && it.size && it.color?.name) {
                const slug = it.color.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toUpperCase()
                const variantSku = `${it.product.sku}-${slug}-${it.size}`
                migrated.push({ productId: it.product.id, variantSku, quantity: it.quantity ?? 1 })
              }
            }
            if (migrated.length > 0) setRefs(migrated)
            localStorage.removeItem("fashion-store-cart")
          }
        } catch { /* ignore old format errors */ }
      }
    } catch { /* corrupted */ }
    setHydrated(true)
  }, [])

  // ===== Persistência: save =====
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(refs))
  }, [refs, hydrated])

  // ===== Hidratação via API =====
  const hydrate = useCallback(async (currentRefs: CartRef[]): Promise<HydratedCartItem[]> => {
    if (currentRefs.length === 0) {
      setItems([])
      setLoading(false)
      return []
    }
    try {
      const res = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: currentRefs }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as {
        items: Array<{
          productId: string
          variantSku: string
          requestedQuantity: number
          product: HydratedCartItem["product"]
          variant: HydratedCartItem["variant"]
          availableStock: number
          maxQuantity: number
          warnings: string[]
          shouldRemove: boolean
        }>
      }
      const hydratedItems: HydratedCartItem[] = data.items.map(d => ({
        ref: { productId: d.productId, variantSku: d.variantSku, quantity: d.requestedQuantity },
        product: d.product,
        variant: d.variant,
        availableStock: d.availableStock,
        maxQuantity: d.maxQuantity,
        warnings: d.warnings,
        shouldRemove: d.shouldRemove,
      }))
      setItems(hydratedItems)
      // Auto-remove itens que devem sair
      const toRemove = hydratedItems.filter(i => i.shouldRemove)
      if (toRemove.length > 0) {
        setRefs(prev => prev.filter(r => !toRemove.some(rm =>
          rm.ref.productId === r.productId && rm.ref.variantSku === r.variantSku
        )))
      }
      // Auto-ajustar quantidades
      const toAdjust = hydratedItems.filter(i => !i.shouldRemove && i.ref.quantity > i.maxQuantity && i.maxQuantity > 0)
      if (toAdjust.length > 0) {
        setRefs(prev => prev.map(r => {
          const adj = toAdjust.find(a => a.ref.productId === r.productId && a.ref.variantSku === r.variantSku)
          return adj ? { ...r, quantity: adj.maxQuantity } : r
        }))
      }
      return hydratedItems
    } catch {
      // Se API falhar (ex: offline), mantém o que temos sem crashar
      setItems(currentRefs.map(r => ({
        ref: r,
        product: null,
        variant: null,
        availableStock: 0,
        maxQuantity: 0,
        warnings: ["Não foi possível validar este item. Tente novamente."],
        shouldRemove: false,
      })))
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Hidrata quando refs mudam
  useEffect(() => {
    if (!hydrated) return
    hydrate(refs)
  }, [refs, hydrated, hydrate])

  // ===== Actions =====
  const addItem = (productId: string, variantSku: string, quantity: number = 1, lastSeenPrice?: number) => {
    setRefs(prev => {
      const idx = prev.findIndex(r => r.productId === productId && r.variantSku === variantSku)
      if (idx >= 0) {
        const next = [...prev]
        const newQty = next[idx].quantity + quantity
        // Clamp: find maxQuantity from hydrated items if available
        const hydrated = items.find(i => i.ref.productId === productId && i.ref.variantSku === variantSku)
        const max = hydrated?.maxQuantity ?? Infinity
        next[idx] = { ...next[idx], quantity: Math.min(newQty, max), lastSeenPrice: lastSeenPrice ?? next[idx].lastSeenPrice }
        return next
      }
      return [...prev, { productId, variantSku, quantity, lastSeenPrice }]
    })
  }

  const removeItem = (productId: string, variantSku: string) => {
    setRefs(prev => prev.filter(r => !(r.productId === productId && r.variantSku === variantSku)))
  }

  const updateQuantity = (productId: string, variantSku: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId, variantSku)
      return
    }
    // Clamp to maxQuantity if hydrated data available
    const hydrated = items.find(i => i.ref.productId === productId && i.ref.variantSku === variantSku)
    const max = hydrated?.maxQuantity ?? Infinity
    const clamped = Math.min(quantity, max)
    setRefs(prev => prev.map(r =>
      r.productId === productId && r.variantSku === variantSku
        ? { ...r, quantity: clamped }
        : r
    ))
  }

  const clearCart = () => setRefs([])

  const revalidate = useCallback(async () => {
    setLoading(true)
    return hydrate(refs)
  }, [refs, hydrate])

  const getItemCount = () => refs.reduce((t, r) => t + r.quantity, 0)

  const getSubtotal = () => items
    .filter(i => !i.shouldRemove && i.product)
    .reduce((t, i) => t + (i.product!.price * i.ref.quantity), 0)

  const isInCart = (productId: string, variantSku?: string) =>
    refs.some(r => r.productId === productId && (variantSku === undefined || r.variantSku === variantSku))

  return (
    <CartContext.Provider value={{
      refs, items, loading,
      addItem, removeItem, updateQuantity, clearCart, revalidate,
      getItemCount, getSubtotal, isInCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
