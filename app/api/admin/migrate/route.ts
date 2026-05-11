import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth/admin"
import { migrateLegacyProducts } from "@/lib/services/products-repo"

/**
 * POST /api/admin/migrate
 *
 * Roda a migração one-shot do array estático para o Supabase.
 * Idempotente: usa upsert. Pode ser chamado várias vezes sem duplicar.
 *
 * Use uma vez ao plugar o Supabase, depois pode ignorar.
 */
export async function POST(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }
  try {
    const result = await migrateLegacyProducts()
    return NextResponse.json({
      ok: true,
      message: `Migrados ${result.products} produtos e ${result.variants} variantes.`,
      ...result,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro na migração." },
      { status: 500 }
    )
  }
}
