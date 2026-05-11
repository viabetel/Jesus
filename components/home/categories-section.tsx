"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

const items = [
  { label: "Camisetas", sub: "Mensagens de fé para o dia a dia.", href: "/produtos?categoria=camisetas", img: "/categories/camisetas.jpg", gradient: "from-stone-800 to-stone-900" },
  { label: "Oversized", sub: "Caimento amplo, confortável e urbano.", href: "/produtos?categoria=oversized", img: "/categories/oversized.jpg", gradient: "from-zinc-800 to-neutral-900" },
  { label: "Baby Look", sub: "Peças leves, femininas e com propósito.", href: "/produtos?categoria=baby-look", img: "/categories/baby-look.jpg", gradient: "from-rose-300 to-stone-400" },
  { label: "Lançamentos", sub: "As últimas peças que chegaram.", href: "/produtos?categoria=lancamentos", img: "/categories/lancamentos.jpg", gradient: "from-amber-200 to-stone-300" },
  { label: "Promoções", sub: "Peças selecionadas com condições especiais.", href: "/produtos?categoria=promocoes", img: "/categories/promocoes.jpg", gradient: "from-red-800 to-red-950" },
  { label: "Pronta Entrega", sub: "Envio imediato e retirada na loja.", href: "/produtos?destaque=pronta-entrega", img: "/categories/pronta-entrega.jpg", gradient: "from-emerald-800 to-emerald-950" },
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
          <Link
            href="/produtos"
            className="caps text-[10px] text-[var(--ink)] border-b border-[var(--ink)]/20 hover:border-[var(--ink)] pb-1 transition flex items-center gap-2 group sm:text-[11px]"
          >
            Ver tudo <span className="transition-transform group-hover:translate-x-1"><ArrowRight size={13} /></span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {items.map(it => (
            <Link key={it.label} href={it.href} className="group relative aspect-[3/4] overflow-hidden bg-[var(--stone)]">
              {/* Gradient fallback */}
              <div className={`absolute inset-0 bg-gradient-to-br ${it.gradient}`} />
              {/* Image */}
              <Image
                src={it.img}
                alt={it.label}
                fill
                className="object-cover transition-transform duration-[1100ms] group-hover:scale-[1.08]"
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
