"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import type { User as SupaUser } from "@supabase/supabase-js"

export type User = {
  id: string
  name: string
  email: string
  whatsapp: string
  address?: string
  preferredSize?: string
}

export type Order = {
  id: string; orderNumber: string; date: string
  items: { productName: string; size: string; color: string; quantity: number; price: number }[]
  total: number; status: string; observation?: string
}

export type AuthResult =
  | { ok: true; needsEmailConfirmation?: false }
  | { ok: true; needsEmailConfirmation: true }
  | { ok: false; error: string }

type AuthContextType = {
  user: User | null
  orders: Order[]
  isAuthenticated: boolean
  isHydrated: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  register: (data: { name: string; email: string; whatsapp: string; password: string }) => Promise<AuthResult>
  logout: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<{ ok: boolean; error?: string }>
  refreshOrders: () => Promise<void>
  getAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mapSupaUser(su: SupaUser): User {
  const m = su.user_metadata ?? {}
  return {
    id: su.id, name: m.name || m.full_name || "",
    email: su.email || "", whatsapp: m.whatsapp || "",
    address: m.address || "", preferredSize: m.preferred_size || "",
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const sb = getSupabaseBrowser()
    if (!sb) { setIsHydrated(true); return }

    // Only trust session, never just user
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(mapSupaUser(session.user))
      setIsHydrated(true)
    })

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(mapSupaUser(session.user))
      else { setUser(null); setOrders([]) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const sb = getSupabaseBrowser()
    if (!sb) return null
    const { data: { session } } = await sb.auth.getSession()
    return session?.access_token ?? null
  }, [])

  const refreshOrders = useCallback(async () => {
    if (!user) { setOrders([]); return }
    const token = await getAccessToken()
    if (!token) return
    try {
      const res = await fetch("/api/customer/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      }
    } catch { console.error("[Auth] Erro ao buscar pedidos") }
  }, [user, getAccessToken])

  useEffect(() => { if (user) refreshOrders() }, [user, refreshOrders])

  // ── Login: only set user if session exists ──
  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const sb = getSupabaseBrowser()
    if (!sb) return { ok: false, error: "Supabase não configurado. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY." }

    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message === "Invalid login credentials") return { ok: false, error: "E-mail ou senha incorretos." }
      if (error.message.includes("Email not confirmed")) return { ok: false, error: "E-mail não confirmado. Verifique sua caixa de entrada." }
      return { ok: false, error: error.message }
    }
    if (!data.session) return { ok: false, error: "Sessão não retornada. Tente novamente." }
    setUser(mapSupaUser(data.session.user))
    return { ok: true }
  }, [])

  // ── Register: handle email confirmation ──
  const register = useCallback(async (input: {
    name: string; email: string; whatsapp: string; password: string
  }): Promise<AuthResult> => {
    const sb = getSupabaseBrowser()
    if (!sb) return { ok: false, error: "Supabase não configurado. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY." }

    const { data, error } = await sb.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { name: input.name, full_name: input.name, whatsapp: input.whatsapp },
      },
    })
    if (error) {
      if (error.message.includes("already registered")) return { ok: false, error: "Este e-mail já está em uso." }
      return { ok: false, error: error.message }
    }
    // No session = email confirmation required
    if (!data.session) return { ok: true, needsEmailConfirmation: true }
    setUser(mapSupaUser(data.session.user))
    return { ok: true }
  }, [])

  const logout = useCallback(async () => {
    const sb = getSupabaseBrowser()
    if (sb) await sb.auth.signOut()
    setUser(null); setOrders([])
  }, [])

  // ── updateUser: async, only update after Supabase confirms ──
  const updateUser = useCallback(async (data: Partial<User>): Promise<{ ok: boolean; error?: string }> => {
    const sb = getSupabaseBrowser()
    if (!sb || !user) return { ok: false, error: "Não autenticado." }

    const { data: updated, error } = await sb.auth.updateUser({
      data: {
        name: data.name, full_name: data.name,
        whatsapp: data.whatsapp, address: data.address,
        preferred_size: data.preferredSize,
      },
    })
    if (error) return { ok: false, error: error.message }
    if (updated.user) setUser(mapSupaUser(updated.user))
    return { ok: true }
  }, [user])

  return (
    <AuthContext.Provider value={{
      user, orders, isAuthenticated: !!user, isHydrated,
      login, register, logout, updateUser, refreshOrders, getAccessToken,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
