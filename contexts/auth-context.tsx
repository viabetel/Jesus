"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import type { User as SupaUser, Session } from "@supabase/supabase-js"

// ===== Types =====

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
  status: string
  observation?: string
}

type AuthContextType = {
  user: User | null
  orders: Order[]
  isAuthenticated: boolean
  isHydrated: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (data: {
    name: string
    email: string
    whatsapp: string
    password: string
  }) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  updateUser: (data: Partial<User>) => void
  refreshOrders: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ===== Helper: map Supabase user to our User type =====

function mapSupaUser(su: SupaUser): User {
  const meta = su.user_metadata ?? {}
  return {
    id: su.id,
    name: meta.name || meta.full_name || "",
    email: su.email || "",
    whatsapp: meta.whatsapp || "",
    address: meta.address || "",
    preferredSize: meta.preferred_size || "",
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // ── Initialize: check session ──
  useEffect(() => {
    const sb = getSupabaseBrowser()
    if (!sb) {
      setIsHydrated(true)
      return
    }

    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupaUser(session.user))
      }
      setIsHydrated(true)
    })

    // Listen for auth changes (login/logout from other tabs)
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupaUser(session.user))
      } else {
        setUser(null)
        setOrders([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Fetch orders when user changes ──
  const refreshOrders = useCallback(async () => {
    if (!user) { setOrders([]); return }
    try {
      const res = await fetch(`/api/customer/orders?email=${encodeURIComponent(user.email)}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      }
    } catch {
      console.error("[Auth] Erro ao buscar pedidos")
    }
  }, [user])

  useEffect(() => {
    if (user) refreshOrders()
  }, [user, refreshOrders])

  // ── Login ──
  const login = useCallback(async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    const sb = getSupabaseBrowser()
    if (!sb) return { ok: false, error: "Serviço indisponível." }

    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message }
    if (data.user) setUser(mapSupaUser(data.user))
    return { ok: true }
  }, [])

  // ── Register ──
  const register = useCallback(async (input: {
    name: string; email: string; whatsapp: string; password: string
  }): Promise<{ ok: boolean; error?: string }> => {
    const sb = getSupabaseBrowser()
    if (!sb) return { ok: false, error: "Serviço indisponível." }

    const { data, error } = await sb.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          name: input.name,
          full_name: input.name,
          whatsapp: input.whatsapp,
        },
      },
    })
    if (error) {
      if (error.message.includes("already registered")) return { ok: false, error: "Este e-mail já está em uso." }
      return { ok: false, error: error.message }
    }
    if (data.user) setUser(mapSupaUser(data.user))
    return { ok: true }
  }, [])

  // ── Logout ──
  const logout = useCallback(async () => {
    const sb = getSupabaseBrowser()
    if (sb) await sb.auth.signOut()
    setUser(null)
    setOrders([])
  }, [])

  // ── Update user metadata ──
  const updateUser = useCallback((data: Partial<User>) => {
    const sb = getSupabaseBrowser()
    if (sb && user) {
      sb.auth.updateUser({
        data: {
          name: data.name,
          full_name: data.name,
          whatsapp: data.whatsapp,
          address: data.address,
          preferred_size: data.preferredSize,
        },
      }).then(({ data: updated }) => {
        if (updated.user) setUser(mapSupaUser(updated.user))
      })
    }
    // Also update local state immediately
    setUser(prev => prev ? { ...prev, ...data } : null)
  }, [user])

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
        refreshOrders,
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
