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

export function getSupabase(): SupabaseClient | null {
  return client
}

export function isSupabaseConfigured(): boolean {
  return client !== null
}

export function requireSupabase(): SupabaseClient {
  if (!client) {
    throw new Error(
      "Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_KEY nas variáveis de ambiente."
    )
  }
  return client
}
