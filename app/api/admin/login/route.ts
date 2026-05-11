import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) return NextResponse.json({ error: "ADMIN_PASSWORD não configurado." }, { status: 500 })
    if (password !== adminPassword) return NextResponse.json({ error: "Senha incorreta." }, { status: 401 })

    const token = btoa(`${adminPassword}:fs`)
    const response = NextResponse.json({ success: true })
    response.cookies.set("fs_admin", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 })
    return response
  } catch {
    return NextResponse.json({ error: "Erro ao processar login." }, { status: 400 })
  }
}
