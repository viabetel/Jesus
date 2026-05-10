import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageCircle, ArrowRight, Sparkles } from "lucide-react"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative flex min-h-[420px] items-end pb-14 sm:min-h-[480px] sm:items-center sm:pb-0 lg:min-h-[650px]">
        <Image
          src="/hero/hero-main.jpg"
          alt="Camisetas cristãs com propósito e estilo"
          fill
          priority
          quality={85}
          className="object-cover object-[center_30%] sm:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 sm:bg-gradient-to-b sm:from-black/70 sm:via-black/40 sm:to-black/50" />

        <div className="relative z-10 mx-auto w-full max-w-4xl px-4 text-center sm:py-10">
          {/* Trust badge */}
          <div className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 backdrop-blur-sm sm:mb-6">
            <Sparkles className="h-3 w-3 text-[#C2A87D]" />
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/70 sm:text-[10px]">
              Vitrine digital · Venda pelo WhatsApp
            </span>
          </div>

          <h1 className="font-serif text-[2rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Sua loja cristã
            <br />
            <span className="bg-gradient-to-r from-[#E8DCC8] to-[#C2A87D] bg-clip-text text-transparent">
              online e profissional.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/70 sm:mt-5 sm:max-w-xl sm:text-base lg:text-lg">
            Camisetas com mensagem, estilo e fé. Escolha no catálogo, monte sua sacola e finalize direto pelo WhatsApp.
          </p>

          <div className="mt-6 flex flex-col items-center gap-2.5 sm:mt-8 sm:flex-row sm:justify-center sm:gap-3">
            <Link href="/produtos" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-12 w-full gap-2 rounded-full bg-white px-7 text-[11px] font-bold uppercase tracking-wider text-black shadow-lg transition hover:bg-white/90 hover:shadow-xl sm:w-auto sm:text-xs"
              >
                Ver catálogo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a
              href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Vi o catálogo online e gostaria de saber mais sobre as camisetas.")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="h-12 w-full gap-2 rounded-full bg-[#25D366] px-7 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-[#1DA851] hover:shadow-xl sm:w-auto sm:text-xs"
              >
                <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
              </Button>
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-white/40 sm:mt-8 sm:gap-6 sm:text-xs">
            <span>✦ Entrega combinada</span>
            <span className="h-3 w-px bg-white/20" />
            <span>✦ Pagamento flexível</span>
            <span className="h-3 w-px bg-white/20 hidden sm:block" />
            <span className="hidden sm:inline">✦ Atendimento pessoal</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent sm:h-28" />
    </section>
  )
}
