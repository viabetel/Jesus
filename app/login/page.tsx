"use client"

import { useState } from "react"

import Image from "next/image"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  // returnTo: only accept internal paths
  const next = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') || '/minha-conta' : '/minha-conta'
  const returnTo = next.startsWith("/") ? next : "/minha-conta"

  // If already authenticated, redirect immediately
  if (isAuthenticated && typeof window !== "undefined") {
    window.location.replace(returnTo)
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) { toast.error("Preencha todos os campos."); return }
    setLoading(true)

    const result = await login(email.trim(), password)
    setLoading(false)

    if (result.ok) {
      toast.success("Login realizado!")
      window.location.assign(returnTo)
    } else {
      toast.error(result.error || "Erro ao entrar.")
    }
  }

  return (
    <div className="flex min-h-dvh">
      {/* Form side */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-1/2 lg:px-16 xl:px-24">
        <a href="/" className="flex items-center gap-3 mb-10">
          <div className="h-10 w-10 bg-[var(--ink)]" />
          <span className="font-serif text-lg font-bold">Fashion Store</span>
        </a>

        <h1 className="font-serif text-[28px] font-bold sm:text-[34px]">Entrar</h1>
        <p className="mt-2 text-[14px] text-[var(--muted-foreground)]">
          Acesse sua conta para acompanhar pedidos e favoritos.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 max-w-md">
          <div>
            <label className="block text-[12px] font-medium mb-1.5">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" autoComplete="email" autoFocus
              className="w-full h-12 rounded-lg border border-[var(--border)] bg-transparent px-4 text-[14px] outline-none focus:border-[var(--ink)] transition" />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5">Senha</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                className="w-full h-12 rounded-lg border border-[var(--border)] bg-transparent px-4 pr-12 text-[14px] outline-none focus:border-[var(--ink)] transition" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--ink)]">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full h-12 rounded-lg bg-[var(--ink)] text-white text-[13px] font-semibold uppercase tracking-wider hover:bg-[var(--fg-soft)] transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-[13px] text-[var(--muted-foreground)]">
          Não tem conta? <a href="/cadastro" className="font-semibold text-[var(--ink)] underline underline-offset-2">Criar conta</a>
        </p>
      </div>

      {/* Image side (desktop only) */}
      <div className="hidden bg-[var(--ink)] lg:flex lg:w-1/2 lg:items-center lg:justify-center">
        <div className="text-center px-12">
          <div className="mx-auto h-24 w-24 rounded-full bg-white/5 flex items-center justify-center mb-8">
            <div className="h-12 w-12 bg-white/10 rounded" />
          </div>
          <h2 className="font-serif text-white text-[28px] font-bold">Bem-vindo de volta</h2>
          <p className="mt-3 text-white/60 text-[14px] max-w-sm mx-auto leading-relaxed">
            Entre na sua conta para acompanhar pedidos, salvar favoritos e aproveitar ofertas exclusivas.
          </p>
        </div>
      </div>
    </div>
  )
}
