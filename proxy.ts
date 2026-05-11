import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Next.js 16 renomeou `middleware.ts` para `proxy.ts` e a função `middleware`
 * para `proxy`. Mantemos a mesma lógica de proteção do /admin/*.
 *
 * O proxy roda no runtime Node por padrão (não mais Edge), mas usamos só APIs
 * que funcionam em ambos (`btoa` está disponível em Node 16+ globalmente).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith("/admin")) return NextResponse.next()
  if (pathname === "/admin/login") return NextResponse.next()

  const adminPassword = process.env.ADMIN_PASSWORD

  // BLOQUEIA se nenhuma senha estiver configurada — nunca expõe admin sem auth
  if (!adminPassword) {
    return new NextResponse(
      "Admin bloqueado: ADMIN_PASSWORD não configurado nas variáveis de ambiente.",
      { status: 403 }
    )
  }

  const cookie = request.cookies.get("fs_admin")
  if (!cookie?.value) {
    const loginUrl = new URL("/admin/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Validação simples do token
  const expected = btoa(`${adminPassword}:fs`)
  if (cookie.value !== expected) {
    const loginUrl = new URL("/admin/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = { matcher: ["/admin/:path*"] }
