/**
 * Upload de mídia de produto para o Supabase Storage.
 *
 * Bucket: `product-media` (público, leitura aberta)
 * Estrutura: products/{productId}/{tipo}/{hash}-{nome-original}
 *
 * O hash garante que dois uploads do mesmo arquivo gerem nomes diferentes,
 * evitando cache stale entre edições.
 */

import { getSupabase } from "@/lib/supabase"

export type UploadKind = "image" | "video"

export type UploadResult =
  | { ok: true; url: string; path: string; size: number; mimeType: string }
  | { ok: false; error: { code: string; message: string } }

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif",
])
const ALLOWED_VIDEO_MIMES = new Set([
  "video/mp4", "video/webm", "video/quicktime",
])

const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024 // 50MB

const BUCKET = "product-media"

function sanitizeName(name: string): string {
  // Remove diretórios, normaliza acentos, troca espaços por hífen
  const base = name.split(/[/\\]/).pop() ?? "file"
  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80) || "file"
}

async function shortHash(bytes: ArrayBuffer): Promise<string> {
  // SHA-1 de 8 chars — só pra evitar colisão de nome
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const hash = await crypto.subtle.digest("SHA-1", bytes)
    const hex = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    return hex.slice(0, 8)
  }
  // Fallback (não deveria precisar em runtime moderno)
  return Math.random().toString(36).slice(2, 10)
}

export async function uploadProductMedia(opts: {
  productId: string
  kind: UploadKind
  file: File
}): Promise<UploadResult> {
  const { productId, kind, file } = opts

  // ===== Validações que NÃO dependem de banco (rodam primeiro) =====

  // Validação de productId — evita path traversal
  if (!/^[a-zA-Z0-9_-]+$/.test(productId)) {
    return {
      ok: false,
      error: { code: "INVALID_PRODUCT_ID", message: "productId inválido." },
    }
  }

  // Validação de tipo
  const allowed = kind === "image" ? ALLOWED_IMAGE_MIMES : ALLOWED_VIDEO_MIMES
  if (!allowed.has(file.type)) {
    return {
      ok: false,
      error: {
        code: "INVALID_TYPE",
        message: `Tipo não permitido: ${file.type}. Aceitos: ${[...allowed].join(", ")}.`,
      },
    }
  }

  // Validação de tamanho
  const maxBytes = kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES
  if (file.size > maxBytes) {
    return {
      ok: false,
      error: {
        code: "TOO_LARGE",
        message: `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(1)}MB. Máximo: ${(maxBytes / 1024 / 1024).toFixed(0)}MB.`,
      },
    }
  }

  // ===== A partir daqui, precisamos de Supabase =====
  const sb = getSupabase()
  if (!sb) {
    return {
      ok: false,
      error: {
        code: "NO_DB",
        message: "Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_KEY.",
      },
    }
  }

  const bytes = await file.arrayBuffer()
  const hash = await shortHash(bytes)
  const safeName = sanitizeName(file.name)
  const path = `products/${productId}/${kind}/${hash}-${safeName}`

  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      cacheControl: "31536000", // 1 ano (path muda quando arquivo muda)
      upsert: false,
    })

  if (error) {
    // Se já existe um arquivo idêntico (hash igual), só pega a URL pública dele
    if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
      const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path)
      return {
        ok: true,
        url: pub.publicUrl,
        path,
        size: file.size,
        mimeType: file.type,
      }
    }
    return { ok: false, error: { code: "UPLOAD_FAILED", message: error.message } }
  }

  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path)
  return {
    ok: true,
    url: pub.publicUrl,
    path,
    size: file.size,
    mimeType: file.type,
  }
}

/**
 * Remove um arquivo do bucket. Aceita URL pública ou path interno.
 */
export async function deleteProductMedia(urlOrPath: string): Promise<{ ok: boolean; message?: string }> {
  const sb = getSupabase()
  if (!sb) return { ok: false, message: "Supabase não configurado." }

  // Extrai o path interno se vier URL pública
  let path = urlOrPath
  const marker = `/object/public/${BUCKET}/`
  const idx = urlOrPath.indexOf(marker)
  if (idx >= 0) {
    path = urlOrPath.slice(idx + marker.length)
  } else if (urlOrPath.startsWith(`/${BUCKET}/`)) {
    path = urlOrPath.slice(BUCKET.length + 2)
  }

  // Sanity check: só apaga arquivos do nosso prefixo
  if (!path.startsWith("products/")) {
    return { ok: false, message: "Path fora do prefixo permitido." }
  }

  const { error } = await sb.storage.from(BUCKET).remove([path])
  if (error) return { ok: false, message: error.message }
  return { ok: true }
}
