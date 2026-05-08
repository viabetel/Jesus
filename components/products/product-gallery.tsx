"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play, Maximize2, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProductMedia, MediaItem } from "@/lib/data/media"
import { toDrivePreviewUrl } from "@/lib/data/media"

type Props = {
  media: ProductMedia
  productName: string
  badge?: string
  discount?: number
}

export function ProductGallery({ media, productName, badge, discount = 0 }: Props) {
  const [selected, setSelected] = useState(0)
  const [videoFailed, setVideoFailed] = useState<Record<number, boolean>>({})
  const [videoOpen, setVideoOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const items = media.gallery
  const current: MediaItem | undefined = items[selected]
  const hasMultiple = items.length > 1

  const goPrev = () => setSelected((i) => (i === 0 ? items.length - 1 : i - 1))
  const goNext = () => setSelected((i) => (i === items.length - 1 ? 0 : i + 1))

  // Reset videoOpen ao trocar de item
  useEffect(() => { setVideoOpen(false) }, [selected])

  // Esc fecha fullscreen
  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false) }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [fullscreen])

  const renderMedia = (item: MediaItem | undefined, idx: number, opts: { large?: boolean } = {}) => {
    if (!item) {
      return (
        <Image
          src="/brand/placeholder-product.svg"
          alt={productName}
          fill
          className="object-cover"
          priority={opts.large}
          sizes={opts.large ? "(max-width:1024px) 100vw, 480px" : "80px"}
        />
      )
    }

    if (item.type === "video") {
      const failed = videoFailed[idx]
      // Estado fechado: mostra thumbnail + botão play
      if (!videoOpen) {
        return (
          <button
            onClick={() => setVideoOpen(true)}
            className="group/video absolute inset-0 flex items-center justify-center bg-black"
            aria-label="Reproduzir vídeo"
          >
            {item.thumbnail && !failed ? (
              <Image
                src={item.thumbnail}
                alt={item.alt}
                fill
                className="object-cover opacity-90 transition-opacity group-hover/video:opacity-70"
                sizes="(max-width:1024px) 100vw, 480px"
                onError={() => setVideoFailed((v) => ({ ...v, [idx]: true }))}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
            )}
            <div className="relative flex flex-col items-center gap-3">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-transform group-hover/video:scale-110">
                <Play className="ml-1 h-7 w-7 fill-foreground text-foreground" />
              </span>
              <span className="rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                Assistir vídeo
              </span>
            </div>
          </button>
        )
      }
      // Aberto: iframe Drive
      return (
        <>
          <iframe
            src={toDrivePreviewUrl(item.url)}
            className="h-full w-full border-0"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            title={`${productName} — Vídeo`}
          />
          {/* Fallback notice — sobreposto, fácil de fechar */}
          <button
            onClick={() => setVideoOpen(false)}
            className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow"
            aria-label="Fechar vídeo"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      )
    }

    return (
      <Image
        src={item.url}
        alt={item.alt}
        fill
        className="object-cover"
        priority={opts.large}
        sizes={opts.large ? "(max-width:1024px) 100vw, 480px" : "80px"}
      />
    )
  }

  return (
    <>
      <div className="space-y-2 lg:flex lg:gap-3 lg:space-y-0">
        {/* ===== Thumbs verticais — DESKTOP only ===== */}
        {hasMultiple && (
          <div className="hidden w-16 shrink-0 flex-col gap-2 lg:flex">
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={cn(
                  "relative aspect-square w-full shrink-0 overflow-hidden rounded-lg border-2 transition",
                  selected === i ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100"
                )}
                aria-label={`Mídia ${i + 1}`}
              >
                {item.type === "video" ? (
                  item.thumbnail && !videoFailed[i] ? (
                    <>
                      <Image
                        src={item.thumbnail}
                        alt={item.alt}
                        fill
                        className="object-cover"
                        sizes="64px"
                        onError={() => setVideoFailed((v) => ({ ...v, [i]: true }))}
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-4 w-4 fill-white text-white" />
                      </span>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                      <Play className="h-4 w-4 fill-white text-white" />
                    </div>
                  )
                ) : (
                  <Image src={item.url} alt={item.alt} fill className="object-cover" sizes="64px" />
                )}
                {item.type === "video" && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/70 py-px text-center text-[7px] font-bold tracking-wider text-white">
                    VÍDEO
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ===== Mídia principal ===== */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className={cn(
            "relative aspect-square overflow-hidden rounded-xl bg-muted",
            "max-h-[38dvh] sm:max-h-[50dvh]",
            "lg:aspect-[4/5] lg:max-h-[600px]"
          )}>
            {renderMedia(current, selected, { large: true })}

            {/* Badge */}
            {badge && current?.type !== "video" && !videoOpen && (
              <span className={cn(
                "absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider sm:text-[10px]",
                badge === "Promoção" ? "bg-red-600 text-white"
                  : badge === "Mais vendida" ? "bg-[#C2A87D] text-white"
                  : "bg-foreground text-background"
              )}>
                {badge}{discount > 0 && ` -${discount}%`}
              </span>
            )}

            {/* Fullscreen — apenas para imagens */}
            {current?.type === "image" && (
              <button
                onClick={() => setFullscreen(true)}
                className="absolute right-2.5 top-2.5 hidden h-9 w-9 items-center justify-center rounded-full bg-white/85 shadow backdrop-blur-sm hover:scale-105 sm:flex"
                aria-label="Tela cheia"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            )}

            {/* Arrows */}
            {hasMultiple && !videoOpen && (
              <>
                <button onClick={goPrev} className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-md backdrop-blur-sm transition active:scale-90" aria-label="Anterior">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={goNext} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-md backdrop-blur-sm transition active:scale-90 sm:right-12" aria-label="Próxima">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">{selected + 1}/{items.length}</span>
                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelected(i)}
                      className={cn("h-1.5 rounded-full transition-all", selected === i ? "w-5 bg-white" : "w-1.5 bg-white/50")}
                      aria-label={`Ir para mídia ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ===== Thumbs horizontais — MOBILE / TABLET ===== */}
          {hasMultiple && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide lg:hidden">
              {items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 sm:h-14 sm:w-14",
                    selected === i ? "border-foreground" : "border-transparent opacity-50 hover:opacity-80"
                  )}
                  aria-label={`Mídia ${i + 1}`}
                >
                  {item.type === "video" ? (
                    item.thumbnail && !videoFailed[i] ? (
                      <>
                        <Image src={item.thumbnail} alt={item.alt} fill className="object-cover" sizes="56px" onError={() => setVideoFailed((v) => ({ ...v, [i]: true }))} />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-3.5 w-3.5 fill-white text-white" />
                        </span>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                        <Play className="h-4 w-4 fill-white text-white" />
                      </div>
                    )
                  ) : (
                    <Image src={item.url} alt={item.alt} fill className="object-cover" sizes="56px" />
                  )}
                  {item.type === "video" && (
                    <span className="absolute bottom-0 left-0 right-0 bg-black/70 py-px text-center text-[7px] font-bold tracking-wider text-white">
                      VÍDEO
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Aviso se vídeo do Drive falhar — ajuda no diagnóstico */}
          {current?.type === "video" && videoFailed[selected] && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50 p-2.5 text-[11px] text-amber-900">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>
                Vídeo indisponível no momento. Verifique a permissão pública no Google Drive
                ou hospede o arquivo em Cloudinary / Vercel Blob para maior estabilidade.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===== Lightbox fullscreen ===== */}
      {fullscreen && current?.type === "image" && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setFullscreen(false)}
          role="dialog"
          aria-label="Imagem ampliada"
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
            onClick={() => setFullscreen(false)}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-[90vh] w-[90vw] max-w-5xl">
            <Image src={current.url} alt={current.alt} fill className="object-contain" sizes="90vw" />
          </div>
          {hasMultiple && (
            <>
              <button onClick={(e) => { e.stopPropagation(); goPrev() }} className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25" aria-label="Anterior">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); goNext() }} className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25" aria-label="Próxima">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
