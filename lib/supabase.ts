/**
 * Cliente Supabase — usa @supabase/supabase-js.
 *
 * Configuração:
 *   SUPABASE_URL          → URL do projeto
 *   SUPABASE_SERVICE_KEY  → service_role key (usada SOMENTE no servidor)
 *
 * Em desenvolvimento local sem env, exportamos `null` e o repository cai em
 * fallback in-memory (apenas pra subir `next dev` sem erro). Em produção,
 * sem env o repository LANÇA — não permitimos rodar sem persistência.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY

let client: SupabaseClient | null = null

if (url && serviceKey) {
  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Retorna o cliente Supabase ou null se não configurado. Nunca lança. */
export function getSupabase(): SupabaseClient | null {
  return client
}

export function isSupabaseConfigured(): boolean {
  return client !== null
}

/** Lança se Supabase não estiver configurado. Usar com cuidado — prefira getSupabase() + fallback. */
export function requireSupabase(): SupabaseClient {
  if (!client) {
    throw new Error("Supabase não configurado.")
  }
  return client
}
