import { FashionHeader } from "@/components/fashion/Header"
import { FashionFooter } from "@/components/fashion/Footer"


export const metadata = {
  title: "Termos de Uso | Fashion Store",
  description: "Termos de uso da Fashion Store.",
}

export default function TermsPage() {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 bg-white border-b border-border"><FashionHeader /></div>
      <main className="min-h-dvh pt-44 pb-24 bg-bg">
        <div className="mx-auto max-w-[980px] px-6 sm:px-10">
          <div className="text-[11px] caps tracking-[0.22em] text-muted-fg">Fashion Store / Termos</div>
          <h1 className="mt-4 font-serif italic font-bold text-[36px] leading-none sm:text-[52px]">Termos de Uso</h1>
          <div className="mt-10 space-y-8 text-[14px] leading-relaxed text-fg-soft sm:text-[15px]">
            <section>
              <h2 className="caps text-[12px] text-ink mb-3">Uso do site</h2>
              <p>Este site funciona como uma vitrine digital da Fashion Store. As informações de produtos, preços, disponibilidade e condições podem ser confirmadas no atendimento pelo WhatsApp antes da finalização do pedido.</p>
            </section>
            <section>
              <h2 className="caps text-[12px] text-ink mb-3">Pedidos e atendimento</h2>
              <p>A finalização dos pedidos ocorre pelo WhatsApp. Após selecionar os produtos, o cliente pode enviar a sacola para confirmação de estoque, forma de pagamento, entrega ou retirada.</p>
            </section>
            <section>
              <h2 className="caps text-[12px] text-ink mb-3">Produtos e disponibilidade</h2>
              <p>A disponibilidade das peças pode variar conforme tamanho, cor e estoque. Caso algum item não esteja disponível, a Fashion Store poderá sugerir alternativas semelhantes.</p>
            </section>
            <section>
              <h2 className="caps text-[12px] text-ink mb-3">Privacidade</h2>
              <p>Os dados informados no atendimento são utilizados apenas para contato, confirmação do pedido e entrega. Consulte também a nossa <a href="/privacidade" className="underline underline-offset-4">Política de Privacidade</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <FashionFooter />
    </>
  )
}
