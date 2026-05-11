"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { homeMedia } from "@/lib/home-media"

const items = [
  { t: "Oversized com propósito", s: "Modelagem ampla, conforto e presença.", img: homeMedia.lookbook.oversized.src, position: homeMedia.lookbook.oversized.position, gradient: "from-stone-700 to-stone-900" },
  { t: "Camiseta cristã no dia a dia", s: "Combinação leve para qualquer agenda.", img: homeMedia.lookbook.casual.src, position: homeMedia.lookbook.casual.position, gradient: "from-zinc-700 to-neutral-900" },
  { t: "Linha feminina com propósito", s: "Leveza, modéstia e mensagem no dia a dia.", img: homeMedia.lookbook.feminino.src, position: homeMedia.lookbook.feminino.position, gradient: "from-rose-700 to-stone-900" },
]

export function LookbookSection() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
        <div className="text-center mb-8 sm:mb-12">
          <p className="caps text-[10px] tracking-[0.22em] text-[var(--muted-foreground)] sm:text-[11px]">Lookbook</p>
          <h2 className="mt-2 font-serif-italic text-[28px] leading-none sm:mt-3 sm:text-[36px] lg:text-[44px]">Inspirações para vestir propósito</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-3">
          {items.map((it, i) => (
            <div key={it.t} className="group relative aspect-[4/5] overflow-hidden bg-[var(--stone)]">
              <div className={`absolute inset-0 bg-gradient-to-br ${it.gradient}`} />
              <Image
                src={it.img}
                alt={it.t}
                fill
                className={`object-cover ${it.position} transition-transform duration-[1200ms] group-hover:scale-[1.05]`}
                quality={95}
                sizes="(max-width:768px) 100vw, 33vw"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                <p className="caps text-[9px] text-white/70 tracking-[0.22em] sm:text-[10px]">Look 0{i + 1}</p>
                <h3 className="mt-1.5 font-serif-italic text-white text-[20px] leading-tight sm:mt-2 sm:text-[26px]">{it.t}</h3>
                <p className="mt-1.5 text-[12px] text-white/85 sm:mt-2 sm:text-[13px]">{it.s}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 caps text-[9px] text-white border-b border-white/40 group-hover:border-white pb-0.5 transition sm:mt-4 sm:text-[10px]">
                  Ver peças do look <ArrowRight size={11} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
