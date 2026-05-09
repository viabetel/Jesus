import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth/admin"
import {
  upsertVariant,
  deleteVariant,
  type VariantInput,
} from "@/lib/services/products-repo"

/**
 * POST   /api/admin/variants  → cria ou atualiza variante
 * DELETE /api/admin/variants  → body: { sku }
 */

export async function POST(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 })
  }

  const b = body as Partial<VariantInput>
  if (!b.productId || !b.colorName || !b.colorHex || !b.size) {
    return NextResponse.json(
      { error: "productId, colorName, colorHex e size são obrigatórios." },
      { status: 400 }
    )
  }
  const input: VariantInput = {
    sku: b.sku ?? "",
    productId: b.productId,
    colorName: b.colorName,
    colorHex: b.colorHex,
    size: b.size,
    stock: typeof b.stock === "number" ? b.stock : 0,
    active: b.active ?? true,
  }

  const result = await upsertVariant(input)
  if (!result.ok) {
    const status =
      result.error.code === "NOT_FOUND" ? 404
        : result.error.code === "INVALID" ? 400
        : result.error.code === "NO_DB" ? 503
        : 500
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json(result.data)
}

export async function DELETE(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 })
  }
  const sku = (body as { sku?: string }).sku
  if (!sku) {
    return NextResponse.json({ error: "sku obrigatório." }, { status: 400 })
  }
  const result = await deleteVariant(sku)
  if (!result.ok) {
    const status = result.error.code === "NO_DB" ? 503 : 500
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json({ ok: true })
}
