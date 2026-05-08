import { WHATSAPP_DISPLAY, STORE_EMAIL } from "@/lib/whatsapp"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Shield } from "lucide-react"

export const metadata = {
  title: "Política de Privacidade | Fashion Store",
  description: "Política de privacidade da Fashion Store.",
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-dvh py-8 lg:py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mt-6 font-serif text-3xl font-bold lg:text-4xl">
              Política de Privacidade
            </h1>
            <p className="mt-3 text-muted-foreground">
              Sua privacidade é importante para nós
            </p>
          </div>

          <div className="prose prose-gray mt-12 max-w-none">
            <div className="rounded-lg border bg-card p-6 lg:p-8">
              <h2 className="font-serif text-xl font-semibold">
                Coleta de Dados
              </h2>
              <p className="mt-4 text-muted-foreground">
                A Fashion Store coleta apenas os dados necessários para
                identificação do cliente, contato, gerenciamento de favoritos,
                sacola de compras e envio do pedido pelo WhatsApp.
              </p>

              <h2 className="mt-8 font-serif text-xl font-semibold">
                Dados Coletados
              </h2>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>Número de WhatsApp</li>
                <li>Endereço de entrega (quando informado)</li>
                <li>Preferências de tamanho (quando informadas)</li>
              </ul>

              <h2 className="mt-8 font-serif text-xl font-semibold">
                Uso dos Dados
              </h2>
              <p className="mt-4 text-muted-foreground">
                Os dados coletados são utilizados exclusivamente para:
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>Identificação do cliente</li>
                <li>Comunicação sobre pedidos</li>
                <li>Gerenciamento de favoritos e sacola</li>
                <li>Envio de pedidos pelo WhatsApp</li>
                <li>Histórico de compras</li>
              </ul>

              <h2 className="mt-8 font-serif text-xl font-semibold">
                Armazenamento
              </h2>
              <p className="mt-4 text-muted-foreground">
                Os dados são armazenados localmente no seu navegador
                (localStorage) para facilitar sua experiência de compra. Não
                compartilhamos seus dados com terceiros.
              </p>

              <h2 className="mt-8 font-serif text-xl font-semibold">
                Dados Sensíveis
              </h2>
              <p className="mt-4 text-muted-foreground">
                A Fashion Store não solicita dados sensíveis como CPF, RG,
                dados bancários ou informações de cartão de crédito pelo site.
                Todas as transações de pagamento são realizadas diretamente
                pelo WhatsApp.
              </p>

              <h2 className="mt-8 font-serif text-xl font-semibold">
                Seus Direitos
              </h2>
              <p className="mt-4 text-muted-foreground">
                Você pode solicitar a exclusão dos seus dados a qualquer
                momento entrando em contato pelo WhatsApp ou e-mail.
              </p>

              <h2 className="mt-8 font-serif text-xl font-semibold">
                Contato
              </h2>
              <p className="mt-4 text-muted-foreground">
                Em caso de dúvidas sobre esta política, entre em contato pelo
                e-mail {STORE_EMAIL} ou pelo WhatsApp {WHATSAPP_DISPLAY}.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
