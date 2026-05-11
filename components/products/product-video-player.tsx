"use client"
import { useState, useRef, useCallback } from "react"
import { Play, Volume2, VolumeX, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MediaItem } from "@/lib/data/media"
import { resolvePublicVideoSrc, resolveVideoPoster } from "@/lib/data/media"

interface Props { media: MediaItem; className?: string; autoPlay?: boolean }

export function ProductVideoPlayer({ media, className, autoPlay = true }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [hasError, setHasError] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showOverlay, setShowOverlay] = useState(!autoPlay)

  const videoSrc = resolvePublicVideoSrc(media)
  const posterSrc = resolveVideoPoster(media)

  const handlePlayClick = useCallback(() => {
    const el = ref.current
    if (!el) return
    setShowOverlay(false)
    el.muted = true
    el.play().then(() => setIsPlaying(true)).catch(() => setHasError(true))
  }, [])

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const el = ref.current
    if (!el) return
    el.muted = !el.muted
    setIsMuted(el.muted)
  }, [])

  if (hasError) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-2 bg-muted/50 text-muted-foreground", className)}>
        <AlertCircle className="h-6 w-6 opacity-50" />
        <p className="text-[10px] text-center px-4">Não foi possível carregar o vídeo.</p>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <video ref={ref} src={videoSrc} poster={posterSrc} controls playsInline preload="metadata"
        muted={isMuted} autoPlay={autoPlay} loop
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture className="h-full w-full object-contain"
        onPlay={() => { setIsPlaying(true); setShowOverlay(false) }}
        onPause={() => setIsPlaying(false)}
        onLoadedData={() => { if (autoPlay) ref.current?.play().catch(() => setShowOverlay(true)) }}
        onError={() => setHasError(true)}
      />
      {showOverlay && (
        <button onClick={handlePlayClick} className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 hover:bg-black/30" aria-label="Reproduzir">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg"><Play className="h-5 w-5 fill-foreground text-foreground ml-0.5" /></div>
        </button>
      )}
      {isPlaying && (
        <button onClick={toggleMute} className="absolute bottom-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70" aria-label={isMuted ? "Ativar som" : "Silenciar"}>
          {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
        </button>
      )}
    </div>
  )
}
