import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MessageCircle } from "lucide-react"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"

export function ProntaEntregaBand() {
  return (
    <section className="bg-[var(--stone)] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10 grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14 items-center">
        <div className="max-w-[480px]">
          <p className="caps text-[10px] tracking-[0.22em] text-[var(--muted-foreground)] sm:text-[11px]">Compra rápida</p>
          <h2 className="mt-3 font-serif-italic text-[32px] leading-[0.95] sm:mt-4 sm:text-[44px] lg:text-[52px]">Pronta entrega</h2>
          <p className="mt-4 text-[14px] text-[var(--fg-soft)] leading-relaxed sm:mt-6 sm:text-[16px]">
            Escolha sua peça e fale com a gente pelo WhatsApp. Atendimento direto, sem checkout complicado.
          </p>
          <div className="mt-6 flex items-center gap-3 flex-wrap sm:mt-8 sm:gap-4">
            <Link
              href="/produtos?destaque=pronta-entrega"
              className="inline-flex items-center gap-3 bg-[var(--ink)] text-white caps text-[10px] px-6 h-11 hover:bg-[var(--fg-soft)] transition sm:text-[11px] sm:px-7 sm:h-12"
            >
              Ver peças disponíveis <ArrowRight size={13} />
            </Link>
            <a
              href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Quero ver as peças disponíveis para pronta entrega.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 caps text-[10px] text-[var(--ink)] border-b border-[var(--ink)]/20 hover:border-[var(--ink)] pb-1 transition sm:text-[11px]"
            >
              <MessageCircle size={13} className="text-[var(--wa)]" /> Falar no WhatsApp
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 aspect-[2/1.1]">
          <div className="bg-[var(--cream)] overflow-hidden relative">
            <Image
              src="/banners/pronta-entrega.jpg"
              alt="Pronta entrega"
              fill
              className="object-cover"
              sizes="(max-width:1024px) 50vw, 25vw"
            />
          </div>
          <div className="bg-[var(--cream)] overflow-hidden relative">
            <Image
              src="/banners/drop-semana.jpg"
              alt="Pronta entrega"
              fill
              className="object-cover object-left"
              sizes="(max-width:1024px) 50vw, 25vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
