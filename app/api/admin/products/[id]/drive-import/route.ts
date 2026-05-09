import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth/admin"
import { importDriveFolder, isDriveConfigured } from "@/lib/services/drive-import"

type Ctx = { params: Promise<{ id: string }> }

export const runtime = "nodejs"
export const maxDuration = 120 // pasta com vários arquivos pode demorar

/**
 * GET → checa se Drive API está configurada.
 * POST { folderInput: string, limit?: number } → roda a importação.
 */

export async function GET(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  return NextResponse.json({ configured: isDriveConfigured() })
}

export async function POST(request: Request, { params }: Ctx) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  const { id } = await params

  let body: { folderInput?: string; limit?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 })
  }
  if (!body.folderInput) {
    return NextResponse.json({ error: "folderInput obrigatório." }, { status: 400 })
  }

  const result = await importDriveFolder({
    productId: id,
    folderInput: body.folderInput,
    limit: body.limit,
  })

  if (!result.ok) {
    const status =
      result.error.code === "NO_DRIVE_KEY" ? 503
        : result.error.code === "INVALID_FOLDER" ? 400
        : result.error.code === "DRIVE_LIST_FAILED" ? 502
        : 500
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json(result)
}
