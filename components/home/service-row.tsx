import { MessageCircle, CheckCircle, Ruler, ArrowRight } from "lucide-react"

const items = [
  { icon: MessageCircle, title: "Compra pelo WhatsApp", desc: "Você fala direto com a gente, sem complicação." },
  { icon: CheckCircle, title: "Pronta entrega", desc: "Peças disponíveis para envio ou retirada." },
  { icon: Ruler, title: "Guia de medidas", desc: "Confira o tamanho ideal antes de pedir." },
  { icon: ArrowRight, title: "Troca facilitada", desc: "A gente te orienta para acertar na escolha." },
]

export function ServiceRow() {
  return (
    <section className="border-t border-b border-[var(--border)] bg-white py-8 sm:py-10">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10 grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4 md:gap-10">
        {items.map(it => {
          const Icon = it.icon
          return (
            <div key={it.title} className="flex items-start gap-3 sm:gap-4">
              <div className="h-10 w-10 grid place-items-center border border-[var(--border)] shrink-0 sm:h-11 sm:w-11">
                <Icon size={16} strokeWidth={1.5} className="sm:h-[18px] sm:w-[18px]" />
              </div>
              <div>
                <h4 className="caps text-[10px] text-[var(--ink)] sm:text-[11.5px]">{it.title}</h4>
                <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)] leading-snug sm:mt-1 sm:text-[12.5px]">{it.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
