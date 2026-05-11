"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

export type User = {
  id: string
  name: string
  email: string
  whatsapp: string
  address?: string
  preferredSize?: string
}

export type Order = {
  id: string
  orderNumber: string
  date: string
  items: {
    productName: string
    size: string
    color: string
    quantity: number
    price: number
  }[]
  total: number
  status: "Enviado para atendimento" | "Em confirmação" | "Confirmado" | "Cancelado" | "Entregue"
  address?: string
  observation?: string
}

type AuthContextType = {
  user: User | null
  orders: Order[]
  isAuthenticated: boolean
  isHydrated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (data: {
    name: string
    email: string
    whatsapp: string
    password: string
  }) => Promise<boolean>
  logout: () => void
  updateUser: (data: Partial<User>) => void
  addOrder: (order: Omit<Order, "id" | "orderNumber" | "date" | "status">) => Order
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEYS = {
  user: "fashion-store-user",
  users: "fashion-store-users",
  orders: "fashion-store-orders",
  orderCounter: "fashion-store-order-counter",
} as const

/**
 * Basic password encoding — NOT cryptographic.
 * For MVP only. Replace with Supabase Auth / bcrypt for production.
 */
function encodePassword(password: string): string {
  return btoa(encodeURIComponent(password))
}

function decodePassword(encoded: string): string {
  try {
    return decodeURIComponent(atob(encoded))
  } catch {
    return encoded // fallback for legacy plaintext passwords
  }
}

function safeGetItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

function safeSetItem(key: string, value: unknown): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage might be full or blocked
  }
}

function generateOrderNumber(): string {
  const counter = safeGetItem<number>(STORAGE_KEYS.orderCounter, 0) + 1
  safeSetItem(STORAGE_KEYS.orderCounter, counter)
  return `FS-${counter.toString().padStart(4, "0")}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setUser(safeGetItem<User | null>(STORAGE_KEYS.user, null))
    setOrders(safeGetItem<Order[]>(STORAGE_KEYS.orders, []))
    setIsHydrated(true)
  }, [])

  // Persist user
  useEffect(() => {
    if (!isHydrated) return
    if (user) {
      safeSetItem(STORAGE_KEYS.user, user)
    } else {
      localStorage.removeItem(STORAGE_KEYS.user)
    }
  }, [user, isHydrated])

  // Persist orders
  useEffect(() => {
    if (!isHydrated) return
    safeSetItem(STORAGE_KEYS.orders, orders)
  }, [orders, isHydrated])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const users = safeGetItem<(User & { password: string })[]>(STORAGE_KEYS.users, [])
    const encoded = encodePassword(password)
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() &&
             (u.password === encoded || u.password === password) // support legacy plaintext
    )
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      return true
    }
    return false
  }, [])

  const register = useCallback(async (data: {
    name: string
    email: string
    whatsapp: string
    password: string
  }): Promise<boolean> => {
    const users = safeGetItem<(User & { password: string })[]>(STORAGE_KEYS.users, [])

    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return false
    }

    const newUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      whatsapp: data.whatsapp,
      password: encodePassword(data.password),
    }

    users.push(newUser)
    safeSetItem(STORAGE_KEYS.users, users)

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...data }

      // Also update in users list
      const users = safeGetItem<(User & { password: string })[]>(STORAGE_KEYS.users, [])
      const idx = users.findIndex((u) => u.id === prev.id)
      if (idx > -1) {
        users[idx] = { ...users[idx], ...data }
        safeSetItem(STORAGE_KEYS.users, users)
      }

      return updated
    })
  }, [])

  const addOrder = useCallback((orderData: Omit<Order, "id" | "orderNumber" | "date" | "status">): Order => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      orderNumber: generateOrderNumber(),
      date: new Date().toISOString(),
      status: "Enviado para atendimento",
    }
    setOrders((current) => [newOrder, ...current])
    return newOrder
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        orders,
        isAuthenticated: !!user,
        isHydrated,
        login,
        register,
        logout,
        updateUser,
        addOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
