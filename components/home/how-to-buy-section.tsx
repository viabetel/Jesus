import { Shirt, Palette, ShoppingBag, MessageCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"

const steps = [
  { n: 1, title: "Navegue", desc: "Explore o catálogo online e encontre peças que expressam sua fé.", icon: Shirt },
  { n: 2, title: "Personalize", desc: "Escolha cor, tamanho e veja cada detalhe da estampa.", icon: Palette },
  { n: 3, title: "Monte a sacola", desc: "Adicione tudo que quiser e revise antes de pedir.", icon: ShoppingBag },
  { n: 4, title: "Finalize pelo WhatsApp", desc: "Pedido direto, pagamento flexível, atendimento pessoal.", icon: MessageCircle },
]

export function HowToBuySection() {
  return (
    <section className="py-10 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C2A87D] sm:text-[11px]">Simples e rápido</p>
          <h2 className="mt-1.5 font-serif text-xl font-bold sm:text-2xl lg:text-3xl">Como comprar</h2>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">Sem cadastro, sem complicação. Tudo pelo WhatsApp.</p>
        </div>

        <div className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-4 sm:gap-0">
          {steps.map((s, i) => {
            const Icon = s.icon
            const isLast = i === steps.length - 1
            return (
              <div key={s.n} className="relative flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
                {/* Connector line — between steps on desktop */}
                {!isLast && (
                  <div className="absolute left-5 top-12 h-[calc(100%-12px)] w-px bg-border sm:left-1/2 sm:top-5 sm:h-px sm:w-[calc(100%-40px)] sm:translate-x-[20px]" />
                )}
                {/* Circle */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-md sm:h-12 sm:w-12">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C2A87D] text-[7px] font-bold text-white ring-2 ring-background sm:h-5 sm:w-5 sm:text-[8px]">
                    {s.n}
                  </span>
                </div>
                {/* Text */}
                <div className="min-w-0 flex-1 pb-4 sm:mt-3 sm:px-2 sm:pb-0">
                  <p className="text-xs font-semibold sm:text-sm">{s.title}</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground sm:text-xs">{s.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center sm:mt-12">
          <a
            href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Gostaria de fazer um pedido.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="h-12 gap-2 rounded-full bg-[#25D366] px-8 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-[#1DA851] hover:shadow-xl sm:text-sm">
              <MessageCircle className="h-4 w-4" /> Comprar agora pelo WhatsApp
            </Button>
          </a>
          <p className="mt-3 text-[10px] text-muted-foreground sm:text-xs">
            Disponibilidade, pagamento e entrega confirmados no atendimento.
          </p>
        </div>
      </div>
    </section>
  )
}
