import Link from "next/link"
import { Icon } from "@/components/fashion/Icon"
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, STORE_EMAIL, createWhatsAppLink } from "@/lib/whatsapp"

const cols = {
  "Loja": [
    { label: "Masculino", href: "/produtos?categoria=camisetas" },
    { label: "Feminino", href: "/produtos?categoria=baby-look" },
    { label: "Oversized", href: "/produtos?categoria=oversized" },
    { label: "Lançamentos", href: "/produtos?categoria=lancamentos" },
    { label: "Promoções", href: "/produtos?categoria=promocoes" },
    { label: "Pronta Entrega", href: "/produtos?destaque=pronta-entrega" },
  ],
  "Atendimento": [
    { label: "Compra pelo WhatsApp", href: createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Vim pelo site."), external: true },
    { label: "Guia de Medidas", href: "/guia-de-medidas" },
    { label: "Trocas e Devoluções", href: "/trocas-e-entregas" },
    { label: "Política de Privacidade", href: "/privacidade" },
    { label: "Termos de Uso", href: "/termos-de-uso" },
  ],
  "Sobre": [
    { label: "Quem Somos", href: "/quem-somos" },
    { label: "Contato", href: "/contato" },
  ],
}

const socials = ["instagram", "tiktok", "pinterest", "facebook"] as const

export function FashionFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ink text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-6 py-12 grid gap-6 sm:px-10 sm:py-16 lg:grid-cols-2 lg:gap-10 items-center">
          <div>
            <p className="caps text-[10px] tracking-[0.22em] text-white/55 sm:text-[11px]">Newsletter</p>
            <h3 className="mt-3 font-serif italic font-bold text-[24px] leading-tight sm:mt-4 sm:text-[30px] lg:text-[36px]">
              Receba primeiro<br/>os próximos drops.
            </h3>
          </div>
          <div className="flex items-end gap-0">
            <div className="flex-1">
              <label className="caps text-[9px] text-white/55 sm:text-[10px]">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                className="mt-2 w-full bg-transparent border-0 border-b border-white/30 focus:border-white outline-none py-2 text-[14px] placeholder:text-white/35 sm:text-[15px]"
              />
            </div>
            <button className="ml-4 caps text-[10px] h-10 px-5 bg-white text-ink hover:bg-cream transition sm:ml-6 sm:text-[11px] sm:h-12 sm:px-8">Cadastrar</button>
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="mx-auto max-w-[1600px] px-6 py-14 grid gap-10 sm:px-10 sm:py-20 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-14">
        {/* Brand */}
        <div>
          <span className="font-serif italic font-bold text-[32px] leading-none sm:text-[44px]">
            Fashion<span className="text-[18px] not-italic font-normal align-top ml-0.5 sm:text-[24px]">®</span>
          </span>
          <p className="mt-4 text-[12px] leading-relaxed text-white/55 max-w-xs sm:mt-6 sm:text-[13px]">
            Moda cristã multisex com propósito. Camisetas masculinas, femininas e oversized com qualidade editorial. Compre online ou retire em Juiz de Fora/MG.
          </p>
          <div className="mt-5 space-y-2 text-[12px] text-white/65 sm:mt-7 sm:space-y-2.5 sm:text-[13px]">
            <div className="flex items-center gap-2.5">
              <Icon name="whatsapp" size={14} color="#25D366"/>
              <a href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá!")} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                {WHATSAPP_DISPLAY}
              </a>
            </div>
            <div className="flex items-center gap-2.5"><Icon name="mail" size={14}/> {STORE_EMAIL}</div>
            <div className="flex items-center gap-2.5"><Icon name="map-pin" size={14}/> Juiz de Fora · MG</div>
          </div>
          <div className="mt-5 flex items-center gap-4 sm:mt-7">
            {socials.map(s => (
              <a key={s} className="text-white/65 hover:text-white transition cursor-pointer">
                <Icon name={s} size={16}/>
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(cols).map(([title, items]) => (
          <div key={title}>
            <h4 className="caps text-[10px] text-white/55 mb-4 sm:text-[11px] sm:mb-6">{title}</h4>
            <ul className="space-y-2.5 sm:space-y-3.5">
              {items.map(l => (
                <li key={l.label}>
                  {'external' in l && l.external ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[12px] text-white/80 hover:text-white cursor-pointer transition sm:text-[13.5px]">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-[12px] text-white/80 hover:text-white cursor-pointer transition sm:text-[13.5px]">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1600px] px-6 py-5 flex flex-col items-center justify-between gap-3 sm:px-10 sm:py-6 sm:flex-row sm:flex-wrap sm:gap-4">
          <p className="text-[10px] text-white/40 sm:text-[11px]">© {year} Fashion Store · Todos os direitos reservados.</p>
          <div className="flex items-center gap-2 text-[9px] text-white/40 caps sm:text-[10px]">
            <span>Pague com</span>
            {["WhatsApp","Pix","Visa","Master","Boleto"].map(p => (
              <span key={p} className="px-2 py-0.5 border border-white/15 sm:px-2.5 sm:py-1">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
