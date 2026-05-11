import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth/admin"
import {
  uploadProductMedia,
  deleteProductMedia,
  type UploadKind,
} from "@/lib/services/upload"

/**
 * POST /api/admin/upload
 * multipart/form-data:
 *   - file: o arquivo (image/video)
 *   - productId: ID do produto
 *   - kind: "image" | "video"
 *
 * DELETE /api/admin/upload
 * JSON: { url: string }
 *
 * Auth via cookie fs_admin (mesma lógica das outras rotas admin).
 */

// Aceita uploads grandes (até 50MB pra vídeo)
export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Form inválido." }, { status: 400 })
  }

  const file = formData.get("file")
  const productId = formData.get("productId")
  const kindRaw = formData.get("kind")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Campo 'file' obrigatório." }, { status: 400 })
  }
  if (typeof productId !== "string" || !productId) {
    return NextResponse.json({ error: "Campo 'productId' obrigatório." }, { status: 400 })
  }
  if (kindRaw !== "image" && kindRaw !== "video") {
    return NextResponse.json({ error: "Campo 'kind' deve ser 'image' ou 'video'." }, { status: 400 })
  }

  const result = await uploadProductMedia({
    productId,
    kind: kindRaw as UploadKind,
    file,
  })

  if (!result.ok) {
    const status =
      result.error.code === "INVALID_TYPE" || result.error.code === "INVALID_PRODUCT_ID"
        ? 400
        : result.error.code === "TOO_LARGE"
        ? 413
        : result.error.code === "NO_DB"
        ? 503
        : 500
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json(result, { status: 201 })
}

export async function DELETE(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  let body: { url?: string }
  try {
    body = (await request.json()) as { url?: string }
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 })
  }
  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json({ error: "url obrigatória." }, { status: 400 })
  }

  const result = await deleteProductMedia(body.url)
  if (!result.ok) {
    return NextResponse.json({ error: result.message ?? "Erro ao remover." }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
