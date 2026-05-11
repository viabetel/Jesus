"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"

const departments = [
  {
    name: "Camisetas",
    slug: "camisetas",
    description: "Mensagens de fé para o dia a dia",
    href: "/produtos?categoria=camisetas",
    image: "/categories/camisetas.jpg",
    gradient: "from-stone-800 to-stone-900",
  },
  {
    name: "Oversized",
    slug: "oversized",
    description: "Modelagem ampla, urbana e confortável",
    href: "/produtos?categoria=oversized",
    image: "/categories/oversized.jpg",
    gradient: "from-zinc-800 to-neutral-900",
  },
  {
    name: "Baby Look",
    slug: "baby-look",
    description: "Peças femininas com mensagem",
    href: "/produtos?categoria=baby-look",
    image: "/categories/baby-look.jpg",
    gradient: "from-rose-200 via-amber-100 to-stone-200",
    lightBg: true,
  },
  {
    name: "Lançamentos",
    slug: "lancamentos",
    description: "Os últimos drops da loja",
    href: "/produtos?categoria=lancamentos",
    image: "/categories/lancamentos.jpg",
    gradient: "from-amber-100 via-stone-100 to-orange-100",
    lightBg: true,
    badge: "Novo",
  },
  {
    name: "Promoções",
    slug: "promocoes",
    description: "Peças com condições especiais",
    href: "/produtos?categoria=promocoes",
    image: "/categories/promocoes.jpg",
    gradient: "from-red-800 to-red-950",
  },
  {
    name: "Pronta Entrega",
    slug: "pronta-entrega",
    description: "Escolha e finalize pelo WhatsApp",
    href: "/produtos?destaque=pronta-entrega",
    image: "/categories/pronta-entrega.jpg",
    gradient: "from-emerald-800 to-emerald-950",
  },
]

export function CategoriesSection() {
  return (
    <section className="py-10 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <h2 className="text-xl font-bold sm:text-2xl lg:text-3xl" style={{ fontFamily: "var(--font-serif)" }}>
            Comprar por categoria
          </h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground sm:text-sm">
            Encontre peças por estilo, ocasião e modelagem.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 lg:gap-4">
          {departments.map((dept) => (
            <DepartmentCard key={dept.slug} dept={dept} />
          ))}
        </div>
      </div>
    </section>
  )
}

function DepartmentCard({ dept }: { dept: typeof departments[number] }) {
  const isLight = dept.lightBg

  return (
    <Link
      href={dept.href}
      className="group relative flex min-h-[160px] flex-col justify-end overflow-hidden rounded-xl sm:min-h-[200px] lg:min-h-[240px]"
    >
      {/* Background — image or gradient */}
      <ImageWithFallback
        src={dept.image}
        alt={dept.name}
        gradient={dept.gradient}
      />

      {/* Overlay */}
      {!isLight && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent transition-all duration-300 group-hover:from-black/70" />}
      {isLight && <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />}

      {/* Content */}
      <div className={`relative p-3.5 sm:p-5 ${isLight ? "text-foreground" : "text-white"}`}>
        {dept.badge && (
          <span className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
            isLight ? "bg-foreground/10 text-foreground/60" : "bg-white/15 text-white/80"
          }`}>
            {dept.badge}
          </span>
        )}
        <h3 className="text-[14px] font-bold leading-tight sm:text-[16px] lg:text-lg" style={{ fontFamily: "var(--font-serif)" }}>
          {dept.name}
        </h3>
        <p className={`mt-0.5 text-[10px] leading-snug sm:text-[11px] lg:text-xs ${isLight ? "text-foreground/45" : "text-white/55"}`}>
          {dept.description}
        </p>
        <span className={`mt-2.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider sm:text-[11px] ${
          isLight ? "text-foreground/50 group-hover:text-foreground" : "text-white/60 group-hover:text-white"
        } transition-colors`}>
          Ver peças <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

/* Image with automatic gradient fallback */
function ImageWithFallback({ src, alt, gradient }: { src: string; alt: string; gradient: string }) {
  return (
    <>
      {/* Gradient always renders as base layer */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      {/* Image on top (will fail silently if not found) */}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        sizes="(max-width:640px) 50vw, 33vw"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    </>
  )
}
