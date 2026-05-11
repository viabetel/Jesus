import Image from "next/image"
import { FashionHeader as Header } from "@/components/fashion/Header"
import { FashionFooter as Footer } from "@/components/fashion/Footer"
import { Heart, Star, Shield, Sparkles } from "lucide-react"

export const metadata = {
  title: "Quem Somos",
  description: "Conheça a Fashion Store — Loja online de Juiz de Fora/MG com moda cristã, identidade, propósito e estilo.",
}

const values = [
  { title: "Nossa Essência", description: "Unimos fé e moda de forma autêntica. Cada camiseta carrega uma mensagem de propósito para quem veste.", icon: Heart },
  { title: "Estilo", description: "Design moderno e atemporal que combina com qualquer ocasião, do casual ao encontro especial.", icon: Sparkles },
  { title: "Qualidade", description: "Materiais premium, estampas duráveis e acabamento impecável em cada peça que produzimos.", icon: Star },
  { title: "Confiança", description: "Atendimento transparente e personalizado pelo WhatsApp, do primeiro contato à entrega.", icon: Shield },
]

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-dvh">
        {/* Hero */}
        <section className="bg-[#1a1a1a] py-20 text-[#FAF9F6] lg:py-28">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <Image
              src="/brand/logo-light.png"
              alt="Fashion Store"
              width={80}
              height={80}
              className="mx-auto h-20 w-20"
            />
            <h1 className="mt-8 font-serif text-3xl font-bold lg:text-4xl">Quem Somos</h1>
            <p className="mt-4 text-sm tracking-[0.1em] text-[#FAF9F6]/50 uppercase">Estilo · Qualidade · Confiança</p>
          </div>
        </section>

        {/* About */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="mx-auto mb-8 h-px w-12 bg-[#C2A87D]" />
            <p className="text-lg leading-relaxed text-muted-foreground">
              A <strong className="text-foreground">Fashion Store</strong> é uma loja online de Juiz de Fora, MG, criada para levar moda cristã com identidade, propósito e estilo.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Nossas camisetas foram pensadas para quem deseja vestir uma mensagem de fé no dia a dia, com qualidade, conforto e uma estética atual.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="bg-muted/30 py-20 lg:py-28">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center font-serif text-2xl font-bold lg:text-3xl">Nossos Valores</h2>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6">
              {values.map((value) => {
                const Icon = value.icon
                return (
                  <div key={value.title} className="rounded-xl border border-border/50 bg-card p-7 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-foreground/5">
                      <Icon className="h-6 w-6 text-foreground/70" />
                    </div>
                    <h3 className="mt-5 font-serif text-base font-semibold">{value.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Faith */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="font-serif text-2xl font-bold lg:text-3xl">Fé com Identidade</h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground lg:text-lg">
              Acreditamos que a moda pode ser uma forma de expressar o que carregamos no coração.
              Cada peça da Fashion Store foi criada para quem quer vestir sua fé com autenticidade,
              sem abrir mão do estilo e da qualidade.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {["Moda com propósito", "Mensagens de fé", "Identidade cristã"].map((tag) => (
                <span key={tag} className="rounded-full bg-foreground px-5 py-2 text-xs font-medium tracking-wide text-background">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
