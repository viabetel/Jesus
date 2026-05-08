import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ZoomIn } from "lucide-react"
import { products } from "@/lib/data/products"
import { getProductMedia } from "@/lib/data/media"

/**
 * "Estampa em detalhe" — destaca closes/detalhes das estampas.
 * Pega imagens de papel "detail" ou, na falta, a 5ª imagem de cada produto
 * destacado (que costuma ser detalhe de estampa). Mostra três produtos com
 * grandes fotos focadas na arte.
 */
export function StampDetailSection() {
  // Pega 3 produtos destacados (com mais de 4 imagens — geralmente têm close de estampa)
  const featured = products.filter((p) => p.images.length >= 5).slice(0, 3)

  if (featured.length === 0) return null

  return (
    <section className="bg-[#0d0d0d] py-12 text-[#FAF9F6] sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="flex flex-col items-start gap-2 text-left sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C2A87D]">No detalhe</p>
            <h2 className="mt-1 break-words font-serif text-xl font-bold leading-tight sm:text-2xl lg:text-4xl">
              Estampa em detalhe
            </h2>
            <p className="mt-1.5 max-w-md text-xs text-[#FAF9F6]/55 sm:text-sm">
              Aproxime-se. Cada arte é trabalhada para durar — textura, traço e leitura.
            </p>
          </div>
          <Link href="/produtos" className="inline-flex items-center gap-1 text-xs font-medium text-[#FAF9F6]/70 hover:text-[#FAF9F6]">
            Ver todos <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-3">
          {featured.map((product, idx) => {
            const media = getProductMedia(product)
            // Pega o item de papel "detail" se existir, senão a 5ª imagem (índice 4 — costuma ser close)
            const detailItem = media.gallery.find((m) => m.role === "detail" && m.type === "image")
              ?? media.gallery.filter((m) => m.type === "image")[4]
              ?? media.gallery.filter((m) => m.type === "image")[0]
            return (
              <Link
                key={product.id}
                href={`/produto/${product.slug}`}
                className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl bg-[#1a1a1a] transition-transform hover:-translate-y-1"
              >
                {/* Imagem grande */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={detailItem.url}
                    alt={`${product.name} — detalhe da estampa`}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    sizes="(max-width:1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                    <ZoomIn className="h-4 w-4" />
                  </div>
                  {/* Marca de detalhe */}
                  <span className="absolute left-3 top-3 rounded-full bg-[#C2A87D] px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#0d0d0d]">
                    Detalhe #{idx + 1}
                  </span>
                </div>
                <div className="min-w-0 p-4 sm:p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#C2A87D]">{product.category}</p>
                  <h3 className="mt-1 line-clamp-2 break-words font-serif text-sm font-semibold leading-snug sm:text-base">
                    {product.name}
                  </h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#FAF9F6]/70 transition-colors group-hover:text-[#FAF9F6]">
                    Ver peça inteira <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
