import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function AboutSection() {
  return (
    <section className="py-8 sm:py-14 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 h-px w-10 bg-[#C2A87D]" />
          <h2 className="font-serif text-xl font-bold sm:text-2xl lg:text-4xl">
            Mais do que camisetas,
            <br />
            <span className="text-muted-foreground">uma mensagem.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-base lg:text-lg">
            A Fashion Store nasceu para unir moda cristã, propósito e estilo.
            Cada peça foi pensada para quem deseja vestir uma mensagem de fé com
            qualidade, conforto e identidade.
          </p>

          {/* Tags — horizontal scroll on mobile, wrap on desktop */}
          <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0">
            {["Fé com identidade", "Estilo moderno", "Qualidade premium", "Confiança sempre"].map((tag) => (
              <span key={tag} className="shrink-0 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-[10px] font-medium tracking-wide sm:px-5 sm:py-2 sm:text-xs">
                {tag}
              </span>
            ))}
          </div>

          <Link href="/quem-somos" className="mt-6 inline-block sm:mt-8">
            <Button variant="outline" size="sm" className="gap-2 rounded-full text-xs sm:text-sm">
              Conheça nossa história <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
