/**
 * Importação de mídia direto do Google Drive para o Supabase Storage.
 *
 * Fluxo:
 *  1. Cliente envia o ID/URL da pasta do Drive
 *  2. Backend lista os arquivos via Drive API (precisa de GOOGLE_DRIVE_API_KEY)
 *  3. Para cada arquivo, baixa e dá upload no nosso bucket
 *  4. Registra cada um na tabela product_media
 *
 * Sem GOOGLE_DRIVE_API_KEY, o serviço retorna erro "NO_DRIVE_KEY".
 *
 * Pasta precisa ser pública ou compartilhada com a chave de API
 * (geralmente: clique direito → Compartilhar → Qualquer um com o link).
 */

import { uploadProductMedia, type UploadResult } from "./upload"
import { addMedia, type MediaRole } from "./media-repo"

export type DriveImportResult =
  | { ok: true; imported: number; skipped: number; errors: string[] }
  | { ok: false; error: { code: string; message: string } }

type DriveFile = {
  id: string
  name: string
  mimeType: string
  size?: string
}

const DRIVE_API = "https://www.googleapis.com/drive/v3"

function extractFolderId(input: string): string | null {
  // Aceita ID puro, /folders/ID, /drive/folders/ID, etc.
  if (/^[a-zA-Z0-9_-]{10,}$/.test(input)) return input
  const m = input.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  return m ? m[1] : null
}

const ALLOWED_MIMES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/avif",
  "video/mp4", "video/webm", "video/quicktime",
])

function inferKind(mimeType: string): "image" | "video" | null {
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType.startsWith("video/")) return "video"
  return null
}

export async function importDriveFolder(opts: {
  productId: string
  folderInput: string
  /** Limite de arquivos pra importar de uma vez (proteção contra pasta gigante) */
  limit?: number
}): Promise<DriveImportResult> {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY
  if (!apiKey) {
    return {
      ok: false,
      error: {
        code: "NO_DRIVE_KEY",
        message: "GOOGLE_DRIVE_API_KEY não configurada. Adicione nas variáveis de ambiente.",
      },
    }
  }

  const folderId = extractFolderId(opts.folderInput.trim())
  if (!folderId) {
    return {
      ok: false,
      error: {
        code: "INVALID_FOLDER",
        message: "ID/URL de pasta do Drive inválido.",
      },
    }
  }

  const limit = Math.min(opts.limit ?? 30, 100)

  // 1) Lista arquivos da pasta
  let files: DriveFile[]
  try {
    const listUrl = `${DRIVE_API}/files?` + new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id,name,mimeType,size)",
      pageSize: String(limit),
      key: apiKey,
    }).toString()
    const res = await fetch(listUrl)
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return {
        ok: false,
        error: {
          code: "DRIVE_LIST_FAILED",
          message: `Drive API ${res.status}: ${text.slice(0, 200)}`,
        },
      }
    }
    const data = await res.json() as { files?: DriveFile[] }
    files = data.files ?? []
  } catch (e) {
    return {
      ok: false,
      error: {
        code: "DRIVE_LIST_FAILED",
        message: e instanceof Error ? e.message : "Erro ao listar Drive",
      },
    }
  }

  if (files.length === 0) {
    return { ok: true, imported: 0, skipped: 0, errors: ["Pasta vazia ou sem permissão de acesso."] }
  }

  // 2) Para cada arquivo: download + upload pro storage + registrar na product_media
  let imported = 0
  let skipped = 0
  const errors: string[] = []

  for (const f of files) {
    const kind = inferKind(f.mimeType)
    if (!kind || !ALLOWED_MIMES.has(f.mimeType)) {
      skipped++
      continue
    }

    try {
      // Download via alt=media
      const dlUrl = `${DRIVE_API}/files/${f.id}?alt=media&key=${apiKey}`
      const dl = await fetch(dlUrl)
      if (!dl.ok) {
        errors.push(`${f.name}: download ${dl.status}`)
        continue
      }
      const blob = await dl.blob()
      const file = new File([blob], f.name, { type: f.mimeType })

      const upResult: UploadResult = await uploadProductMedia({
        productId: opts.productId,
        kind,
        file,
      })

      if (!upResult.ok) {
        errors.push(`${f.name}: ${upResult.error.message}`)
        continue
      }

      // Registra na tabela product_media
      const role: MediaRole = kind === "video"
        ? "video"
        : (imported === 0 ? "cover" : imported === 1 ? "hover" : "gallery")

      const addResult = await addMedia({
        productId: opts.productId,
        url: upResult.url,
        storagePath: upResult.path,
        kind,
        role,
        alt: f.name,
      })
      if (!addResult.ok) {
        errors.push(`${f.name}: ${addResult.error.message}`)
        continue
      }
      imported++
    } catch (e) {
      errors.push(`${f.name}: ${e instanceof Error ? e.message : "erro"}`)
    }
  }

  return { ok: true, imported, skipped, errors }
}

export function isDriveConfigured(): boolean {
  return !!process.env.GOOGLE_DRIVE_API_KEY
}
