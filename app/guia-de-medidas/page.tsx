import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { sizeChart } from "@/lib/data/products"
import { Ruler, MessageCircle, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"

export const metadata = {
  title: "Guia de Medidas | Fashion Store",
  description:
    "Encontre o tamanho ideal para suas camisetas. Confira nosso guia de medidas.",
}

export default function SizeGuidePage() {
  return (
    <>
      <Header />
      <main className="min-h-dvh py-8 lg:py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Ruler className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mt-6 font-serif text-3xl font-bold lg:text-4xl">
              Guia de Medidas
            </h1>
            <p className="mt-3 text-muted-foreground">
              Encontre o tamanho perfeito para você
            </p>
          </div>

          {/* Size Table */}
          <div className="mt-12 overflow-hidden rounded-lg border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left font-serif font-semibold">
                      Tamanho
                    </th>
                    <th className="px-6 py-4 text-center font-serif font-semibold">
                      Largura
                    </th>
                    <th className="px-6 py-4 text-center font-serif font-semibold">
                      Comprimento
                    </th>
                    <th className="px-6 py-4 text-center font-serif font-semibold">
                      Manga
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sizeChart.map((row, index) => (
                    <tr
                      key={row.size}
                      className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}
                    >
                      <td className="px-6 py-4 font-semibold">{row.size}</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">
                        {row.width}
                      </td>
                      <td className="px-6 py-4 text-center text-muted-foreground">
                        {row.length}
                      </td>
                      <td className="px-6 py-4 text-center text-muted-foreground">
                        {row.sleeve}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* How to Measure */}
          <div className="mt-8 rounded-lg border bg-card p-6">
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
              <HelpCircle className="h-5 w-5" />
              Como medir
            </h2>
            <div className="mt-4 space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Largura:</strong> Meça de
                uma lateral à outra, passando pela parte mais larga da peça
                (embaixo das mangas).
              </p>
              <p>
                <strong className="text-foreground">Comprimento:</strong> Meça
                do ponto mais alto do ombro até a barra inferior da camiseta.
              </p>
              <p>
                <strong className="text-foreground">Manga:</strong> Meça da
                costura do ombro até o final da manga.
              </p>
            </div>
          </div>

          {/* Tip */}
          <div className="mt-6 rounded-lg bg-muted p-6 text-center">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Dica:</strong> Compare as
              medidas com uma camiseta que você já usa e gosta do caimento.
            </p>
          </div>

          {/* Contact */}
          <div className="mt-8 rounded-lg border bg-card p-6 text-center">
            <p className="text-muted-foreground">
              Em caso de dúvida sobre tamanho, fale com a Fashion Store pelo
              WhatsApp antes de finalizar seu pedido.
            </p>
            <a
              href={createWhatsAppLink(
                WHATSAPP_NUMBER,
                "Olá! Vim pelo site da Fashion Store e tenho dúvidas sobre tamanhos."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block"
            >
              <Button className="gap-2 bg-[#25D366] text-white hover:bg-[#128C7E]">
                <MessageCircle className="h-4 w-4" />
                Tirar dúvidas no WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
