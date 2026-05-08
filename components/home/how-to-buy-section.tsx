import { Shirt, Ruler, ShoppingBag, MessageCircle } from "lucide-react"

const steps = [
  { n: 1, title: "Escolha", desc: "Navegue o catálogo", icon: Shirt },
  { n: 2, title: "Configure", desc: "Tamanho e cor", icon: Ruler },
  { n: 3, title: "Monte", desc: "Adicione à sacola", icon: ShoppingBag },
  { n: 4, title: "Finalize", desc: "Envie pelo WhatsApp", icon: MessageCircle },
]

export function HowToBuySection() {
  return (
    <section className="py-8 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="text-center">
          <h2 className="font-serif text-lg font-bold sm:text-2xl">Como comprar</h2>
          <p className="mt-1 text-xs text-muted-foreground">Simples, rápido e com atendimento pessoal</p>
        </div>

        {/* 4 columns even on mobile — compact icons */}
        <div className="mt-6 grid grid-cols-4 gap-2 sm:mt-10 sm:gap-6">
          {steps.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.n} className="text-center">
                <div className="relative mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background sm:h-14 sm:w-14">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C2A87D] text-[8px] font-bold text-white sm:h-5 sm:w-5 sm:text-[9px]">{s.n}</span>
                </div>
                <p className="mt-2 text-[10px] font-semibold sm:mt-3 sm:text-sm">{s.title}</p>
                <p className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">{s.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
