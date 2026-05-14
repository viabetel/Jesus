"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen"
import { formatPhone } from "@/lib/phone"

export default function CadastroPage() {
  const { register, isAuthenticated, isHydrated } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      setRedirecting(true)
      window.location.replace("/minha-conta")
    }
  }, [isHydrated, isAuthenticated])

  if (!isHydrated || redirecting) {
    return <AuthLoadingScreen message="Carregando..." />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error("Informe seu nome."); return }
    if (!email.trim()) { toast.error("Informe seu e-mail."); return }
    if (!whatsapp.trim()) { toast.error("Informe seu WhatsApp."); return }
    if (password.length < 6) { toast.error("Senha deve ter pelo menos 6 caracteres."); return }
    if (password !== confirm) { toast.error("As senhas não conferem."); return }
    if (!agreed) { toast.error("Aceite a política de privacidade."); return }

    setLoading(true)
    const result = await register({ name: name.trim(), email: email.trim(), whatsapp: whatsapp.trim(), password })
    setLoading(false)

    if (!result.ok) {
      toast.error(result.error || "Erro ao criar conta.")
      return
    }

    if ("needsEmailConfirmation" in result && result.needsEmailConfirmation) {
      setEmailSent(true)
      toast.success("Conta criada! Verifique seu e-mail para confirmar.")
      return
    }

    toast.success("Conta criada com sucesso!")
    window.location.assign("/minha-conta")
  }

  if (emailSent) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <div className="text-center max-w-md">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-6" />
          <h1 className="font-serif text-[28px] font-bold">Verifique seu e-mail</h1>
          <p className="mt-3 text-[14px] text-[var(--muted-foreground)] leading-relaxed">
            Enviamos um link de confirmação para <strong>{email}</strong>.
            Clique no link para ativar sua conta e então faça login.
          </p>
          <a href="/login" className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-[var(--ink)] text-white px-8 text-[13px] font-semibold uppercase tracking-wider hover:bg-[var(--fg-soft)] transition">
            Ir para Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh">
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-1/2 lg:px-16 xl:px-24">
        <a href="/" className="flex items-center gap-3 mb-10">
          <div className="h-10 w-10 bg-[var(--ink)]" />
          <span className="font-serif text-lg font-bold">Fashion Store</span>
        </a>

        <h1 className="font-serif text-[28px] font-bold sm:text-[34px]">Criar Conta</h1>
        <p className="mt-2 text-[14px] text-[var(--muted-foreground)]">
          Crie sua conta para favoritar produtos e acompanhar pedidos.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 max-w-md">
          <div>
            <label className="block text-[12px] font-medium mb-1.5">Nome completo</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Seu nome" autoComplete="name" autoFocus
              className="w-full h-12 rounded-lg border border-[var(--border)] bg-transparent px-4 text-[14px] outline-none focus:border-[var(--ink)] transition" />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" autoComplete="email"
              className="w-full h-12 rounded-lg border border-[var(--border)] bg-transparent px-4 text-[14px] outline-none focus:border-[var(--ink)] transition" />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5">WhatsApp</label>
            <input type="tel" value={whatsapp} onChange={e => setWhatsapp(formatPhone(e.target.value))}
              placeholder="(32) 99999-9999" autoComplete="tel"
              className="w-full h-12 rounded-lg border border-[var(--border)] bg-transparent px-4 text-[14px] outline-none focus:border-[var(--ink)] transition" />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5">Senha</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres" autoComplete="new-password"
                className="w-full h-12 rounded-lg border border-[var(--border)] bg-transparent px-4 pr-12 text-[14px] outline-none focus:border-[var(--ink)] transition" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5">Confirmar senha</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Repita a senha" autoComplete="new-password"
              className="w-full h-12 rounded-lg border border-[var(--border)] bg-transparent px-4 text-[14px] outline-none focus:border-[var(--ink)] transition" />
          </div>

          <label className="flex items-start gap-2 cursor-pointer pt-1">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[var(--border)]" />
            <span className="text-[12px] text-[var(--muted-foreground)]">
              Li e aceito a <a href="/privacidade" className="underline underline-offset-2 font-medium text-[var(--ink)]">política de privacidade</a>
            </span>
          </label>

          <button type="submit" disabled={loading}
            className="w-full h-12 rounded-lg bg-[var(--ink)] text-white text-[13px] font-semibold uppercase tracking-wider hover:bg-[var(--fg-soft)] transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-[13px] text-[var(--muted-foreground)]">
          Já tem conta? <a href="/login" className="font-semibold text-[var(--ink)] underline underline-offset-2">Entrar</a>
        </p>
      </div>

      <div className="hidden bg-[var(--ink)] lg:flex lg:w-1/2 lg:items-center lg:justify-center">
        <div className="text-center px-12">
          <div className="mx-auto h-24 w-24 rounded-full bg-white/5 flex items-center justify-center mb-8">
            <div className="h-12 w-12 bg-white/10 rounded" />
          </div>
          <h2 className="font-serif text-white text-[28px] font-bold">Faça parte da Fashion Store</h2>
          <p className="mt-3 text-white/60 text-[14px] max-w-sm mx-auto leading-relaxed">
            Crie sua conta e tenha acesso a favoritos, histórico de pedidos e ofertas exclusivas.
          </p>
        </div>
      </div>
    </div>
  )
}
