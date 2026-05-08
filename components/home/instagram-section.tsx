import Image from "next/image"
import { Instagram, ExternalLink, Heart, MessageCircle, Send, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { STORE_INSTAGRAM, STORE_INSTAGRAM_URL, STORE_NAME } from "@/lib/whatsapp"
import { products } from "@/lib/data/products"
import { getProductMedia } from "@/lib/data/media"

/**
 * "Mural Fashion Store" — substitui o feed fake genérico.
 * Combina header de perfil, post em destaque e grid curado, todos
 * apontando para o Instagram real da loja.
 */
export function InstagramSection() {
  // Curadoria: capa de cada produto vira post do mural
  const feed = products.slice(0, 6).map((p) => ({
    image: getProductMedia(p).cover,
    name: p.name,
  }))

  // Post em destaque (primeiro)
  const highlight = feed[0]
  const grid = feed.slice(1, 6) // até 5 itens

  return (
    <section className="bg-gradient-to-b from-[#FAF7F0] to-background py-10 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        {/* ===== Header tipo perfil ===== */}
        <div className="flex flex-col items-center text-center">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#C2A87D]">
            Mural Fashion Store
          </p>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute inset-0 -m-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-background sm:h-16 sm:w-16">
                <Instagram className="h-6 w-6 text-foreground sm:h-7 sm:w-7" />
              </div>
            </div>
            <div className="text-left">
              <h2 className="font-serif text-base font-bold sm:text-xl">{STORE_NAME}</h2>
              <p className="text-xs text-muted-foreground sm:text-sm">{STORE_INSTAGRAM}</p>
            </div>
          </div>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Bastidores, lançamentos e combinações reais. Acompanhe a comunidade que veste propósito.
          </p>
          <a href={STORE_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="mt-3">
            <Button size="sm" className="gap-2 rounded-full px-5 text-xs">
              Ver Instagram <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>

        {/* ===== Conteúdo: post em destaque + grid ===== */}
        <div className="mt-8 grid gap-3 sm:gap-4 lg:grid-cols-[minmax(280px,42%)_1fr]">
          {/* Post em destaque (estilo card de Instagram) */}
          {highlight && (
            <a
              href={STORE_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
              aria-label="Post em destaque no Instagram"
            >
              {/* Header do post */}
              <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="block h-7 w-7 shrink-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-card">
                      <Instagram className="h-3.5 w-3.5" />
                    </span>
                  </span>
                  <span className="min-w-0 truncate text-xs font-semibold">{STORE_INSTAGRAM}</span>
                </div>
                <span className="rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                  Destaque
                </span>
              </div>
              {/* Imagem */}
              <div className="relative aspect-square w-full overflow-hidden bg-muted">
                <Image
                  src={highlight.image}
                  alt={highlight.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width:1024px) 100vw, 42vw"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
              </div>
              {/* Ações fake */}
              <div className="flex items-center gap-3 px-3.5 py-2.5 text-foreground/70">
                <Heart className="h-4 w-4" />
                <MessageCircle className="h-4 w-4" />
                <Send className="h-4 w-4" />
                <Bookmark className="ml-auto h-4 w-4" />
              </div>
              <div className="px-3.5 pb-3.5">
                <p className="line-clamp-2 break-words text-xs leading-snug">
                  <span className="font-semibold">{STORE_INSTAGRAM}</span>{" "}
                  <span className="text-muted-foreground">
                    Vista propósito no seu dia. {highlight.name}.
                  </span>
                </p>
              </div>
            </a>
          )}

          {/* Grid curado */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-3">
            {grid.map((post, i) => (
              <a
                key={i}
                href={STORE_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-xl bg-muted"
                aria-label={`Foto ${i + 2} do mural`}
              >
                <Image
                  src={post.image}
                  alt={post.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width:640px) 33vw, 16vw"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                  <Instagram className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* CTA inferior */}
        <div className="mt-8 text-center">
          <a href={STORE_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground sm:text-sm">
            Marque <span className="font-semibold text-foreground">{STORE_INSTAGRAM}</span> nos seus posts <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </section>
  )
}
