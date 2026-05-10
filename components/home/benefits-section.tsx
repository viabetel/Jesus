import { MessageCircle, Heart, ShieldCheck, Truck, Sparkles, Award } from "lucide-react"

const benefits = [
  { title: "Atendimento humano", desc: "Nada de robô. Você fala direto com a gente pelo WhatsApp.", icon: MessageCircle },
  { title: "Fé com estilo", desc: "Cada estampa carrega uma mensagem cristã pensada com carinho.", icon: Heart },
  { title: "Compra transparente", desc: "Sem surpresas. Preço, forma de pagamento e entrega claros.", icon: ShieldCheck },
  { title: "Entrega combinada", desc: "A gente acerta tudo pelo WhatsApp: prazo, endereço e frete.", icon: Truck },
  { title: "Novidades toda semana", desc: "Novos drops, promoções e peças exclusivas com frequência.", icon: Sparkles },
  { title: "Qualidade real", desc: "Algodão premium, estampa durável, caimento que veste bem.", icon: Award },
]

export function BenefitsSection() {
  return (
    <section className="bg-gradient-to-b from-muted/40 to-background py-10 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C2A87D] sm:text-[11px]">
            Diferenciais
          </p>
          <h2 className="mt-1.5 font-serif text-xl font-bold sm:text-2xl lg:text-3xl">
            Por que comprar com a gente?
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:mt-12 sm:gap-4 lg:grid-cols-3">
          {benefits.map((b) => {
            const Icon = b.icon
            return (
              <div
                key={b.title}
                className="group rounded-xl border border-border/40 bg-card p-3.5 transition-all hover:border-border hover:shadow-md sm:p-5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/[0.04] transition-colors group-hover:bg-foreground/[0.08] sm:h-10 sm:w-10">
                  <Icon className="h-4 w-4 text-foreground/60 sm:h-[18px] sm:w-[18px]" />
                </div>
                <h3 className="mt-3 text-[11px] font-semibold leading-snug sm:text-sm">{b.title}</h3>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground sm:text-xs">{b.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
