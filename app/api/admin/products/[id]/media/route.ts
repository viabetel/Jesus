import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth/admin"
import {
  getProductMedia,
  addMedia,
  type MediaInput,
} from "@/lib/services/media-repo"

type Ctx = { params: Promise<{ id: string }> }

/**
 * GET  /api/admin/products/[id]/media → lista mídia do produto (auth)
 * POST /api/admin/products/[id]/media → adiciona mídia (auth)
 */

export async function GET(request: Request, { params }: Ctx) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  const { id } = await params
  try {
    const media = await getProductMedia(id)
    return NextResponse.json(media)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: Ctx) {
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

  const b = body as Partial<MediaInput>
  if (!b.url || !b.kind) {
    return NextResponse.json({ error: "url e kind obrigatórios." }, { status: 400 })
  }

  const input: MediaInput = {
    productId: id,
    url: b.url,
    storagePath: b.storagePath ?? null,
    kind: b.kind,
    role: b.role,
    alt: b.alt,
    sortOrder: b.sortOrder,
  }

  const result = await addMedia(input)
  if (!result.ok) {
    const status = result.error.code === "NO_DB" ? 503 : 500
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json(result.data, { status: 201 })
}
