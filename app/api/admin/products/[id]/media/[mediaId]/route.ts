import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth/admin"
import { updateMedia, deleteMedia, type MediaPatch } from "@/lib/services/media-repo"
import { deleteProductMedia as deleteFromStorage } from "@/lib/services/upload"

type Ctx = { params: Promise<{ id: string; mediaId: string }> }

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

  const patch = body as MediaPatch
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

  // Lê o body opcional pra saber se deve apagar do storage também
  let alsoDeleteStorage = true
  let storagePath: string | null = null
  try {
    const body = await request.json() as { storagePath?: string; keepStorage?: boolean }
    if (body.keepStorage) alsoDeleteStorage = false
    if (body.storagePath) storagePath = body.storagePath
  } catch {
    // sem body, segue o default
  }

  const result = await deleteMedia(idNum)
  if (!result.ok) {
    const status = result.error.code === "NO_DB" ? 503 : 500
    return NextResponse.json({ error: result.error }, { status })
  }

  // Tenta limpar o arquivo do bucket (não-bloqueante)
  if (alsoDeleteStorage && storagePath) {
    deleteFromStorage(storagePath).catch(() => { /* arquivo órfão é ok */ })
  }

  return NextResponse.json({ ok: true })
}
