/**
 * Helpers de ambiente. Separam lógica de "modo dev vs produção" num único lugar.
 */

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

/**
 * Fallback in-memory SÓ pode ser usado em:
 *  - NODE_ENV=development (local)
 *  - Durante `next build` (que roda em production mas precisa de static params)
 *
 * Em runtime de produção (request real), Supabase DEVE estar configurado.
 */
export function canUseMemoryFallback(): boolean {
  if (!isProduction()) return true
  // next build seta NEXT_PHASE ou __NEXT_PRIVATE_PREBUNDLED_REACT
  // Mas a forma mais segura: se não tem Supabase E estamos em build,
  // o caller já protege gerando static params do array legado.
  // Então: permitir se NEXT_PHASE existir (build time)
  const phase = process.env.NEXT_PHASE ?? ""
  if (phase.includes("build") || phase.includes("generate")) return true
  return false
}
