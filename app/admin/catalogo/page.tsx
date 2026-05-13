"use client"
import { AdminShell } from "@/components/admin/admin-shell"
import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ExternalLink, RefreshCw, Loader2 } from "lucide-react"
import { validateCatalog, validateProduct, type Issue, type Severity } from "@/lib/data/catalog-validation"
import type { Product } from "@/lib/data/products"

const sev: Record<Severity, { icon: typeof AlertCircle; cls: string; label: string }> = {
  error: { icon: AlertCircle, cls: "text-red-400 bg-red-950/30 border-red-900/50", label: "Erros" },
  warning: { icon: AlertTriangle, cls: "text-yellow-400 bg-yellow-950/30 border-yellow-900/50", label: "Avisos" },
  info: { icon: Info, cls: "text-blue-400 bg-blue-950/30 border-blue-900/50", label: "Informações" },
}

export default function AdminCatalogoPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [useApi, setUseApi] = useState(true)

  useEffect(() => {
    fetch("/api/admin/products", { cache: "no-store" })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data)
          setUseApi(true)
        } else {
          setUseApi(false)
        }
      })
      .catch(() => setUseApi(false))
      .finally(() => setLoading(false))
  }, [])

  const result = useMemo(() => {
    if (useApi && products.length > 0) {
      const issues: Issue[] = []
      for (const p of products) issues.push(...validateProduct(p))
      // Check duplicate slugs
      const slugs = new Map<string, string[]>()
      for (const p of products) { slugs.set(p.slug, [...(slugs.get(p.slug) || []), p.name]) }
      for (const [slug, names] of slugs) {
        if (names.length > 1) names.forEach(n => issues.push({
          productId: "", productName: n, slug, severity: "error",
          code: "DUP_SLUG", message: `Slug duplicado: ${names.join(", ")}`
        }))
      }
      const e = issues.filter(i => i.severity === "error").length
      const w = issues.filter(i => i.severity === "warning").length
      const inf = issues.filter(i => i.severity === "info").length
      return { issues, summary: { errors: e, warnings: w, infos: inf, total: issues.length } }
    }
    return validateCatalog()
  }, [products, useApi])

  return (
    <AdminShell title="Validações" breadcrumb={[{label:"Validações"}]}>
      <div className="max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Validações do Catálogo</h1>
            <p className="mt-1 text-[12px] text-neutral-500">
              Verifica problemas em todos os produtos{useApi ? " (dados do servidor)" : " (dados locais)"}.
            </p>
          </div>
          <button onClick={() => { setLoading(true); window.location.reload() }}
            className="flex h-10 items-center gap-1.5 rounded-lg border border-neutral-800 px-3 text-[11px] text-neutral-400 hover:text-white transition w-fit">
            <RefreshCw className="h-3.5 w-3.5" /> Revalidar
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-neutral-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validando...</div>
        ) : (
          <>
            {/* Stats */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {[
                { label: "Total", value: result.summary.total, color: "" },
                { label: "Erros", value: result.summary.errors, color: "text-red-400" },
                { label: "Avisos", value: result.summary.warnings, color: "text-yellow-400" },
                { label: "Info", value: result.summary.infos, color: "text-blue-400" },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                  <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-900/20 p-4">
              <h3 className="text-[11px] font-semibold text-neutral-300 mb-2">Como interpretar</h3>
              <div className="space-y-1.5 text-[11px] text-neutral-400">
                <p className="flex items-center gap-2"><AlertCircle className="h-3 w-3 text-red-400 shrink-0" /> <span><span className="font-semibold text-red-400">Erros</span> — impedem publicação. Corrija antes de ativar o produto.</span></p>
                <p className="flex items-center gap-2"><AlertTriangle className="h-3 w-3 text-yellow-400 shrink-0" /> <span><span className="font-semibold text-yellow-400">Avisos</span> — não impedem, mas afetam a experiência. Ex: sem estoque, poucas fotos.</span></p>
                <p className="flex items-center gap-2"><Info className="h-3 w-3 text-blue-400 shrink-0" /> <span><span className="font-semibold text-blue-400">Info</span> — sugestões opcionais para melhorar o catálogo.</span></p>
              </div>
            </div>

            {result.summary.total === 0 && (
              <div className="mt-6 flex flex-col items-center gap-3 py-12 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <p className="text-sm text-neutral-300 font-medium">Catálogo sem problemas!</p>
                <p className="text-[12px] text-neutral-500">Todos os produtos estão configurados corretamente.</p>
              </div>
            )}

            {/* Issues by severity */}
            <div className="mt-5 space-y-5">
              {(["error", "warning", "info"] as Severity[]).map(s => {
                const items = result.issues.filter(i => i.severity === s)
                if (!items.length) return null
                const cfg = sev[s]
                return (
                  <div key={s}>
                    <h2 className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: s === "error" ? "#f87171" : s === "warning" ? "#fbbf24" : "#60a5fa" }}>
                      {cfg.label} ({items.length})
                    </h2>
                    <div className="space-y-1.5">
                      {items.map((issue, i) => { const Icon = cfg.icon; return (
                        <div key={i} className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 ${cfg.cls}`}>
                          <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-medium text-white">{issue.productName}</span>
                              {issue.slug && (
                                <Link href={`/admin/produtos`} className="text-neutral-500 hover:text-neutral-300 text-[10px] underline underline-offset-2">
                                  Editar
                                </Link>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{issue.message}</p>
                          </div>
                        </div>
                      )})}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </AdminShell>
  )
}
