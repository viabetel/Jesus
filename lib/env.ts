/**
 * Helpers de ambiente.
 *
 * canUseMemoryFallback agora é DESATIVADO por padrão.
 * Para ativar em dev local sem Supabase: ALLOW_LOCAL_FALLBACK=true
 */

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

/**
 * Fallback in-memory SÓ permitido quando explicitamente ativado.
 * Em produção, NUNCA permitir — dados devem vir do Supabase.
 */
export function canUseMemoryFallback(): boolean {
  // Build time (next build) precisa de fallback para generateStaticParams
  const phase = process.env.NEXT_PHASE ?? ""
  if (phase.includes("build") || phase.includes("generate")) return true

  // Explicitamente ativado para dev
  if (process.env.ALLOW_LOCAL_FALLBACK === "true") return true

  return false
}
