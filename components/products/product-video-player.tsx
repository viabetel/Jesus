"use client"

import { useState, useRef, useCallback } from "react"
import { Play, Volume2, VolumeX, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MediaItem } from "@/lib/data/media"
import { resolvePublicVideoSrc, resolveVideoPoster } from "@/lib/data/media"

interface ProductVideoPlayerProps {
  media: MediaItem
  className?: string
  /** Auto-play muted on mount (default true) */
  autoPlay?: boolean
}

export function ProductVideoPlayer({
  media,
  className,
  autoPlay = true,
}: ProductVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasError, setHasError] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPlayOverlay, setShowPlayOverlay] = useState(!autoPlay)

  const videoSrc = resolvePublicVideoSrc(media)
  const posterSrc = resolveVideoPoster(media)

  const handlePlay = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    el.play().catch(() => {
      // Autoplay blocked — show play button
      setShowPlayOverlay(true)
    })
  }, [])

  const handlePlayClick = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    setShowPlayOverlay(false)
    el.muted = true
    el.play().then(() => {
      setIsPlaying(true)
    }).catch(() => setHasError(true))
  }, [])

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const el = videoRef.current
    if (!el) return
    el.muted = !el.muted
    setIsMuted(el.muted)
  }, [])

  if (hasError) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 bg-muted/50 text-muted-foreground",
          className
        )}
      >
        <AlertCircle className="h-8 w-8 opacity-50" />
        <p className="text-xs text-center px-4">
          Não foi possível carregar o vídeo.
          <br />
          <span className="text-[10px]">Tente novamente mais tarde.</span>
        </p>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterSrc}
        controls
        playsInline
        preload="metadata"
        muted={isMuted}
        autoPlay={autoPlay}
        loop
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture
        className="h-full w-full object-contain"
        onPlay={() => {
          setIsPlaying(true)
          setShowPlayOverlay(false)
        }}
        onPause={() => setIsPlaying(false)}
        onLoadedData={handlePlay}
        onError={() => setHasError(true)}
      />

      {/* Play overlay (shown when autoplay blocked or not started) */}
      {showPlayOverlay && (
        <button
          onClick={handlePlayClick}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30"
          aria-label="Reproduzir vídeo"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm">
            <Play className="h-6 w-6 fill-foreground text-foreground ml-0.5" />
          </div>
        </button>
      )}

      {/* Mute toggle floating button */}
      {isPlaying && (
        <button
          onClick={toggleMute}
          className="absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-opacity hover:bg-black/70"
          aria-label={isMuted ? "Ativar som" : "Silenciar"}
        >
          {isMuted ? (
            <VolumeX className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </div>
  )
}
