"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  Loader2, AlertCircle, ImageIcon, VideoIcon, Trash2,
  X, GripVertical, RefreshCw, FolderInput, ChevronDown,
} from "lucide-react"
import type { ProductMedia, MediaRole, MediaKind } from "@/lib/services/media-repo"

const ROLE_OPTIONS: { value: MediaRole; label: string; tone: string }[] = [
  { value: "cover", label: "Capa", tone: "bg-emerald-500/90 text-black" },
  { value: "hover", label: "Hover", tone: "bg-blue-500/90 text-white" },
  { value: "front", label: "Frente", tone: "bg-purple-500/80 text-white" },
  { value: "back", label: "Costas", tone: "bg-pink-500/80 text-white" },
  { value: "detail", label: "Detalhe", tone: "bg-orange-500/80 text-white" },
  { value: "model", label: "Modelo", tone: "bg-cyan-500/80 text-white" },
  { value: "lifestyle", label: "Lifestyle", tone: "bg-amber-500/80 text-black" },
  { value: "gallery", label: "Galeria", tone: "bg-neutral-700 text-neutral-200" },
  { value: "video", label: "Vídeo", tone: "bg-rose-500/80 text-white" },
]

const ROLE_LABEL = Object.fromEntries(ROLE_OPTIONS.map(r => [r.value, r.label]))
const ROLE_TONE = Object.fromEntries(ROLE_OPTIONS.map(r => [r.value, r.tone]))

type Props = {
  productId: string
  /** Imagens legadas no campo `images[]` do produto — pra mostrar botão de migração */
  legacyImagesCount?: number
  /** Callback quando a mídia muda (upload, delete, reorder, role change, migrate) */
  onMediaChange?: (media: ProductMedia[]) => void
}

export function MediaManager({ productId, legacyImagesCount = 0, onMediaChange }: Props) {
  const [media, setMedia] = useState<ProductMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [migrating, setMigrating] = useState(false)
  const [migrateMsg, setMigrateMsg] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [dropTargetId, setDropTargetId] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Notifica parent quando mídia muda (pra checklist visual atualizar)
  useEffect(() => {
    if (!loading && onMediaChange) onMediaChange(media)
  }, [media, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Drive importer state
  const [driveOpen, setDriveOpen] = useState(false)
  const [driveFolder, setDriveFolder] = useState("")
  const [driveImporting, setDriveImporting] = useState(false)
  const [driveResult, setDriveResult] = useState<string | null>(null)
  const [driveConfigured, setDriveConfigured] = useState<boolean | null>(null)

  // Checa se Drive API está configurada quando o painel abre
  useEffect(() => {
    if (driveOpen && driveConfigured === null) {
      fetch(`/api/admin/products/${productId}/drive-import`)
        .then(r => r.json())
        .then(d => setDriveConfigured(d.configured ?? false))
        .catch(() => setDriveConfigured(false))
    }
  }, [driveOpen, driveConfigured, productId])

  const handleDriveImport = async () => {
    if (!driveFolder.trim()) return
    setDriveImporting(true)
    setDriveResult(null)
    try {
      const res = await fetch(`/api/admin/products/${productId}/drive-import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderInput: driveFolder.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = typeof data.error === "object" ? data.error.message : data.error
        throw new Error(msg ?? `HTTP ${res.status}`)
      }
      const errs = data.errors?.length ? ` · ${data.errors.length} erro(s)` : ""
      setDriveResult(`✓ Importadas: ${data.imported} · Ignoradas: ${data.skipped}${errs}`)
      load()
    } catch (e) {
      setDriveResult(`Erro: ${e instanceof Error ? e.message : "desconhecido"}`)
    } finally {
      setDriveImporting(false)
    }
  }

  // ===== Carrega lista =====
  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/media`, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setMedia(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar mídia")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [productId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ===== Upload =====
  const uploadFile = async (file: File, kind: MediaKind): Promise<void> => {
    // 1) Upload pro Storage
    const fd = new FormData()
    fd.append("file", file)
    fd.append("productId", productId)
    fd.append("kind", kind)
    const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd })
    const upData = await upRes.json()
    if (!upRes.ok) {
      const msg = typeof upData.error === "object" ? upData.error.message : upData.error
      throw new Error(msg ?? `Upload falhou (${upRes.status})`)
    }

    // 2) Registra na tabela product_media
    const role: MediaRole = kind === "video" ? "video" : (media.length === 0 ? "cover" : media.length === 1 ? "hover" : "gallery")
    const addRes = await fetch(`/api/admin/products/${productId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: upData.url,
        storagePath: upData.path,
        kind,
        role,
        alt: file.name,
      }),
    })
    if (!addRes.ok) throw new Error(`Falha ao registrar mídia (${addRes.status})`)
    const newItem: ProductMedia = await addRes.json()
    setMedia(prev => [...prev, newItem])
  }

  const handleFiles = async (files: FileList | File[], kind: MediaKind) => {
    setError(null)
    const arr = Array.from(files)
    if (arr.length === 0) return
    const filesToUpload = kind === "video" ? [arr[0]] : arr
    setUploading(true)
    setProgress({ current: 0, total: filesToUpload.length })
    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        setProgress({ current: i + 1, total: filesToUpload.length })
        await uploadFile(filesToUpload[i], kind)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no upload")
    } finally {
      setUploading(false)
      setProgress(null)
      if (inputRef.current) inputRef.current.value = ""
      if (videoInputRef.current) videoInputRef.current.value = ""
    }
  }

  // ===== Mudar role =====
  const handleRoleChange = async (mediaId: number, role: MediaRole) => {
    // Se for "cover" ou "hover", só uma imagem pode ter — desmarca outras
    setMedia(prev => prev.map(m => {
      if (m.id === mediaId) return { ...m, role }
      if ((role === "cover" || role === "hover") && m.role === role) return { ...m, role: "gallery" }
      return m
    }))
    try {
      const res = await fetch(`/api/admin/products/${productId}/media/${mediaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) throw new Error(`PATCH ${res.status}`)
      // Se foi cover/hover, garante que só essa tem o role
      if (role === "cover" || role === "hover") {
        const others = media.filter(m => m.id !== mediaId && m.role === role)
        await Promise.all(others.map(m =>
          fetch(`/api/admin/products/${productId}/media/${m.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "gallery" }),
          })
        ))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar role")
      // Recarrega pra ficar consistente
      load()
    }
  }

  // ===== Remover =====
  const handleRemove = async (item: ProductMedia) => {
    if (!confirm(`Remover esta mídia?\nO arquivo também será apagado do storage.`)) return
    setMedia(prev => prev.filter(m => m.id !== item.id))
    try {
      await fetch(`/api/admin/products/${productId}/media/${item.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath: item.storagePath }),
      })
    } catch {
      // recarrega se falhou
      load()
    }
  }

  // ===== Drag & Drop reorder =====
  const onDragStart = (id: number) => setDraggedId(id)
  const onDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault()
    if (draggedId !== null && draggedId !== id) setDropTargetId(id)
  }
  const onDragLeave = () => setDropTargetId(null)
  const onDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault()
    setDropTargetId(null)
    if (draggedId === null || draggedId === targetId) {
      setDraggedId(null)
      return
    }

    const fromIdx = media.findIndex(m => m.id === draggedId)
    const toIdx = media.findIndex(m => m.id === targetId)
    if (fromIdx < 0 || toIdx < 0) { setDraggedId(null); return }

    const next = [...media]
    const [moved] = next.splice(fromIdx, 1)
    next.splice(toIdx, 0, moved)
    setMedia(next)
    setDraggedId(null)

    // Persiste
    try {
      const res = await fetch(`/api/admin/products/${productId}/media/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: next.map(m => m.id) }),
      })
      if (!res.ok) throw new Error(`Reorder ${res.status}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao reordenar")
      load()
    }
  }

  // ===== Migração do array images[] =====
  const handleMigrate = async () => {
    setMigrating(true)
    setMigrateMsg(null)
    try {
      const res = await fetch(`/api/admin/products/${productId}/media/migrate`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro")
      setMigrateMsg(data.message)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro na migração")
    } finally {
      setMigrating(false)
    }
  }

  const images = media.filter(m => m.kind === "image")
  const videos = media.filter(m => m.kind === "video")

  return (
    <div className="space-y-3">
      {/* Migração do array antigo — só mostra se houver imagens legadas e nada na tabela */}
      {legacyImagesCount > 0 && media.length === 0 && !loading && (
        <div className="flex items-start gap-2 rounded border border-yellow-900/40 bg-yellow-950/20 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-yellow-300">
              Este produto tem {legacyImagesCount} imagem(ns) no formato antigo
            </p>
            <p className="mt-0.5 text-[10px] text-yellow-400/80">
              Migre pra estrutura nova com role e drag-drop. Idempotente — pode rodar várias vezes.
            </p>
          </div>
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="flex h-7 items-center gap-1 rounded bg-yellow-600 px-2.5 text-[10px] font-medium text-black hover:bg-yellow-500 disabled:opacity-50"
          >
            {migrating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Migrar agora
          </button>
        </div>
      )}
      {migrateMsg && (
        <p className="text-[11px] text-emerald-400">{migrateMsg}</p>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded border border-red-900/50 bg-red-950/30 p-2 text-[11px] text-red-400">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-300 hover:text-red-100">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Drive importer */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/30">
        <button
          onClick={() => setDriveOpen(!driveOpen)}
          className="flex w-full items-center justify-between gap-2 p-2.5 text-left"
        >
          <span className="flex items-center gap-2 text-[11px] font-medium text-neutral-300">
            <FolderInput className="h-3.5 w-3.5" />
            Importar de uma pasta do Drive
          </span>
          <ChevronDown className={`h-3.5 w-3.5 text-neutral-500 transition-transform ${driveOpen ? "rotate-180" : ""}`} />
        </button>
        {driveOpen && (
          <div className="space-y-2 border-t border-neutral-800 p-2.5">
            {driveConfigured === false && (
              <div className="rounded border border-yellow-900/40 bg-yellow-950/20 p-2 text-[10px] text-yellow-300">
                <strong>GOOGLE_DRIVE_API_KEY</strong> não configurada nas variáveis de ambiente.
                Adicione no Vercel → Settings → Environment Variables. A pasta do Drive precisa
                estar pública ou compartilhada com a chave.
              </div>
            )}
            <input
              type="text"
              value={driveFolder}
              onChange={(e) => setDriveFolder(e.target.value)}
              placeholder="ID ou URL da pasta (ex: https://drive.google.com/drive/folders/abc123...)"
              className="h-9 w-full rounded border border-neutral-800 bg-neutral-900 px-3 text-[11px] text-white outline-none focus:border-neutral-600"
              disabled={driveImporting}
            />
            <button
              onClick={handleDriveImport}
              disabled={driveImporting || !driveFolder.trim()}
              className="flex h-8 items-center gap-1.5 rounded bg-emerald-600 px-3 text-[11px] font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {driveImporting
                ? <><Loader2 className="h-3 w-3 animate-spin" /> Importando...</>
                : <><FolderInput className="h-3 w-3" /> Importar pasta</>}
            </button>
            <p className="text-[10px] text-neutral-500">
              Lista até 30 arquivos. Imagens viram a galeria; primeira fica como capa, segunda como hover.
              Vídeos viram o vídeo do produto. Os arquivos são copiados pro nosso Storage — Drive vira só backup.
            </p>
            {driveResult && (
              <p className={`text-[11px] ${driveResult.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>
                {driveResult}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Imagens */}
      <div>
        <span className="block mb-1.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
          Imagens ({images.length})
        </span>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); if (uploading) return; handleFiles(e.dataTransfer.files, "image") }}
          onClick={() => !uploading && inputRef.current?.click()}
          className="cursor-pointer rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-900/30 p-3 transition-colors hover:border-neutral-500 hover:bg-neutral-900/50"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files, "image")}
            className="sr-only"
          />
          <div className="flex flex-col items-center gap-1 text-center">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                <p className="text-[11px] text-neutral-400">
                  Enviando{progress ? ` ${progress.current}/${progress.total}` : "..."}
                </p>
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4 text-neutral-500" />
                <p className="text-[11px] text-neutral-300">
                  Arraste imagens ou <span className="text-emerald-400 underline">clique</span>
                </p>
                <p className="text-[10px] text-neutral-500">JPEG/PNG/WebP/AVIF · 10MB cada</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid de imagens — drag-drop */}
      {loading ? (
        <div className="flex items-center gap-2 text-[11px] text-neutral-500">
          <Loader2 className="h-3 w-3 animate-spin" /> Carregando mídia...
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((item) => (
            <ImageCard
              key={item.id}
              item={item}
              isDragging={draggedId === item.id}
              isDropTarget={dropTargetId === item.id}
              onDragStart={() => onDragStart(item.id)}
              onDragOver={(e) => onDragOver(e, item.id)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, item.id)}
              onRoleChange={(role) => handleRoleChange(item.id, role)}
              onRemove={() => handleRemove(item)}
            />
          ))}
        </div>
      ) : null}

      {/* Vídeo */}
      <div>
        <span className="block mb-1.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
          Vídeo ({videos.length})
        </span>
        {videos.length === 0 ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); if (uploading) return; handleFiles(e.dataTransfer.files, "video") }}
            onClick={() => !uploading && videoInputRef.current?.click()}
            className="cursor-pointer rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-900/30 p-3"
          >
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(e) => e.target.files && handleFiles(e.target.files, "video")}
              className="sr-only"
            />
            <div className="flex flex-col items-center gap-1 text-center">
              <VideoIcon className="h-4 w-4 text-neutral-500" />
              <p className="text-[11px] text-neutral-300">
                Arraste um vídeo ou <span className="text-emerald-400 underline">clique</span>
              </p>
              <p className="text-[10px] text-neutral-500">MP4/WebM/MOV · 50MB</p>
            </div>
          </div>
        ) : (
          videos.map(v => (
            <div key={v.id} className="flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900 p-2">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-neutral-800">
                <VideoIcon className="h-5 w-5 text-neutral-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[10px] text-neutral-400">{v.url}</p>
                <a href={v.url} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-400 underline">Ver vídeo</a>
              </div>
              <button onClick={() => handleRemove(v)} className="rounded p-1.5 text-red-500 hover:bg-red-950/40">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ===== Subcomponente: card de imagem com drag, role e remover =====

function ImageCard({
  item, isDragging, isDropTarget,
  onDragStart, onDragOver, onDragLeave, onDrop,
  onRoleChange, onRemove,
}: {
  item: ProductMedia
  isDragging: boolean
  isDropTarget: boolean
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onRoleChange: (r: MediaRole) => void
  onRemove: () => void
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`group relative aspect-square overflow-hidden rounded border bg-neutral-900 transition-all ${
        isDragging ? "opacity-40 scale-95" : ""
      } ${
        isDropTarget ? "border-emerald-500 ring-2 ring-emerald-500/40" : "border-neutral-800"
      }`}
    >
      <Image src={item.url} alt={item.alt ?? ""} fill className="object-cover" sizes="160px" unoptimized />

      {/* Badge de role */}
      <span className={`absolute left-1 top-1 rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${ROLE_TONE[item.role] ?? "bg-neutral-700 text-neutral-200"}`}>
        {ROLE_LABEL[item.role] ?? item.role}
      </span>

      {/* Drag handle */}
      <span className="absolute right-1 top-1 flex h-5 w-5 cursor-grab items-center justify-center rounded bg-black/70 text-white opacity-0 group-hover:opacity-100">
        <GripVertical className="h-3 w-3" />
      </span>

      {/* Overlay hover */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        <select
          value={item.role}
          onChange={(e) => onRoleChange(e.target.value as MediaRole)}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded bg-neutral-800 px-1.5 py-0.5 text-[9px] text-white outline-none"
        >
          {ROLE_OPTIONS.filter(r => r.value !== "video").map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <button
          onClick={onRemove}
          className="flex h-5 items-center justify-center gap-1 rounded bg-red-600/90 text-[9px] font-medium text-white hover:bg-red-500"
        >
          <Trash2 className="h-2.5 w-2.5" /> Remover
        </button>
      </div>
    </div>
  )
}
