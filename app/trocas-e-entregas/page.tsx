import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { MessageCircle, Truck, RefreshCw, Clock, HelpCircle } from "lucide-react"
import { WHATSAPP_NUMBER, createWhatsAppLink } from "@/lib/whatsapp"

export const metadata = {
  title: "Trocas e Entregas | Fashion Store",
  description:
    "Informações sobre trocas, entregas e políticas da Fashion Store.",
}

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="min-h-dvh py-8 lg:py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-bold lg:text-4xl">
              Trocas e Entregas
            </h1>
            <p className="mt-3 text-muted-foreground">
              Tudo o que você precisa saber sobre nosso processo
            </p>
          </div>

          <div className="mt-12 space-y-8">
            {/* Important Notice */}
            <div className="rounded-lg bg-muted p-6 text-center">
              <HelpCircle className="mx-auto h-10 w-10 text-muted-foreground" />
              <h2 className="mt-4 font-serif text-lg font-semibold">
                Atendimento Personalizado
              </h2>
              <p className="mt-2 text-muted-foreground">
                As condições de troca, entrega, retirada, prazos e formas de
                pagamento são confirmadas diretamente pelo WhatsApp no momento
                do atendimento.
              </p>
            </div>

            {/* Delivery */}
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-serif text-lg font-semibold">Entrega</h2>
              </div>
              <div className="mt-4 space-y-3 text-muted-foreground">
                <p>
                  A entrega é combinada diretamente com a Fashion Store pelo
                  WhatsApp. Informamos prazos, custos e opções disponíveis no
                  momento do atendimento.
                </p>
                <p>
                  Trabalhamos com diferentes modalidades de entrega para
                  atender você da melhor forma, seja em Juiz de Fora ou outras
                  regiões.
                </p>
              </div>
            </div>

            {/* Exchanges */}
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <RefreshCw className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-serif text-lg font-semibold">Trocas</h2>
              </div>
              <div className="mt-4 space-y-3 text-muted-foreground">
                <p>
                  Caso precise trocar alguma peça, entre em contato pelo
                  WhatsApp para combinar as condições. Avaliamos cada caso de
                  forma personalizada.
                </p>
                <p>
                  Recomendamos verificar o guia de medidas antes de finalizar
                  seu pedido para garantir o tamanho ideal.
                </p>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-serif text-lg font-semibold">Pagamento</h2>
              </div>
              <div className="mt-4 space-y-3 text-muted-foreground">
                <p>
                  O pagamento não é realizado pelo site. Todas as formas de
                  pagamento disponíveis são informadas e combinadas diretamente
                  pelo WhatsApp.
                </p>
                <p>
                  Isso garante um atendimento mais seguro e personalizado para
                  você.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-lg border bg-card p-6 text-center">
              <p className="text-muted-foreground">
                Em caso de dúvidas, fale com a Fashion Store antes de finalizar
                seu pedido.
              </p>
              <a
                href={createWhatsAppLink(
                  WHATSAPP_NUMBER,
                  "Olá! Vim pelo site da Fashion Store e tenho dúvidas sobre trocas e entregas."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block"
              >
                <Button className="gap-2 bg-[#25D366] text-white hover:bg-[#128C7E]">
                  <MessageCircle className="h-4 w-4" />
                  Falar no WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
