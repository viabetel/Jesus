
import Image from "next/image"
import { Instagram, Mail, MapPin, MessageCircle } from "lucide-react"
import {
  WHATSAPP_NUMBER,
  WHATSAPP_DISPLAY,
  STORE_EMAIL,
  STORE_INSTAGRAM,
  STORE_INSTAGRAM_URL,
  STORE_TAGLINE,
  createWhatsAppLink,
} from "@/lib/whatsapp"

const quickLinks = [
  { name: "Início", href: "/" },
  { name: "Produtos", href: "/produtos" },
  { name: "Favoritos", href: "/favoritos" },
  { name: "Minha Conta", href: "/minha-conta" },
]

const supportLinks = [
  { name: "Guia de Medidas", href: "/guia-de-medidas" },
  { name: "Quem Somos", href: "/quem-somos" },
  { name: "Contato", href: "/contato" },
  { name: "Trocas e Entregas", href: "/trocas-e-entregas" },
  { name: "Privacidade", href: "/privacidade" },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-[#1a1a1a] text-[#FAF9F6]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:py-20">
        {/* Brand — full width on top */}
        <div className="mb-8 sm:mb-10">
          <a href="/" className="inline-flex items-center gap-3">
            <Image src="/brand/logo-light.png" alt="Fashion Store" width={40} height={40} className="h-10 w-10 sm:h-12 sm:w-12" />
            <div>
              <span className="block font-serif text-base font-semibold sm:text-lg">Fashion Store</span>
              <span className="text-[9px] tracking-[0.12em] text-[#FAF9F6]/50 uppercase sm:text-[10px]">{STORE_TAGLINE}</span>
            </div>
          </a>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-[#FAF9F6]/50 sm:text-sm sm:text-[#FAF9F6]/60">
            Camisetas cristãs com estilo, qualidade e propósito.
          </p>
        </div>

        {/* Links — 2x2 on mobile, 4 cols on desktop */}
        <div className="grid grid-cols-2 gap-6 sm:gap-10 lg:grid-cols-4">
          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-[#C2A87D] uppercase sm:mb-5 sm:text-[11px]">Links Rápidos</h3>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-xs text-[#FAF9F6]/60 transition-colors hover:text-[#FAF9F6] sm:text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-[#C2A87D] uppercase sm:mb-5 sm:text-[11px]">Suporte</h3>
            <ul className="space-y-2 sm:space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-xs text-[#FAF9F6]/60 transition-colors hover:text-[#FAF9F6] sm:text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-[#C2A87D] uppercase sm:mb-5 sm:text-[11px]">Contato</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a
                  href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá! Vim pelo site da Fashion Store e gostaria de conhecer as camisetas disponíveis.")}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-[#FAF9F6]/60 transition-colors hover:text-[#25D366] sm:text-sm"
                >
                  <MessageCircle className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li>
                <a href={`mailto:${STORE_EMAIL}`} className="flex items-center gap-2 text-xs text-[#FAF9F6]/60 transition-colors hover:text-[#FAF9F6] sm:text-sm">
                  <Mail className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                  <span className="truncate">{STORE_EMAIL}</span>
                </a>
              </li>
              <li>
                <a href={STORE_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[#FAF9F6]/60 transition-colors hover:text-[#FAF9F6] sm:text-sm">
                  <Instagram className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                  {STORE_INSTAGRAM}
                </a>
              </li>
            </ul>
          </div>

          {/* Location */}
          <div>
            <h3 className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-[#C2A87D] uppercase sm:mb-5 sm:text-[11px]">Localização</h3>
            <div className="flex items-center gap-2 text-xs text-[#FAF9F6]/40 sm:text-sm">
              <MapPin className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              Juiz de Fora, MG
            </div>
            <p className="mt-1 text-[10px] text-[#FAF9F6]/30 sm:text-xs">Loja online</p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-[#FAF9F6]/10 pt-6 sm:mt-14 sm:pt-8">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-[10px] text-[#FAF9F6]/30 sm:text-[11px]">
              © {currentYear} Fashion Store. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-5">
              <a href={STORE_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-[#FAF9F6]/30 transition-colors hover:text-[#FAF9F6]/70" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href={createWhatsAppLink(WHATSAPP_NUMBER, "Olá!")} target="_blank" rel="noopener noreferrer" className="text-[#FAF9F6]/30 transition-colors hover:text-[#25D366]" aria-label="WhatsApp">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
