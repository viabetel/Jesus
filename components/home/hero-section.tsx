"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"
import { homeMedia } from "@/lib/home-media"

const slides = [
  {
    kicker: "Moda cristã multisex",
    title: "Camisetas cristãs para homens e mulheres",
    sub: "Peças confortáveis, modernas e com mensagens de propósito para vestir a fé no dia a dia.",
    img: homeMedia.hero.main.src,
    cta: "Ver Catálogo",
    ctaHref: "/produtos",
  },
  {
    kicker: "Linha Masculina",
    title: "Presença, conforto e propósito",
    sub: "Camisetas masculinas e oversized para uma rotina com identidade cristã.",
    img: homeMedia.hero.masculino.src,
    cta: "Ver Masculino",
    ctaHref: "/produtos?categoria=camisetas",
  },
  {
    kicker: "Linha Feminina",
    title: "Leveza, mensagem e propósito",
    sub: "Peças femininas com caimento confortável, estilo discreto e identidade cristã.",
    img: homeMedia.hero.feminino.src,
    cta: "Ver Feminino",
    ctaHref: "/produtos?categoria=baby-look",
  },
  {
    kicker: "Pronta Entrega",
    title: "Escolha sua peça e finalize pelo WhatsApp",
    sub: "Atendimento direto, compra simples e peças disponíveis para envio ou retirada.",
    img: homeMedia.hero.prontaEntrega.src,
    cta: "Comprar pelo WhatsApp",
    ctaHref: createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Vi o catálogo e quero uma peça de pronta entrega."),
    external: true,
  },
]

export function HeroSection() {
  const [i, setI] = useState(0)
  const len = slides.length

  useEffect(() => {
    const t = setTimeout(() => setI((i + 1) % len), 6500)
    return () => clearTimeout(t)
  }, [i, len])

  return (
    <section className="relative w-full overflow-hidden bg-[var(--ink)]">
      <div className="relative min-h-[540px] sm:min-h-[580px] lg:min-h-[600px] lg:max-h-[720px]">

        {slides.map((s, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
              idx === i ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Mobile: full bleed but gentler overlay */}
            <div className="absolute inset-0 lg:hidden">
              <Image
                src={s.img}
                alt=""
                fill
                priority={idx === 0}
                quality={80}
                className="object-cover object-center"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/15" />
            </div>

            {/* Desktop: split layout — text left, image right with object-contain */}
            <div className="absolute inset-0 hidden lg:block">
              <div className="absolute inset-y-0 left-0 w-[46%] bg-[var(--ink)]" />
              <div className="absolute inset-y-0 right-0 w-[56%]">
                <Image
                  src={s.img}
                  alt=""
                  fill
                  priority={idx === 0}
                  quality={85}
                  className="object-contain object-center"
                  sizes="56vw"
                />
                <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[var(--ink)] to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--ink)] to-transparent" />
              </div>
            </div>
          </div>
        ))}

        {/* Content */}
        <div className="relative z-10 flex h-full min-h-[inherit] items-end lg:items-center">
          <div className="mx-auto w-full max-w-[1600px] px-6 pb-20 sm:px-10 sm:pb-24 lg:pb-0">
            {slides.map((s, idx) => (
              <div
                key={idx}
                className={`transition-all duration-700 ease-out lg:max-w-[520px] xl:max-w-[560px] ${
                  idx === i
                    ? "opacity-100 translate-y-0 relative"
                    : "opacity-0 translate-y-4 absolute pointer-events-none left-6 right-6 bottom-20 sm:left-10 sm:right-10 sm:bottom-24 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
                }`}
              >
                <p className="caps text-[10px] tracking-[0.22em] text-white/80 sm:text-[11px]">{s.kicker}</p>
                <h1 className="mt-4 font-serif-italic text-[30px] leading-[0.95] sm:mt-5 sm:text-[44px] md:text-[52px] lg:text-[58px] xl:text-[66px]">
                  <span className="text-white">{s.title}</span>
                </h1>
                <p className="mt-3 text-[13px] text-white/80 max-w-[460px] leading-relaxed sm:mt-5 sm:text-[15px]">
                  {s.sub}
                </p>
                <div className="mt-6 flex items-center gap-3 flex-wrap sm:mt-8 sm:gap-4">
                  {s.external ? (
                    <a href={s.ctaHref} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-white text-[var(--ink)] caps text-[10px] px-6 h-11 hover:bg-[var(--cream)] transition sm:text-[11px] sm:px-7 sm:h-12">
                      {s.cta} <ArrowRight size={13} />
                    </a>
                  ) : (
                    <Link href={s.ctaHref}
                      className="inline-flex items-center gap-3 bg-white text-[var(--ink)] caps text-[10px] px-6 h-11 hover:bg-[var(--cream)] transition sm:text-[11px] sm:px-7 sm:h-12">
                      {s.cta} <ArrowRight size={13} />
                    </Link>
                  )}
                  <Link href="/produtos"
                    className="inline-flex items-center gap-2 text-white caps text-[10px] border-b border-white/40 hover:border-white pb-1 transition sm:text-[11px]">
                    Ver todas as peças
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-10 flex items-center gap-3 sm:bottom-10">
        {slides.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)} aria-label={`Slide ${idx + 1}`}
            className={`relative h-[3px] transition-all duration-500 overflow-hidden ${
              idx === i ? "w-12 bg-white/30" : "w-6 bg-white/30 hover:bg-white/50"
            }`}>
            {idx === i && (
              <span className="absolute inset-y-0 left-0 bg-white"
                style={{ width: "100%", animation: "dashfill 6.5s linear forwards" }} />
            )}
          </button>
        ))}
      </div>

      {/* Arrows */}
      <button onClick={() => setI((i - 1 + len) % len)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 grid place-items-center bg-white/0 hover:bg-white/10 border border-white/30 text-white transition sm:left-6 sm:h-12 sm:w-12"
        aria-label="Anterior">
        <ChevronLeft size={20} />
      </button>
      <button onClick={() => setI((i + 1) % len)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 grid place-items-center bg-white/0 hover:bg-white/10 border border-white/30 text-white transition sm:right-6 sm:h-12 sm:w-12"
        aria-label="Próximo">
        <ChevronRight size={20} />
      </button>
    </section>
  )
}
