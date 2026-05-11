import { Star } from "lucide-react"

const items = [
  { q: "Comprei pelo WhatsApp e fui muito bem atendida. Chegou rápido e a estampa é exatamente como na foto.", a: "Cliente Fashion Store", c: "Compra pelo WhatsApp · Juiz de Fora/MG" },
  { q: "A camiseta veste muito bem e a qualidade do tecido é ótima. Vou pedir mais cores.", a: "Cliente Fashion Store", c: "Oversized Propósito" },
  { q: "Gostei da mensagem e do conforto da peça. Combina com várias produções.", a: "Cliente Fashion Store", c: "Baby Look Sal e Luz" },
]

export function DepoimentosSection() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
        <div className="text-center mb-10 sm:mb-14">
          <p className="caps text-[10px] tracking-[0.22em] text-[var(--muted-foreground)] sm:text-[11px]">Quem já vestiu</p>
          <h2 className="mt-2 font-serif-italic text-[28px] leading-none sm:mt-3 sm:text-[36px] lg:text-[44px]">Depoimentos</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {items.map((it, i) => (
            <figure key={i} className="bg-[var(--cream)] p-6 sm:p-8">
              <div className="flex items-center gap-1 mb-4 sm:mb-5">
                {[0, 1, 2, 3, 4].map(s => (
                  <Star key={s} size={12} fill="var(--ink)" stroke="var(--ink)" />
                ))}
              </div>
              <blockquote className="font-serif-italic text-[16px] leading-snug sm:text-[20px]">
                &ldquo;{it.q}&rdquo;
              </blockquote>
              <figcaption className="mt-4 caps text-[9px] text-[var(--muted-foreground)] sm:mt-6 sm:text-[10.5px]">
                <span className="text-[var(--ink)]">{it.a}</span>
                <span className="block normal-case tracking-normal font-normal text-[10px] mt-1 text-[var(--muted-foreground)] sm:text-[11.5px]">{it.c}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
