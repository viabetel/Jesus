"use client"
import { useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, AlertTriangle, Info, CheckCircle2, LogOut, ExternalLink } from "lucide-react"
import { validateCatalog, type Issue, type Severity } from "@/lib/data/catalog-validation"

const sev: Record<Severity, { icon: typeof AlertCircle; cls: string }> = {
  error: { icon: AlertCircle, cls: "text-red-400 bg-red-950/30 border-red-900/50" },
  warning: { icon: AlertTriangle, cls: "text-yellow-400 bg-yellow-950/30 border-yellow-900/50" },
  info: { icon: Info, cls: "text-blue-400 bg-blue-950/30 border-blue-900/50" },
}

export default function AdminCatalogoPage() {
  const router = useRouter()
  const result = useMemo(() => validateCatalog(), [])
  const handleLogout = async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); router.refresh() }

  return (
    <div className="min-h-dvh bg-neutral-950 text-white">
      <header className="border-b border-neutral-800 px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2"><Link href="/admin" className="text-[10px] text-neutral-500 hover:text-neutral-300">← Admin</Link><h1 className="text-base font-semibold">Validações</h1></div>
          <button onClick={handleLogout} className="flex items-center gap-1 rounded-lg border border-neutral-700 px-2.5 py-1 text-[10px] text-neutral-400 hover:text-white"><LogOut className="h-3 w-3" /> Sair</button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-4">
        <div className="mb-4 grid grid-cols-4 gap-2">
          {[["Total", result.summary.total, ""], ["Erros", result.summary.errors, "text-red-400"], ["Avisos", result.summary.warnings, "text-yellow-400"], ["Info", result.summary.infos, "text-blue-400"]].map(([l, v, c]) => (
            <div key={l as string} className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 text-center">
              <p className={`text-xl font-bold ${c}`}>{v as number}</p><p className="text-[9px] text-neutral-500">{l as string}</p>
            </div>
          ))}
        </div>
        {result.summary.total === 0 && <div className="flex flex-col items-center gap-2 py-8"><CheckCircle2 className="h-8 w-8 text-green-500" /><p className="text-xs text-neutral-400">Sem problemas.</p></div>}
        {(["error", "warning", "info"] as Severity[]).map(s => {
          const items = result.issues.filter(i => i.severity === s)
          if (!items.length) return null
          const cfg = sev[s]
          return (
            <div key={s} className="mb-4">
              <h2 className="mb-2 text-[9px] font-semibold uppercase tracking-wider" style={{ color: s === "error" ? "#f87171" : s === "warning" ? "#fbbf24" : "#60a5fa" }}>{s === "error" ? "Erros" : s === "warning" ? "Avisos" : "Info"} ({items.length})</h2>
              <div className="space-y-1">
                {items.map((issue, i) => { const Icon = cfg.icon; return (
                  <div key={i} className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${cfg.cls}`}>
                    <Icon className="mt-0.5 h-3 w-3 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5"><span className="text-[10px] font-medium text-white truncate">{issue.productName}</span>
                        {issue.slug && <Link href={`/produto/${issue.slug}`} target="_blank" className="text-neutral-600 hover:text-neutral-300"><ExternalLink className="h-2.5 w-2.5" /></Link>}
                      </div>
                      <p className="text-[9px] text-neutral-400">{issue.message}</p>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )
        })}
      </main>
    </div>
  )
}
