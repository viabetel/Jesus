import { MessageCircle } from "lucide-react"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"

const steps = [
  { n: "01", t: "Escolha sua peça", s: "Navegue pelo catálogo e selecione a camiseta." },
  { n: "02", t: "Chame no WhatsApp", s: "Mande a peça escolhida com tamanho e cor." },
  { n: "03", t: "Confirmação rápida", s: "Confirmamos estoque, valor e forma de entrega." },
  { n: "04", t: "Finalize com segurança", s: "Você recebe os dados de pagamento e a peça." },
]

export function ComoComprarSection() {
  return (
    <section className="bg-[var(--ink)] text-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
        <div className="text-center mb-10 sm:mb-14">
          <p className="caps text-[10px] tracking-[0.22em] text-white/55 sm:text-[11px]">Sem checkout complicado</p>
          <h2 className="mt-2 font-serif-italic text-[28px] leading-none sm:mt-3 sm:text-[36px] lg:text-[44px]">Como comprar</h2>
          <p className="mt-3 text-[13px] text-white/70 max-w-[560px] mx-auto sm:mt-5 sm:text-[15px]">
            Você escolhe no catálogo e fala direto com a gente. Atendimento humano, do começo ao fim.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-2 md:grid-cols-4">
          {steps.map(st => (
            <div key={st.n} className="bg-[var(--ink)] p-6 sm:p-8">
              <p className="font-serif-italic text-[48px] leading-none text-white/15 sm:text-[64px]">{st.n}</p>
              <h3 className="mt-3 caps text-[10px] tracking-[0.14em] sm:mt-4 sm:text-[12px]">{st.t}</h3>
              <p className="mt-2 text-[12px] text-white/65 leading-relaxed sm:mt-3 sm:text-[13.5px]">{st.s}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center sm:mt-12">
          <a
            href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Vim pelo site e gostaria de comprar uma camiseta.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[var(--wa)] text-white caps text-[10px] px-6 h-11 hover:opacity-90 transition sm:text-[11px] sm:px-7 sm:h-12"
          >
            <MessageCircle size={15} /> Falar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
