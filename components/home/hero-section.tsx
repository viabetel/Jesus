import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageCircle, ArrowRight } from "lucide-react"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Mobile: shorter hero with image visible */}
      {/* Desktop: taller immersive hero */}
      <div className="relative flex min-h-[340px] items-end pb-12 sm:min-h-[420px] sm:items-center sm:pb-0 lg:min-h-[620px]">
        {/* Background Image — object-position pulls it up on mobile */}
        <Image
          src="/hero/hero-main.jpg"
          alt="Paisagem inspiradora com montanhas, lago e natureza"
          fill
          priority
          quality={85}
          className="object-cover object-[center_30%] sm:object-center"
          sizes="100vw"
        />

        {/* Overlay — stronger at bottom on mobile for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 sm:bg-gradient-to-b sm:from-black/60 sm:via-black/45 sm:to-black/60" />

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-4xl px-4 text-center sm:py-8">
          <div className="mx-auto mb-4 h-px w-10 bg-[#C2A87D] sm:mb-6 sm:w-12" />

          <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-6xl xl:text-7xl">
            Vista propósito
            <br />
            <span className="text-[#E8DCC8]">com estilo.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:mt-6 sm:max-w-xl sm:text-base lg:text-lg">
            Camisetas cristãs criadas para expressar fé, identidade e mensagem no seu dia a dia.
          </p>

          {/* Buttons — side by side even on small mobile */}
          <div className="mt-6 flex items-center justify-center gap-3 sm:mt-8 sm:gap-4">
            <Link href="/produtos">
              <Button
                size="lg"
                className="h-11 gap-2 rounded-full bg-white px-5 text-xs font-semibold uppercase tracking-wider text-black hover:bg-white/90 sm:h-12 sm:px-8 sm:text-sm"
              >
                Ver catálogo
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </Link>
            <a
              href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Vim pelo site da Fashion Store e gostaria de conhecer as camisetas disponíveis.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="h-11 gap-2 rounded-full bg-[#25D366] px-5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#1DA851] sm:h-12 sm:px-8 sm:text-sm"
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                WhatsApp
              </Button>
            </a>
          </div>

          <p className="mt-4 text-[10px] tracking-widest text-white/40 uppercase sm:mt-6 sm:text-xs">
            Escolha no site · Confirme pelo WhatsApp
          </p>
        </div>
      </div>

      {/* Fade to page */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent sm:h-24" />
    </section>
  )
}
