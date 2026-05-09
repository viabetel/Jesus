"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true)
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Erro."); setLoading(false); return }
      router.push("/admin"); router.refresh()
    } catch { setError("Erro de conexão."); setLoading(false) }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800"><Lock className="h-5 w-5 text-neutral-400" /></div>
          <h1 className="text-base font-semibold text-white">Fashion Store Admin</h1>
          <p className="mt-1 text-xs text-neutral-500">Digite a senha para acessar.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" autoFocus required className="h-10 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 pr-9 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500" tabIndex={-1}>{show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
          </div>
          {error && <div className="flex items-center gap-1.5 rounded-lg bg-red-950/50 px-2.5 py-1.5 text-[10px] text-red-400"><AlertCircle className="h-3 w-3 shrink-0" />{error}</div>}
          <button type="submit" disabled={loading || !password} className="h-10 w-full rounded-lg bg-white text-sm font-medium text-neutral-950 hover:bg-neutral-200 disabled:opacity-50">{loading ? "Entrando..." : "Entrar"}</button>
        </form>
      </div>
    </div>
  )
}
