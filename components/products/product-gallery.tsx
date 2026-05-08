"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  Maximize2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/data/products"
import { buildGalleryEntries, type GalleryEntry } from "@/lib/data/media"
import { ProductVideoPlayer } from "./product-video-player"

interface ProductGalleryProps {
  product: Product
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const gallery = buildGalleryEntries(product)
  const [selected, setSelected] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const hasMultiple = gallery.length > 1
  const current = gallery[selected]

  const goPrev = useCallback(() => {
    setSelected((i) => (i === 0 ? gallery.length - 1 : i - 1))
  }, [gallery.length])

  const goNext = useCallback(() => {
    setSelected((i) => (i === gallery.length - 1 ? 0 : i + 1))
  }, [gallery.length])

  if (!current) return null

  return (
    <>
      <div className="space-y-2">
        {/* ──── Main media ──── */}
        <div
          className={cn(
            "relative aspect-[4/5] min-h-[320px] max-h-[58dvh] overflow-hidden rounded-xl bg-[#f6f2ea]",
            "sm:max-h-[60dvh] lg:max-h-[640px]"
          )}
        >
          {current.type === "video" ? (
            <ProductVideoPlayer
              media={current.media}
              className="h-full w-full"
              autoPlay
            />
          ) : (
            <Image
              src={current.url || "/brand/placeholder-product.svg"}
              alt={current.alt}
              fill
              className="object-contain"
              priority={selected === 0}
              sizes="(max-width:1024px) 100vw, 480px"
            />
          )}

          {/* Badge area */}
          {product.badge && (
            <span
              className={cn(
                "absolute left-2.5 top-2.5 z-10 rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider sm:text-[10px]",
                product.badge === "Promoção"
                  ? "bg-red-600 text-white"
                  : product.badge === "Mais vendida"
                    ? "bg-[#C2A87D] text-white"
                    : "bg-foreground text-background"
              )}
            >
              {product.badge}
              {product.originalPrice
                ? ` -${Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  )}%`
                : ""}
            </span>
          )}

          {/* Fullscreen button */}
          {current.type === "image" && (
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute right-2.5 bottom-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Ver em tela cheia"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Arrows */}
          {hasMultiple && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm active:scale-90"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm active:scale-90"
                aria-label="Próxima"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Counter */}
              <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
                {selected + 1}/{gallery.length}
              </span>

              {/* Dots */}
              <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      selected === i
                        ? "w-4 bg-white"
                        : "w-1.5 bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ──── Thumbnails ──── */}
        {hasMultiple && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide lg:flex-col lg:absolute lg:left-0 lg:top-0 lg:h-full lg:w-14 lg:overflow-y-auto lg:overflow-x-hidden lg:static">
            {gallery.map((item, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={cn(
                  "relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 sm:h-14 sm:w-14",
                  selected === i
                    ? "border-foreground"
                    : "border-transparent opacity-50 hover:opacity-80"
                )}
              >
                {item.type === "video" ? (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Play className="h-4 w-4 fill-foreground text-foreground" />
                  </div>
                ) : (
                  <Image
                    src={item.url}
                    alt={`Foto ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                )}
                {item.type === "video" && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-px text-center text-[7px] font-bold text-white">
                    VÍDEO
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ──── Lightbox ──── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          {hasMultiple && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
                className="absolute left-4 top-1/2 z-50 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
                className="absolute right-4 top-1/2 z-50 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Próxima"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {current.type === "image" ? (
              <Image
                src={current.url}
                alt={current.alt}
                width={1200}
                height={1500}
                className="max-h-[90vh] w-auto object-contain"
                sizes="90vw"
              />
            ) : (
              <ProductVideoPlayer
                media={current.media}
                className="max-h-[90vh] max-w-[90vw]"
                autoPlay={false}
              />
            )}
          </div>

          {/* Lightbox counter */}
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
            {selected + 1} / {gallery.length}
          </span>
        </div>
      )}
    </>
  )
}
