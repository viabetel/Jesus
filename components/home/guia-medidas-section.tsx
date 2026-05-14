
import { Ruler, MessageCircle } from "lucide-react"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"

export function GuiaMedidasSection() {
  return (
    <section className="bg-[var(--cream)]">
      <div className="mx-auto max-w-[1600px] px-6 py-16 sm:px-10 sm:py-20 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12 items-center">
        <div className="max-w-[520px]">
          <p className="caps text-[10px] tracking-[0.22em] text-[var(--muted-foreground)] sm:text-[11px]">Antes de pedir</p>
          <h2 className="mt-2 font-serif-italic text-[28px] leading-[0.95] sm:mt-3 sm:text-[36px] lg:text-[44px]">Dúvida no tamanho?</h2>
          <p className="mt-3 text-[13px] text-[var(--fg-soft)] leading-relaxed sm:mt-5 sm:text-[15px]">
            Consulte o guia de medidas ou fale com a gente antes de finalizar. A gente te orienta para acertar na primeira escolha.
          </p>
          <div className="mt-6 flex items-center gap-3 flex-wrap sm:mt-8 sm:gap-4">
            <a
              href="/guia-de-medidas"
              className="inline-flex items-center gap-3 bg-[var(--ink)] text-white caps text-[10px] px-6 h-11 hover:bg-[var(--fg-soft)] transition sm:text-[11px] sm:px-7 sm:h-12"
            >
              <Ruler size={14} /> Ver guia de medidas
            </a>
            <a
              href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Preciso de ajuda com o tamanho da camiseta.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 caps text-[10px] text-[var(--ink)] border-b border-[var(--ink)]/20 hover:border-[var(--ink)] pb-1 transition sm:text-[11px]"
            >
              <MessageCircle size={13} className="text-[var(--wa)]" /> Tirar dúvida no WhatsApp
            </a>
          </div>
        </div>

        {/* Mini table */}
        <div className="bg-white p-6 sm:p-8">
          <p className="caps text-[9px] text-[var(--muted-foreground)] mb-3 sm:text-[10.5px] sm:mb-4">Tradicional · cm</p>
          <table className="w-full text-[12px] sm:text-[13.5px]">
            <thead>
              <tr className="text-left caps text-[9px] text-[var(--muted-foreground)] border-b border-[var(--border)] sm:text-[10.5px]">
                <th className="py-2.5 font-normal sm:py-3">Tamanho</th>
                <th className="py-2.5 font-normal sm:py-3">Tórax</th>
                <th className="py-2.5 font-normal sm:py-3">Comprimento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {[["P", "50", "68"], ["M", "53", "70"], ["G", "56", "72"], ["GG", "59", "74"]].map(([t, p, c]) => (
                <tr key={t}>
                  <td className="py-2.5 caps text-[10px] sm:py-3 sm:text-[11px]">{t}</td>
                  <td className="py-2.5 sm:py-3">{p}</td>
                  <td className="py-2.5 sm:py-3">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
