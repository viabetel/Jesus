"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import {
  Loader2, AlertCircle, ImageIcon, VideoIcon, Trash2,
  X, GripVertical, RefreshCw, ChevronDown, Upload,
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

type ColorOption = { key: string; name: string; hex: string }

type DriveStatus = { configured: boolean } | null
type DriveImportResponse = { ok?: boolean; imported?: number; skipped?: number; errors?: string[]; error?: string | { code?: string; message?: string } }

type Props = {
  productId: string
  legacyImagesCount?: number
  onMediaChange?: (media: ProductMedia[]) => void
  /** Cores disponíveis das variantes (pra saber quais grupos mostrar) */
  availableColors?: ColorOption[]
}

export function MediaManager({ productId, legacyImagesCount = 0, onMediaChange, availableColors = [] }: Props) {
  const [media, setMedia] = useState<ProductMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [migrating, setMigrating] = useState(false)
  const [migrateMsg, setMigrateMsg] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [dropTargetId, setDropTargetId] = useState<number | null>(null)
  const [uploadColorKey, setUploadColorKey] = useState<string>("__general__")
  const [driveOpen, setDriveOpen] = useState(false)
  const [driveStatus, setDriveStatus] = useState<DriveStatus>(null)
  const [driveInput, setDriveInput] = useState("")
  const [driveLimit, setDriveLimit] = useState(30)
  const [driveColorKey, setDriveColorKey] = useState<string>("__general__")
  const [driveImporting, setDriveImporting] = useState(false)
  const [driveMessage, setDriveMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading && onMediaChange) onMediaChange(media)
  }, [media, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  // ===== Carrega =====
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

  // ===== Google Drive =====
  const parseApiError = async (res: Response, fallback: string) => {
    try {
      const data = await res.json() as DriveImportResponse
      const raw = data.error
      if (typeof raw === "string") return raw
      if (raw && typeof raw === "object" && raw.message) return raw.message
      if (raw && typeof raw === "object" && raw.code) return raw.code
    } catch {}
    return fallback
  }

  const loadDriveStatus = async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/drive-import`, { cache: "no-store" })
      if (!res.ok) return
      setDriveStatus(await res.json() as DriveStatus)
    } catch {
      setDriveStatus(null)
    }
  }

  useEffect(() => { loadDriveStatus() }, [productId]) // eslint-disable-line react-hooks/exhaustive-deps

  const getColorPayload = (colorKey: string) => {
    if (colorKey === "__general__") return { colorKey: null, colorName: null, colorHex: null }
    const c = availableColors.find(cc => cc.key === colorKey)
    return {
      colorKey,
      colorName: c?.name ?? colorKey,
      colorHex: c?.hex ?? null,
    }
  }

  const handleDriveImport = async () => {
    setError(null)
    setDriveMessage(null)
    const folderInput = driveInput.trim()
    if (!folderInput) {
      setError("Informe a URL ou o ID da pasta do Google Drive.")
      return
    }

    setDriveImporting(true)
    try {
      const color = getColorPayload(driveColorKey)
      const res = await fetch(`/api/admin/products/${productId}/drive-import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderInput,
          limit: driveLimit,
          ...color,
        }),
      })

      const data = await res.json() as DriveImportResponse
      if (!res.ok || data.ok === false) {
        const raw = data.error
        const message = typeof raw === "string" ? raw : raw && typeof raw === "object" ? raw.message : undefined
        throw new Error(message ?? `Falha ao importar do Drive (${res.status})`)
      }

      const errors = data.errors?.length ? ` · ${data.errors.length} aviso(s)` : ""
      setDriveMessage(`Importação concluída: ${data.imported ?? 0} arquivo(s) importado(s), ${data.skipped ?? 0} ignorado(s)${errors}.`)
      setDriveInput("")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao importar do Google Drive")
    } finally {
      setDriveImporting(false)
    }
  }

  // ===== Grupos por cor =====
  const groups = useMemo(() => {
    // Grupo geral + um grupo por cor que tenha mídia ou que exista nas variantes
    const colorKeys = new Set<string>()
    for (const m of media) {
      if (m.colorKey) colorKeys.add(m.colorKey)
    }
    for (const c of availableColors) {
      colorKeys.add(c.key)
    }

    const result: { key: string; label: string; hex: string | null; items: ProductMedia[] }[] = []

    // Geral
    const general = media.filter(m => !m.colorKey)
    result.push({ key: "__general__", label: "Geral do produto", hex: null, items: general })

    // Por cor
    for (const key of colorKeys) {
      const colorInfo = availableColors.find(c => c.key === key)
      const items = media.filter(m => m.colorKey === key)
      const label = colorInfo?.name ?? media.find(m => m.colorKey === key)?.colorName ?? key
      const hex = colorInfo?.hex ?? media.find(m => m.colorKey === key)?.colorHex ?? null
      result.push({ key, label, hex, items })
    }

    return result
  }, [media, availableColors])

  // ===== Upload =====
  const getColorForUpload = () => getColorPayload(uploadColorKey)

  const uploadFile = async (file: File, kind: MediaKind): Promise<void> => {
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

    const color = getColorForUpload()
    const groupItems = media.filter(m =>
      color.colorKey ? m.colorKey === color.colorKey : !m.colorKey
    )
    const role: MediaRole = kind === "video" ? "video"
      : (groupItems.filter(m => m.kind === "image").length === 0 ? "cover"
        : groupItems.filter(m => m.kind === "image").length === 1 ? "hover"
        : "gallery")

    const addRes = await fetch(`/api/admin/products/${productId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: upData.url,
        storagePath: upData.path,
        kind,
        role,
        alt: file.name,
        ...color,
      }),
    })
    if (!addRes.ok) {
      const msg = await parseApiError(addRes, `Falha ao registrar mídia (${addRes.status})`)
      throw new Error(msg)
    }
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
    const item = media.find(m => m.id === mediaId)
    if (!item) return
    // Otimista
    setMedia(prev => prev.map(m => {
      if (m.id === mediaId) return { ...m, role }
      // Se cover/hover, desmarca outra da mesma cor
      if ((role === "cover" || role === "hover") && m.role === role && m.colorKey === item.colorKey) return { ...m, role: "gallery" as MediaRole }
      return m
    }))
    try {
      await fetch(`/api/admin/products/${productId}/media/${mediaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
    } catch {
      setError("Erro ao salvar role")
      load()
    }
  }

  // ===== Remover =====
  const handleRemove = async (item: ProductMedia) => {
    if (!confirm("Remover esta mídia?")) return
    setMedia(prev => prev.filter(m => m.id !== item.id))
    try {
      await fetch(`/api/admin/products/${productId}/media/${item.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath: item.storagePath }),
      })
    } catch { load() }
  }

  // ===== Drag & Drop =====
  const onDragStart = (id: number) => setDraggedId(id)
  const onDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault()
    if (draggedId !== null && draggedId !== id) setDropTargetId(id)
  }
  const onDragLeave = () => setDropTargetId(null)
  const onDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault()
    setDropTargetId(null)
    if (draggedId === null || draggedId === targetId) { setDraggedId(null); return }
    const fromIdx = media.findIndex(m => m.id === draggedId)
    const toIdx = media.findIndex(m => m.id === targetId)
    if (fromIdx < 0 || toIdx < 0) { setDraggedId(null); return }
    // Só reordena dentro do mesmo grupo (mesma cor)
    const fromItem = media[fromIdx]
    const toItem = media[toIdx]
    if (fromItem.colorKey !== toItem.colorKey) { setDraggedId(null); return }

    const next = [...media]
    const [moved] = next.splice(fromIdx, 1)
    next.splice(toIdx, 0, moved)
    setMedia(next)
    setDraggedId(null)

    // Persiste reorder do grupo
    const groupItems = next.filter(m => m.colorKey === fromItem.colorKey)
    try {
      await fetch(`/api/admin/products/${productId}/media/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: groupItems.map(m => m.id) }),
      })
    } catch { load() }
  }

  // ===== Migração =====
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

  if (loading) {
    return <div className="flex items-center gap-2 py-8 text-[11px] text-neutral-500"><Loader2 className="h-3 w-3 animate-spin" /> Carregando mídia...</div>
  }

  return (
    <div className="space-y-4">
      {/* Migração legada */}
      {legacyImagesCount > 0 && media.length === 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-900/40 bg-yellow-950/20 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-yellow-300">{legacyImagesCount} imagem(ns) no formato antigo</p>
            <p className="mt-0.5 text-[10px] text-yellow-400/80">Migre pra estrutura com role e cor.</p>
          </div>
          <button onClick={handleMigrate} disabled={migrating}
            className="flex h-7 items-center gap-1 rounded bg-yellow-600 px-2.5 text-[10px] font-medium text-black hover:bg-yellow-500 disabled:opacity-50">
            {migrating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} Migrar
          </button>
        </div>
      )}
      {migrateMsg && <p className="text-[11px] text-emerald-400">{migrateMsg}</p>}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/30 p-2 text-[11px] text-red-400">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" /><span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-300 hover:text-red-100"><X className="h-3 w-3" /></button>
        </div>
      )}

      {/* ===== UPLOAD (com seleção de cor) ===== */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-3">
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Enviar para:</span>
          <select
            value={uploadColorKey}
            onChange={e => setUploadColorKey(e.target.value)}
            className="h-7 rounded border border-neutral-700 bg-neutral-800 px-2 text-[11px] text-white outline-none"
          >
            <option value="__general__">Geral do produto</option>
            {availableColors.map(c => (
              <option key={c.key} value={c.key}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          {/* Imagens */}
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (!uploading) handleFiles(e.dataTransfer.files, "image") }}
            className="flex-1 cursor-pointer rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-900/30 p-3 text-center transition hover:border-neutral-500"
          >
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple
              onChange={e => e.target.files && handleFiles(e.target.files, "image")} className="sr-only" />
            {uploading ? (
              <><Loader2 className="mx-auto h-4 w-4 animate-spin text-neutral-400" />
              <p className="mt-1 text-[10px] text-neutral-400">Enviando{progress ? ` ${progress.current}/${progress.total}` : "..."}</p></>
            ) : (
              <><ImageIcon className="mx-auto h-4 w-4 text-neutral-500" />
              <p className="mt-1 text-[10px] text-neutral-300">Imagens</p>
              <p className="text-[9px] text-neutral-500">JPEG/PNG/WebP · 10MB</p></>
            )}
          </div>
          {/* Vídeo */}
          <div
            onClick={() => !uploading && videoInputRef.current?.click()}
            className="w-28 cursor-pointer rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-900/30 p-3 text-center transition hover:border-neutral-500"
          >
            <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime"
              onChange={e => e.target.files && handleFiles(e.target.files, "video")} className="sr-only" />
            <VideoIcon className="mx-auto h-4 w-4 text-neutral-500" />
            <p className="mt-1 text-[10px] text-neutral-300">Vídeo</p>
            <p className="text-[9px] text-neutral-500">MP4 · 50MB</p>
          </div>
        </div>
      </div>

      {/* ===== GOOGLE DRIVE IMPORT ===== */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/20">
        <button
          type="button"
          onClick={() => setDriveOpen(v => !v)}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] font-semibold text-neutral-200 hover:bg-neutral-800/30"
        >
          <Upload className="h-3.5 w-3.5 text-emerald-400" />
          <span className="flex-1">Importar do Google Drive</span>
          {driveStatus?.configured === false && (
            <span className="rounded-full border border-amber-500/40 bg-amber-950/40 px-2 py-0.5 text-[9px] text-amber-300">sem chave</span>
          )}
          {driveStatus?.configured === true && (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-950/30 px-2 py-0.5 text-[9px] text-emerald-300">configurado</span>
          )}
          <ChevronDown className={`h-3.5 w-3.5 text-neutral-500 transition-transform ${driveOpen ? "rotate-180" : ""}`} />
        </button>

        {driveOpen && (
          <div className="space-y-3 border-t border-neutral-800/60 p-3">
            {driveStatus?.configured === false && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-900/50 bg-amber-950/25 p-2 text-[10px] text-amber-300">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                <span>GOOGLE_DRIVE_API_KEY não configurada. Adicione essa variável no Vercel para importar pastas do Drive.</span>
              </div>
            )}

            <div className="grid gap-2 md:grid-cols-[1fr_160px_100px]">
              <label className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">URL ou ID da pasta</span>
                <input
                  value={driveInput}
                  onChange={e => setDriveInput(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="h-8 w-full rounded border border-neutral-700 bg-neutral-800 px-2 text-[11px] text-white outline-none placeholder:text-neutral-600"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Destino</span>
                <select
                  value={driveColorKey}
                  onChange={e => setDriveColorKey(e.target.value)}
                  className="h-8 w-full rounded border border-neutral-700 bg-neutral-800 px-2 text-[11px] text-white outline-none"
                >
                  <option value="__general__">Geral do produto</option>
                  {availableColors.map(c => (
                    <option key={c.key} value={c.key}>{c.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Limite</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={driveLimit}
                  onChange={e => setDriveLimit(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
                  className="h-8 w-full rounded border border-neutral-700 bg-neutral-800 px-2 text-[11px] text-white outline-none"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDriveImport}
                disabled={driveImporting || driveStatus?.configured === false}
                className="flex h-8 items-center gap-1.5 rounded bg-emerald-500 px-3 text-[11px] font-semibold text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {driveImporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                Importar mídia
              </button>
              <p className="text-[10px] text-neutral-500">A pasta precisa estar pública ou compartilhada para leitura. Imagens viram capa/hover/galeria automaticamente; vídeo vira role vídeo.</p>
            </div>

            {driveMessage && (
              <div className="rounded border border-emerald-900/50 bg-emerald-950/20 p-2 text-[10px] text-emerald-300">
                {driveMessage}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== GRUPOS POR COR ===== */}
      {groups.map(group => {
        const images = group.items.filter(m => m.kind === "image")
        const videos = group.items.filter(m => m.kind === "video")
        const hasCover = images.some(m => m.role === "cover")
        const isColorGroup = group.key !== "__general__"

        return (
          <div key={group.key} className="rounded-lg border border-neutral-800 bg-neutral-900/10">
            {/* Group header */}
            <div className="flex items-center gap-2 border-b border-neutral-800/60 px-3 py-2">
              {group.hex && (
                <span className="h-4 w-4 rounded border border-neutral-700" style={{ backgroundColor: group.hex }} />
              )}
              <span className="text-[11px] font-semibold text-neutral-300">{group.label}</span>
              <span className="text-[10px] text-neutral-500">{group.items.length} mídia(s)</span>
              {isColorGroup && !hasCover && group.items.length > 0 && (
                <span className="ml-auto flex items-center gap-1 text-[9px] text-amber-400">
                  <AlertCircle className="h-3 w-3" /> Sem capa
                </span>
              )}
              {isColorGroup && group.items.length === 0 && (
                <span className="ml-auto flex items-center gap-1 text-[9px] text-red-400">
                  <AlertCircle className="h-3 w-3" /> Sem mídia
                </span>
              )}
            </div>

            {/* Images grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-1.5 p-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {images.map(item => (
                  <ImageCard
                    key={item.id}
                    item={item}
                    isDragging={draggedId === item.id}
                    isDropTarget={dropTargetId === item.id}
                    onDragStart={() => onDragStart(item.id)}
                    onDragOver={e => onDragOver(e, item.id)}
                    onDragLeave={onDragLeave}
                    onDrop={e => onDrop(e, item.id)}
                    onRoleChange={role => handleRoleChange(item.id, role)}
                    onRemove={() => handleRemove(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="px-3 py-4 text-center text-[10px] text-neutral-600">
                {isColorGroup ? "Nenhuma imagem desta cor. Use o upload acima selecionando esta cor." : "Nenhuma imagem geral."}
              </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div className="border-t border-neutral-800/40 px-3 py-2 space-y-1.5">
                {videos.map(v => (
                  <div key={v.id} className="flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900 p-2">
                    <VideoIcon className="h-4 w-4 shrink-0 text-neutral-400" />
                    <a href={v.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-mono text-[10px] text-emerald-400 underline">{v.url}</a>
                    <button onClick={() => handleRemove(v)} className="shrink-0 rounded p-1 text-red-500 hover:bg-red-950/40"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ===== Subcomponente: card de imagem =====

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
      } ${isDropTarget ? "border-emerald-500 ring-2 ring-emerald-500/40" : "border-neutral-800"}`}
    >
      <Image src={item.url} alt={item.alt ?? ""} fill className="object-cover" sizes="120px" unoptimized />

      <span className={`absolute left-0.5 top-0.5 rounded px-1 py-0.5 text-[7px] font-bold uppercase tracking-wider ${ROLE_TONE[item.role] ?? "bg-neutral-700 text-neutral-200"}`}>
        {ROLE_LABEL[item.role] ?? item.role}
      </span>

      <span className="absolute right-0.5 top-0.5 flex h-4 w-4 cursor-grab items-center justify-center rounded bg-black/60 text-white opacity-0 group-hover:opacity-100">
        <GripVertical className="h-2.5 w-2.5" />
      </span>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100">
        <select value={item.role} onChange={e => onRoleChange(e.target.value as MediaRole)}
          onClick={e => e.stopPropagation()}
          className="w-full rounded bg-neutral-800 px-1 py-0.5 text-[8px] text-white outline-none">
          {ROLE_OPTIONS.filter(r => r.value !== "video").map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <button onClick={onRemove}
          className="flex h-4 items-center justify-center gap-0.5 rounded bg-red-600/90 text-[8px] font-medium text-white hover:bg-red-500">
          <Trash2 className="h-2 w-2" /> Remover
        </button>
      </div>
    </div>
  )
}
