import { MessageCircle, Heart, ShieldCheck, Truck, Sparkles, Award } from "lucide-react"

const benefits = [
  { title: "Atendimento personalizado", description: "Suporte direto pelo WhatsApp", icon: MessageCircle },
  { title: "Mensagens cristãs", description: "Camisetas com propósito e fé", icon: Heart },
  { title: "Compra segura", description: "Processo simples e transparente", icon: ShieldCheck },
  { title: "Entrega combinada", description: "Direto no seu atendimento", icon: Truck },
  { title: "Novidades frequentes", description: "Lançamentos toda semana", icon: Sparkles },
  { title: "Qualidade garantida", description: "Estilo, qualidade e confiança", icon: Award },
]

export function BenefitsSection() {
  return (
    <section className="bg-muted/30 py-8 sm:py-14 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <p className="text-[11px] font-medium tracking-[0.2em] text-[#C2A87D] uppercase">Diferenciais</p>
          <h2 className="mt-2 font-serif text-xl font-bold sm:text-2xl lg:text-4xl">
            Por que escolher a Fashion Store?
          </h2>
        </div>

        {/* Mobile: 2-col grid | Desktop: 3-col */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-5 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div key={benefit.title} className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-4 text-center transition-shadow hover:shadow-sm sm:flex-row sm:items-start sm:gap-4 sm:p-6 sm:text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/5 sm:h-11 sm:w-11">
                  <Icon className="h-4 w-4 text-foreground/70 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xs font-semibold sm:text-sm">{benefit.title}</h3>
                  <p className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">{benefit.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
