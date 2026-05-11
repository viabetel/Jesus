import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth/admin"
import { getProductById } from "@/lib/services/products-repo"
import { migrateImagesToMedia } from "@/lib/services/media-repo"

type Ctx = { params: Promise<{ id: string }> }

/**
 * POST /api/admin/products/[id]/media/migrate
 * Migra `images[]` + `video` do produto para a tabela product_media.
 * Idempotente — só roda se ainda não houver mídia estruturada.
 */
export async function POST(request: Request, { params }: Ctx) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 })

  try {
    const result = await migrateImagesToMedia(id, product.images, product.video)
    return NextResponse.json({
      ok: true,
      migrated: result.migrated,
      message: result.migrated > 0
        ? `${result.migrated} mídia(s) migradas.`
        : "Nada a migrar (já existe mídia ou produto sem imagens).",
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    )
  }
}
