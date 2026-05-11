import Link from "next/link"
import { ArrowRight, MessageCircle } from "lucide-react"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"

const banners = [
  {
    eyebrow: "LANÇAMENTOS",
    title: "Novo drop da semana",
    text: "Peças com propósito para renovar seu guarda-roupa.",
    cta: "Ver lançamentos",
    href: "/produtos?categoria=lancamentos",
    gradient: "from-stone-900 via-stone-800 to-stone-900",
    light: false,
  },
  {
    eyebrow: "COMPRA RÁPIDA",
    title: "Pronta entrega",
    text: "Escolha sua peça e finalize pelo WhatsApp.",
    cta: "Comprar agora",
    href: "/produtos?destaque=pronta-entrega",
    gradient: "from-emerald-900 via-emerald-800 to-emerald-900",
    light: false,
    whatsapp: true,
  },
]

export function CommercialBannersSection() {
  return (
    <section className="py-4 sm:py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {banners.map(b => (
            <Link
              key={b.title}
              href={b.href}
              className="group relative flex min-h-[160px] flex-col justify-end overflow-hidden rounded-xl p-5 sm:min-h-[180px] sm:p-6 lg:min-h-[200px] lg:p-8"
            >
              {/* Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${b.gradient} transition-all duration-500`} />
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: "radial-gradient(circle at 30% 70%, white 0.5px, transparent 0.5px)",
                backgroundSize: "40px 40px",
              }} />

              <div className="relative text-white">
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/45 sm:text-[10px]">
                  {b.eyebrow}
                </span>
                <h3 className="mt-1.5 text-[17px] font-bold leading-tight sm:text-[19px] lg:text-xl"
                  style={{ fontFamily: "var(--font-serif)" }}>
                  {b.title}
                </h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-white/50 sm:text-[12px] lg:text-[13px]">
                  {b.text}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground transition-all group-hover:bg-white/95 sm:text-[11px]">
                  {b.whatsapp && <MessageCircle className="h-3 w-3 text-[#25D366]" />}
                  {b.cta}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
