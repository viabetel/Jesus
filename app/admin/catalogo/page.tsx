"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  LogOut,
  ExternalLink,
} from "lucide-react"
import { validateCatalog, type ValidationIssue, type ValidationSeverity } from "@/lib/data/catalog-validation"

const severityConfig: Record<ValidationSeverity, { icon: typeof AlertCircle; color: string; bg: string }> = {
  error: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-950/30 border-red-900/50" },
  warning: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-950/30 border-yellow-900/50" },
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-950/30 border-blue-900/50" },
}

function IssueRow({ issue }: { issue: ValidationIssue }) {
  const config = severityConfig[issue.severity]
  const Icon = config.icon

  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${config.bg}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">{issue.productName}</span>
          {issue.slug && (
            <Link
              href={`/produto/${issue.slug}`}
              target="_blank"
              className="shrink-0 text-neutral-600 hover:text-neutral-300"
            >
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
        <p className="mt-0.5 text-xs text-neutral-400">{issue.message}</p>
        <span className="mt-1 inline-block rounded bg-neutral-800/80 px-1.5 py-0.5 text-[9px] font-mono text-neutral-500">
          {issue.code}
        </span>
      </div>
    </div>
  )
}

export default function AdminCatalogoPage() {
  const router = useRouter()
  const result = useMemo(() => validateCatalog(), [])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  const { summary, issues } = result
  const errors = issues.filter((i) => i.severity === "error")
  const warnings = issues.filter((i) => i.severity === "warning")
  const infos = issues.filter((i) => i.severity === "info")

  return (
    <div className="min-h-dvh bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs text-neutral-500 hover:text-neutral-300">← Admin</Link>
            <h1 className="text-lg font-semibold">Catálogo & Validações</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-400 transition hover:border-neutral-600 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-6">
        {/* Summary */}
        <div className="mb-6 grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 text-center">
            <p className="text-2xl font-bold text-white">{summary.total}</p>
            <p className="text-[10px] text-neutral-500">Total</p>
          </div>
          <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{summary.errors}</p>
            <p className="text-[10px] text-red-500">Erros</p>
          </div>
          <div className="rounded-lg border border-yellow-900/30 bg-yellow-950/20 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{summary.warnings}</p>
            <p className="text-[10px] text-yellow-500">Avisos</p>
          </div>
          <div className="rounded-lg border border-blue-900/30 bg-blue-950/20 p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{summary.infos}</p>
            <p className="text-[10px] text-blue-500">Infos</p>
          </div>
        </div>

        {summary.total === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-neutral-800 py-12">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="text-sm text-neutral-400">Catálogo sem problemas detectados.</p>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-red-400">
              Erros ({errors.length})
            </h2>
            <div className="space-y-2">
              {errors.map((issue, i) => (
                <IssueRow key={`e-${i}`} issue={issue} />
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-yellow-400">
              Avisos ({warnings.length})
            </h2>
            <div className="space-y-2">
              {warnings.map((issue, i) => (
                <IssueRow key={`w-${i}`} issue={issue} />
              ))}
            </div>
          </div>
        )}

        {/* Infos */}
        {infos.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-400">
              Informações ({infos.length})
            </h2>
            <div className="space-y-2">
              {infos.map((issue, i) => (
                <IssueRow key={`i-${i}`} issue={issue} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
