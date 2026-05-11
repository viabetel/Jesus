import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth/admin"
import { updateMedia, deleteMedia, type MediaPatch } from "@/lib/services/media-repo"
import { deleteProductMedia as deleteFromStorage } from "@/lib/services/upload"

type Ctx = { params: Promise<{ id: string; mediaId: string }> }

/**
 * PATCH /api/admin/products/[id]/media/[mediaId]
 *   body: { role?, sortOrder?, alt?, colorKey?, colorName?, colorHex?, variantSku? }
 *
 * DELETE /api/admin/products/[id]/media/[mediaId]
 *   body opcional: { storagePath?, keepStorage? }
 */

export async function PATCH(request: Request, { params }: Ctx) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  const { mediaId } = await params
  const idNum = Number(mediaId)
  if (!Number.isInteger(idNum)) {
    return NextResponse.json({ error: "mediaId inválido." }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const patch: MediaPatch = {}
  if (b.role !== undefined) patch.role = b.role as MediaPatch["role"]
  if (b.sortOrder !== undefined) patch.sortOrder = b.sortOrder as number
  if (b.alt !== undefined) patch.alt = b.alt as string | null
  if (b.colorKey !== undefined) patch.colorKey = b.colorKey as string | null
  if (b.colorName !== undefined) patch.colorName = b.colorName as string | null
  if (b.colorHex !== undefined) patch.colorHex = b.colorHex as string | null
  if (b.variantSku !== undefined) patch.variantSku = b.variantSku as string | null

  const result = await updateMedia(idNum, patch)
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

export async function DELETE(request: Request, { params }: Ctx) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  const { mediaId } = await params
  const idNum = Number(mediaId)
  if (!Number.isInteger(idNum)) {
    return NextResponse.json({ error: "mediaId inválido." }, { status: 400 })
  }

  let alsoDeleteStorage = true
  let storagePath: string | null = null
  try {
    const body = await request.json() as { storagePath?: string; keepStorage?: boolean }
    if (body.keepStorage) alsoDeleteStorage = false
    if (body.storagePath) storagePath = body.storagePath
  } catch {
    // sem body, segue default
  }

  const result = await deleteMedia(idNum)
  if (!result.ok) {
    const status = result.error.code === "NO_DB" ? 503 : 500
    return NextResponse.json({ error: result.error }, { status })
  }

  if (alsoDeleteStorage && storagePath) {
    deleteFromStorage(storagePath).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
