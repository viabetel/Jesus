
import Image from "next/image"
import { ArrowRight, MessageCircle } from "lucide-react"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"

export function FinalCTASection() {
  return (
    <section className="relative h-[400px] bg-[var(--ink)] text-white overflow-hidden sm:h-[480px]">
      <Image
        src="/banners/drop-semana.jpg"
        alt=""
        fill
        className="object-cover opacity-50"
        quality={95}
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
      <div className="relative mx-auto max-w-[1600px] px-6 sm:px-10 h-full flex flex-col items-center justify-center text-center">
        <p className="caps text-[10px] tracking-[0.22em] text-white/75 sm:text-[11px]">Vamos lá</p>
        <h2 className="mt-3 font-serif-italic text-[32px] leading-[0.95] max-w-[820px] sm:mt-4 sm:text-[48px] md:text-[56px] lg:text-[68px]">
          Pronto para vestir propósito?
        </h2>
        <p className="mt-3 text-[14px] text-white/85 max-w-[560px] sm:mt-5 sm:text-[16px]">
          Escolha sua camiseta no catálogo e finalize direto pelo WhatsApp.
        </p>
        <div className="mt-6 flex items-center gap-3 flex-wrap justify-center sm:mt-9 sm:gap-4">
          <a
            href="/produtos"
            className="inline-flex items-center gap-3 bg-white text-[var(--ink)] caps text-[10px] px-6 h-11 hover:bg-[var(--cream)] transition sm:text-[11px] sm:px-7 sm:h-12"
          >
            Ver Catálogo <ArrowRight size={13} />
          </a>
          <a
            href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Vi o catálogo e quero comprar uma camiseta.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 caps text-[10px] px-6 h-11 transition text-white bg-[var(--wa)] hover:opacity-90 sm:text-[11px] sm:px-7 sm:h-12"
          >
            <MessageCircle size={15} /> Falar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
