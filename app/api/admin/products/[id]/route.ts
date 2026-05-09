import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth/admin"
import {
  getProductById,
  updateProduct,
  deleteProduct,
  type ProductPatch,
} from "@/lib/services/products-repo"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Ctx) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  const { id } = await params
  try {
    const product = await getProductById(id)
    if (!product) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    return NextResponse.json(product)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: Ctx) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  const { id } = await params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 })
  }

  const patch = (body as ProductPatch) ?? {}
  const result = await updateProduct(id, patch)
  if (!result.ok) {
    const status =
      result.error.code === "NOT_FOUND" ? 404
        : result.error.code === "DUP_SLUG" || result.error.code === "DUP_SKU" ? 409
        : result.error.code === "INVALID" ? 400
        : result.error.code === "NO_DB" ? 503
        : 500
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json(result.data)
}

export async function DELETE(request: Request, { params }: Ctx) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  const { id } = await params
  const result = await deleteProduct(id)
  if (!result.ok) {
    const status = result.error.code === "NO_DB" ? 503 : 500
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json({ ok: true })
}
