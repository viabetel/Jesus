/**
 * Supabase Server Client
 *
 * Aceita ambos os padrões de env (Vercel / custom):
 *   NEXT_PUBLIC_SUPABASE_URL  ou  SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY ou  SUPABASE_SERVICE_KEY
 *
 * ⚠ Usa service_role key — SOMENTE para operações server-side.
 * Para client-side (Auth, favoritos, etc), usar lib/supabase-browser.ts
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

let client: SupabaseClient | null = null

if (url && serviceKey) {
  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// Boot log (server-only, runs once)
if (typeof window === "undefined") {
  console.info(`[Supabase] URL: ${url ? "✓ configurada" : "✗ AUSENTE"}`)
  console.info(`[Supabase] Service Key: ${serviceKey ? "✓ configurada" : "✗ AUSENTE"}`)
  if (!url || !serviceKey) {
    console.warn("[Supabase] Banco não configurado. Ative NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.")
  }
}

/** Retorna o cliente Supabase ou null se não configurado. */
export function getSupabase(): SupabaseClient | null {
  return client
}

export function isSupabaseConfigured(): boolean {
  return client !== null
}

/** Lança se Supabase não estiver configurado. */
export function requireSupabase(): SupabaseClient {
  if (!client) {
    throw new Error(
      "Supabase não configurado. Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
    )
  }
  return client
}
