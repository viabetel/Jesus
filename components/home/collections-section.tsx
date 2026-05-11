"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

const items = [
  { t: "Fé Urbana", s: "Peças com mensagem, presença e estética casual.", href: "/produtos", img: "/hero/hero-main.jpg", gradient: "from-stone-800 to-stone-900" },
  { t: "Essenciais", s: "Camisetas fáceis de combinar, com propósito no detalhe.", href: "/produtos", img: "/hero/hero-main.jpg", gradient: "from-zinc-800 to-neutral-900" },
  { t: "Para Presentear", s: "Uma forma simples de entregar uma mensagem especial.", href: "/produtos", img: "/hero/hero-main.jpg", gradient: "from-amber-800 to-stone-900" },
  { t: "Looks do Dia a Dia", s: "Combinações leves que conversam com a sua rotina.", href: "/produtos", img: "/hero/hero-main.jpg", gradient: "from-rose-800 to-stone-900" },
]

export function CollectionsSection() {
  return (
    <section className="bg-[var(--cream)] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
        <div className="text-center mb-8 sm:mb-12">
          <p className="caps text-[10px] tracking-[0.22em] text-[var(--muted-foreground)] sm:text-[11px]">Navegação por estilo</p>
          <h2 className="mt-2 font-serif-italic text-[28px] leading-none sm:mt-3 sm:text-[36px] lg:text-[44px]">Escolha por estilo</h2>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {items.map(it => (
            <Link key={it.t} href={it.href} className="group relative aspect-[3/4] overflow-hidden bg-[var(--stone)]">
              <div className={`absolute inset-0 bg-gradient-to-br ${it.gradient}`} />
              <Image
                src={it.img}
                alt={it.t}
                fill
                className="object-cover transition-transform duration-[1100ms] group-hover:scale-[1.06]"
                sizes="(max-width:640px) 50vw, 25vw"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                <h3 className="font-serif-italic text-white text-[18px] leading-tight sm:text-[22px] lg:text-[26px]">{it.t}</h3>
                <p className="mt-1 text-[11px] text-white/85 leading-snug sm:mt-2 sm:text-[12.5px]">{it.s}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 caps text-[8px] text-white sm:mt-4 sm:text-[10px]">
                  Explorar <ArrowRight size={11} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
