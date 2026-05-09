import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth/admin"
import { reorderMedia } from "@/lib/services/media-repo"

type Ctx = { params: Promise<{ id: string }> }

/**
 * POST /api/admin/products/[id]/media/reorder
 * body: { orderedIds: number[] }
 *
 * Recebe a nova ordem e grava sort_order = índice no array.
 */
export async function POST(request: Request, { params }: Ctx) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  const { id } = await params
  let body: { orderedIds?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 })
  }
  if (!Array.isArray(body.orderedIds) || !body.orderedIds.every((x) => Number.isInteger(x))) {
    return NextResponse.json({ error: "orderedIds deve ser array de inteiros." }, { status: 400 })
  }

  const result = await reorderMedia(id, body.orderedIds as number[])
  if (!result.ok) {
    const status = result.error.code === "NO_DB" ? 503 : 500
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json({ ok: true })
}
