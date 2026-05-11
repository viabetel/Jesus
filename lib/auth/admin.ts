/**
 * Validação de admin para API routes.
 *
 * O proxy.ts protege /admin/* (HTML), mas NÃO protege /api/admin/*.
 * Por isso cada API route admin deve chamar `isAdminAuthenticated` em
 * GET/PATCH/DELETE.
 *
 * O cookie é definido em /api/admin/login via `btoa(senha:fs)`.
 */

import type { NextRequest } from "next/server"

export function isAdminAuthenticated(request: Request | NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return false

  // Lê cookie do request (compatível com Request padrão e NextRequest)
  let cookieValue: string | null = null
  const anyReq = request as { cookies?: { get?: (name: string) => { value: string } | undefined } }
  if (typeof anyReq.cookies?.get === "function") {
    // NextRequest API
    cookieValue = anyReq.cookies.get("fs_admin")?.value ?? null
  } else {
    // Request padrão: lê do header
    const header = request.headers.get("cookie") ?? ""
    const match = header.match(/(?:^|;\s*)fs_admin=([^;]+)/)
    cookieValue = match ? decodeURIComponent(match[1]) : null
  }

  if (!cookieValue) return false
  const expected = btoa(`${adminPassword}:fs`)
  return cookieValue === expected
}
