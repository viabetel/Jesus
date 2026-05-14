/**
 * Supabase Browser Client — Auth, Favoritos, etc.
 *
 * Requer:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Estas variáveis DEVEM ter o prefixo NEXT_PUBLIC_ para serem
 * acessíveis no browser. Sem ele, o Next.js não as expõe ao client.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | null = null
let warnedMissing = false

export function getSupabaseBrowser(): SupabaseClient | null {
  if (typeof window === "undefined") return null

  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      if (!warnedMissing) {
        warnedMissing = true
        console.error(
          "[Supabase Browser] Variáveis ausentes:\n" +
          `  NEXT_PUBLIC_SUPABASE_URL: ${url ? "✓" : "✗ AUSENTE"}\n` +
          `  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${anonKey ? "✓" : "✗ AUSENTE"}\n` +
          "Login, favoritos e Minha Conta não funcionarão.\n" +
          "Configure no Vercel: Settings → Environment Variables.\n" +
          "IMPORTANTE: o prefixo NEXT_PUBLIC_ é obrigatório."
        )
      }
      return null
    }

    browserClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "fs-auth",
      },
    })
  }

  return browserClient
}
