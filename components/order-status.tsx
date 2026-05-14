import { Package, CheckCircle2, Truck, Star, XCircle } from "lucide-react"

const STEPS = [
  { key: "recebido", label: "Pedido recebido", icon: Package, color: "text-blue-500 bg-blue-500/10" },
  { key: "confirmado", label: "Confirmado", icon: CheckCircle2, color: "text-yellow-500 bg-yellow-500/10" },
  { key: "enviado", label: "Enviado / Entrega", icon: Truck, color: "text-purple-500 bg-purple-500/10" },
  { key: "entregue", label: "Entregue", icon: Star, color: "text-emerald-500 bg-emerald-500/10" },
]

export function statusLabel(s: string) {
  const map: Record<string, string> = {
    recebido: "Recebido", confirmado: "Confirmado",
    enviado: "Enviado", entregue: "Entregue", cancelado: "Cancelado",
  }
  return map[s] || s
}

export function statusBadgeClass(s: string) {
  const map: Record<string, string> = {
    recebido: "bg-blue-100 text-blue-700",
    confirmado: "bg-yellow-100 text-yellow-700",
    enviado: "bg-purple-100 text-purple-700",
    entregue: "bg-emerald-100 text-emerald-700",
    cancelado: "bg-red-100 text-red-700",
  }
  return map[s] || "bg-gray-100 text-gray-700"
}

export function OrderStatusTimeline({ status }: { status: string }) {
  if (status === "cancelado") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">
        <XCircle className="h-4 w-4" /> Pedido cancelado
      </div>
    )
  }

  const currentIdx = STEPS.findIndex(s => s.key === status)

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, idx) => {
        const Icon = step.icon
        const done = idx <= currentIdx
        const active = idx === currentIdx
        return (
          <div key={step.key} className="flex items-center gap-1 flex-1">
            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
              done ? step.color : "text-gray-400 bg-gray-100"
            } ${active ? "ring-1 ring-current" : ""}`}>
              <Icon className="h-3 w-3" />
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-px flex-1 min-w-2 ${idx < currentIdx ? "bg-current opacity-30" : "bg-gray-200"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
