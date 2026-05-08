import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"

export function CtaSection() {
  return (
    <section className="py-8 sm:py-14 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-2xl bg-[#1a1a1a] px-5 py-10 text-center text-[#FAF9F6] sm:px-12 sm:py-16 lg:py-20">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }} />
          <div className="relative">
            <div className="mx-auto mb-4 h-px w-10 bg-[#C2A87D]" />
            <h2 className="font-serif text-xl font-bold sm:text-2xl lg:text-4xl">Gostou de alguma peça?</h2>
            <p className="mx-auto mt-3 max-w-md text-xs text-[#FAF9F6]/50 sm:text-sm">
              Monte sua sacola e fale com a Fashion Store pelo WhatsApp. Estamos prontos para te atender!
            </p>
            <a href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Vim pelo site da Fashion Store e gostaria de finalizar meu pedido.")} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block sm:mt-8">
              <Button size="lg" className="h-11 gap-2 rounded-full bg-[#25D366] px-8 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#1DA851] sm:h-12 sm:text-sm">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                Falar no WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
