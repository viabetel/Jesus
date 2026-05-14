/**
 * Supabase Browser Client
 *
 * Usa ANON key para operações client-side (Auth, favoritos, etc).
 * Importar SOMENTE em componentes "use client".
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | null = null

export function getSupabaseBrowser(): SupabaseClient | null {
  if (typeof window === "undefined") return null

  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey) return null
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
