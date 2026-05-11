"use client"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import {
  Upload, X, Loader2, ArrowUp, ArrowDown, AlertCircle,
  ImageIcon, Video as VideoIcon, Trash2,
} from "lucide-react"

type MediaKind = "image" | "video"

type Props = {
  productId: string
  /** valor atual: lista de URLs (imagens) ou URL única (vídeo) */
  value: string[]
  onChange: (urls: string[]) => void
  kind: MediaKind
  /** vídeo só aceita 1 arquivo, imagens N */
  multiple?: boolean
  label?: string
}

/**
 * Uploader genérico para imagens ou vídeo de produto.
 *
 * - Drag & drop ou seleção manual
 * - Preview thumbnail
 * - Reordenar (setas)
 * - Remover (com confirmação que apaga do Storage também)
 * - Validação client-side básica antes de subir
 */
export function MediaUploader({
  productId, value, onChange, kind, multiple = kind === "image", label,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = kind === "image"
    ? "image/jpeg,image/png,image/webp,image/avif"
    : "video/mp4,video/webm,video/quicktime"

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("productId", productId)
    fd.append("kind", kind)

    const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg = typeof data.error === "object" ? data.error.message : data.error
      throw new Error(msg ?? `HTTP ${res.status}`)
    }
    return data.url as string
  }, [productId, kind])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError(null)
    const arr = Array.from(files)
    if (arr.length === 0) return

    // Vídeo: pega só o primeiro
    const filesToUpload = multiple ? arr : [arr[0]]

    setUploading(true)
    setProgress({ current: 0, total: filesToUpload.length })
    const newUrls: string[] = []
    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        setProgress({ current: i + 1, total: filesToUpload.length })
        const url = await uploadFile(filesToUpload[i])
        if (url) newUrls.push(url)
      }
      // Vídeo substitui; imagem acrescenta
      onChange(multiple ? [...value, ...newUrls] : newUrls)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no upload")
    } finally {
      setUploading(false)
      setProgress(null)
      if (inputRef.current) inputRef.current.value = ""
    }
  }, [uploadFile, value, onChange, multiple])

  const handleRemove = async (url: string, idx: number) => {
    // Remove da lista imediatamente (otimista)
    onChange(value.filter((_, i) => i !== idx))
    // Tenta remover do storage (sem bloquear se falhar)
    try {
      await fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
    } catch {
      // não rollback — o item já foi tirado da UI; arquivo órfão pode ser limpo depois
    }
  }

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return
    const next = [...value]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (uploading) return
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-2">
      {label && (
        <span className="block text-[10px] font-medium uppercase tracking-wider text-neutral-400">
          {label}
        </span>
      )}

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-4 transition-colors ${
          isDragging
            ? "border-emerald-500 bg-emerald-950/20"
            : uploading
            ? "border-neutral-700 bg-neutral-900/50 cursor-wait"
            : "border-neutral-700 bg-neutral-900/30 hover:border-neutral-500 hover:bg-neutral-900/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="sr-only"
        />
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
              <p className="text-xs text-neutral-400">
                Enviando{progress ? ` ${progress.current}/${progress.total}` : "..."}
              </p>
            </>
          ) : (
            <>
              {kind === "image"
                ? <ImageIcon className="h-5 w-5 text-neutral-500" />
                : <VideoIcon className="h-5 w-5 text-neutral-500" />}
              <p className="text-xs text-neutral-300">
                Arraste {kind === "image" ? "imagens" : "um vídeo"} ou{" "}
                <span className="text-emerald-400 underline">clique pra selecionar</span>
              </p>
              <p className="text-[10px] text-neutral-500">
                {kind === "image"
                  ? "JPEG, PNG, WebP, AVIF · até 10MB cada"
                  : "MP4, WebM, MOV · até 50MB"}
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded border border-red-900/50 bg-red-950/30 p-2 text-[11px] text-red-400">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Lista de mídias */}
      {value.length > 0 && (
        <div className={kind === "image" ? "grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5" : "space-y-2"}>
          {value.map((url, idx) => (
            <MediaThumb
              key={url}
              url={url}
              kind={kind}
              isFirst={idx === 0}
              isLast={idx === value.length - 1}
              isCover={kind === "image" && idx === 0}
              isHover={kind === "image" && idx === 1}
              onMoveUp={() => moveItem(idx, idx - 1)}
              onMoveDown={() => moveItem(idx, idx + 1)}
              onRemove={() => handleRemove(url, idx)}
            />
          ))}
        </div>
      )}

      {kind === "image" && value.length > 0 && (
        <p className="text-[10px] text-neutral-500">
          A primeira imagem é a <span className="text-emerald-400">capa</span>.
          A segunda aparece no <span className="text-blue-400">hover</span> do card. Use as setas pra reordenar.
        </p>
      )}
    </div>
  )
}

function MediaThumb({
  url, kind, isFirst, isLast, isCover, isHover, onMoveUp, onMoveDown, onRemove,
}: {
  url: string
  kind: MediaKind
  isFirst: boolean
  isLast: boolean
  isCover: boolean
  isHover: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}) {
  const [confirming, setConfirming] = useState(false)

  if (kind === "video") {
    return (
      <div className="flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900 p-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-neutral-800">
          <VideoIcon className="h-5 w-5 text-neutral-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[10px] text-neutral-400">{url}</p>
          <a href={url} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-400 underline">Ver vídeo</a>
        </div>
        <button
          onClick={confirming ? onRemove : () => setConfirming(true)}
          onMouseLeave={() => setConfirming(false)}
          className={`rounded p-1.5 ${confirming ? "bg-red-900/50 text-red-300" : "text-red-500 hover:bg-red-950/40"}`}
          title={confirming ? "Confirmar exclusão" : "Remover"}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="group relative aspect-square overflow-hidden rounded border border-neutral-800 bg-neutral-900">
      <Image src={url} alt="" fill className="object-cover" sizes="120px" unoptimized />

      {/* Overlay gradiente no hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Badge de capa/hover */}
      {isCover && (
        <span className="absolute left-1 top-1 rounded bg-emerald-500/90 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-black">
          Capa
        </span>
      )}
      {isHover && (
        <span className="absolute left-1 top-1 rounded bg-blue-500/90 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
          Hover
        </span>
      )}

      {/* Botões */}
      <div className="absolute inset-x-1 bottom-1 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex gap-0.5">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="flex h-6 w-6 items-center justify-center rounded bg-black/70 text-white backdrop-blur disabled:opacity-30"
            title="Mover para cima"
          >
            <ArrowUp className="h-3 w-3" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="flex h-6 w-6 items-center justify-center rounded bg-black/70 text-white backdrop-blur disabled:opacity-30"
            title="Mover para baixo"
          >
            <ArrowDown className="h-3 w-3" />
          </button>
        </div>
        <button
          onClick={confirming ? onRemove : () => setConfirming(true)}
          onMouseLeave={() => setConfirming(false)}
          className={`flex h-6 w-6 items-center justify-center rounded backdrop-blur ${
            confirming ? "bg-red-600 text-white" : "bg-black/70 text-red-400"
          }`}
          title={confirming ? "Confirmar exclusão" : "Remover"}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
