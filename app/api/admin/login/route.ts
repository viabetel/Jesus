import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD não configurado no servidor." },
        { status: 500 }
      )
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "Senha incorreta." },
        { status: 401 }
      )
    }

    const token = Buffer.from(`${adminPassword}:fs-admin-session`).toString("base64")

    const response = NextResponse.json({ success: true })
    response.cookies.set("fs_admin", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    })

    return response
  } catch {
    return NextResponse.json(
      { error: "Erro ao processar login." },
      { status: 400 }
    )
  }
}
