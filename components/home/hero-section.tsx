import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageCircle, ArrowRight, Package, ShieldCheck, Truck } from "lucide-react"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#FAF9F6]">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid min-h-[400px] items-center gap-6 py-10 sm:min-h-[460px] sm:py-14 lg:min-h-[540px] lg:grid-cols-2 lg:gap-12 lg:py-0">

          {/* ── Text side ── */}
          <div className="relative z-10 max-w-xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/80 px-3.5 py-1.5 backdrop-blur-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50 sm:text-[11px]">
                Novo drop disponível
              </span>
            </div>

            {/* Headline */}
            <h1 className="mt-5 text-[1.75rem] font-bold leading-[1.12] tracking-tight sm:text-[2.25rem] lg:text-[2.75rem]"
              style={{ fontFamily: "var(--font-serif)" }}>
              Camisetas cristãs para{" "}
              <span className="text-foreground/70">usar sua fé no dia a dia</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-[14px] leading-relaxed text-foreground/50 sm:text-[15px] lg:text-base">
              Peças confortáveis, estilosas e com mensagens de propósito.
              Escolha no catálogo e finalize pelo WhatsApp.
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:gap-3 lg:mt-8">
              <Link href="/produtos" className="w-full sm:w-auto">
                <Button size="lg"
                  className="h-12 w-full gap-2 rounded-full bg-foreground px-7 text-[11px] font-bold uppercase tracking-wider text-background shadow-md transition hover:bg-foreground/90 hover:shadow-lg sm:w-auto sm:text-xs">
                  Ver catálogo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Vi o catálogo e quero saber mais sobre as camisetas.")}
                target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg"
                  className="h-12 w-full gap-2 rounded-full bg-[#25D366] px-7 text-[11px] font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#1DA851] hover:shadow-lg sm:w-auto sm:text-xs">
                  <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
                </Button>
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-foreground/35 sm:mt-8 sm:text-xs">
              <span className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> Pronta entrega</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Compra simples</span>
              <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Entrega combinada</span>
            </div>
          </div>

          {/* ── Image side ── */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-[4/5] max-h-[540px] overflow-hidden rounded-2xl bg-muted/30">
              <Image
                src="/hero/hero-main.jpg"
                alt="Camisetas cristãs — catálogo"
                fill
                priority
                quality={85}
                className="object-cover object-center"
                sizes="(max-width:1024px) 0px, 50vw"
              />
              {/* Subtle overlay for blend */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6]/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile hero image — background */}
      <div className="absolute inset-0 lg:hidden">
        <div className="absolute bottom-0 right-0 top-0 w-1/2 opacity-[0.08] sm:opacity-[0.12]">
          <Image src="/hero/hero-main.jpg" alt="" fill className="object-cover object-center" sizes="50vw" priority />
        </div>
      </div>
    </section>
  )
}
