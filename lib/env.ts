/**
 * Helpers de ambiente.
 *
 * canUseMemoryFallback retorna true SOMENTE quando ALLOW_LOCAL_FALLBACK=true.
 * Em produção e no build da Vercel, Supabase é obrigatório.
 */

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

/**
 * Fallback in-memory SOMENTE quando explicitamente ativado.
 * Não ativar em produção nem no build.
 */
export function canUseMemoryFallback(): boolean {
  return process.env.ALLOW_LOCAL_FALLBACK === "true"
}
