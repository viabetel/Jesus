export const statusLabel: Record<string, string> = {
  ativo: "Publicado",
  rascunho: "Não publicado",
  oculto: "Oculto",
  esgotado: "Esgotado",
}

export const statusColor: Record<string, string> = {
  ativo: "bg-emerald-900/40 text-emerald-400 border-emerald-800/30",
  rascunho: "bg-yellow-900/40 text-yellow-400 border-yellow-800/30",
  oculto: "bg-neutral-800 text-neutral-400 border-neutral-700",
  esgotado: "bg-red-900/40 text-red-400 border-red-800/30",
}

export const orderStatusLabel: Record<string, string> = {
  recebido: "Recebido",
  confirmado: "Confirmado",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
}

export const orderStatusColor: Record<string, string> = {
  recebido: "bg-blue-900/40 text-blue-400",
  confirmado: "bg-yellow-900/40 text-yellow-400",
  enviado: "bg-purple-900/40 text-purple-400",
  entregue: "bg-green-900/40 text-green-400",
  cancelado: "bg-red-900/40 text-red-400",
}
