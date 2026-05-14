"use client"


import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { homeMedia } from "@/lib/home-media"

const items = [
  { label: "Masculino", sub: "Camisetas cristãs masculinas com conforto, estilo e propósito.", href: "/produtos?categoria=camisetas", img: homeMedia.categories.masculino.src, position: homeMedia.categories.masculino.position, gradient: "from-stone-800 to-stone-950" },
  { label: "Feminino", sub: "Peças femininas com mensagem, leveza e propósito.", href: "/produtos?categoria=baby-look", img: homeMedia.categories.feminino.src, position: homeMedia.categories.feminino.position, gradient: "from-rose-800 to-stone-950" },
  { label: "Oversized", sub: "Modelagem ampla para looks casuais com presença.", href: "/produtos?categoria=oversized", img: homeMedia.categories.oversized.src, position: homeMedia.categories.oversized.position, gradient: "from-zinc-800 to-neutral-950" },
  { label: "Coleções", sub: "Escolha por mensagem, estilo ou ocasião.", href: "/produtos", img: homeMedia.categories.colecoes.src, position: homeMedia.categories.colecoes.position, gradient: "from-amber-800 to-stone-950" },
  { label: "Lançamentos", sub: "Novas peças para vestir sua fé no dia a dia.", href: "/produtos?categoria=lancamentos", img: homeMedia.categories.lancamentos.src, position: homeMedia.categories.lancamentos.position, gradient: "from-olive to-stone-950" },
  { label: "Promoções", sub: "Peças selecionadas com condições especiais.", href: "/produtos?categoria=promocoes", img: homeMedia.categories.promocoes.src, position: homeMedia.categories.promocoes.position, gradient: "from-red-800 to-red-950" },
  { label: "Pronta Entrega", sub: "Escolha sua peça e finalize pelo WhatsApp.", href: "/produtos?destaque=pronta-entrega", img: homeMedia.categories.prontaEntrega.src, position: homeMedia.categories.prontaEntrega.position, gradient: "from-emerald-800 to-emerald-950" },
]

export function CategoryStrip() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-6 sm:mb-10">
          <div>
            <p className="caps text-[10px] tracking-[0.22em] text-[var(--muted-foreground)] sm:text-[11px]">Departamentos</p>
            <h2 className="mt-2 font-serif-italic text-[28px] leading-none sm:mt-3 sm:text-[36px] lg:text-[44px]">Encontre sua peça</h2>
          </div>
          <a
            href="/produtos"
            className="caps text-[10px] text-[var(--ink)] border-b border-[var(--ink)]/20 hover:border-[var(--ink)] pb-1 transition flex items-center gap-2 group sm:text-[11px]"
          >
            Ver tudo <span className="transition-transform group-hover:translate-x-1"><ArrowRight size={13} /></span>
          </a>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-7 lg:gap-4">
          {items.map(it => (
            <a key={it.label} href={it.href} className="group relative aspect-[3/4] overflow-hidden bg-[var(--stone)]">
              {/* Gradient fallback */}
              <div className={`absolute inset-0 bg-gradient-to-br ${it.gradient}`} />
              {/* Image */}
              <Image
                src={it.img}
                alt={it.label}
                fill
                className={`object-cover ${it.position} transition-transform duration-[1100ms] group-hover:scale-[1.08]`}
                quality={95}
                sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 16vw"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-5">
                <h3 className="font-serif-italic text-white text-[16px] leading-tight sm:text-[20px] lg:text-[22px]">{it.label}</h3>
                <p className="mt-0.5 text-[10px] text-white/80 leading-snug sm:mt-1 sm:text-[12px]">{it.sub}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 caps text-[8px] text-white/95 opacity-0 group-hover:opacity-100 transition-opacity sm:mt-3 sm:text-[10px]">
                  Explorar <ArrowRight size={11} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
