import Image from "next/image"
import { Instagram, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { STORE_INSTAGRAM, STORE_INSTAGRAM_URL } from "@/lib/whatsapp"
import { products } from "@/lib/data/products"

export function InstagramSection() {
  // Use product images as "feed" — no iframe dependency
  const feedImages = products.slice(0, 6).map((p) => p.images[0]).filter(Boolean)

  return (
    <section className="py-8 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 sm:h-14 sm:w-14">
            <Instagram className="h-5 w-5 text-white sm:h-7 sm:w-7" />
          </div>
          <h2 className="mt-4 font-serif text-lg font-bold sm:text-2xl">{STORE_INSTAGRAM}</h2>
          <p className="mt-1.5 max-w-sm text-xs text-muted-foreground sm:text-sm">
            Bastidores, lançamentos e combinações reais.
          </p>
          <a href={STORE_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="mt-3">
            <Button size="sm" className="gap-2 rounded-full px-5 text-xs">
              Ver Instagram <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>

        {/* Feed grid with product images */}
        <div className="mt-6 grid grid-cols-3 gap-1.5 sm:mt-8 sm:grid-cols-6 sm:gap-2">
          {feedImages.map((img, i) => (
            <a key={i} href={STORE_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image src={img} alt={`Fashion Store — Foto ${i + 1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width:640px) 33vw, 16vw" />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
