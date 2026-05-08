import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CartContent } from "@/components/cart/cart-content"

export const metadata = {
  title: "Sacola | Fashion Store",
  description: "Revise seus itens e finalize seu pedido pelo WhatsApp.",
}

export default function CartPage() {
  return (
    <>
      <Header />
      <main className="min-h-dvh py-8 lg:py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="mb-8 font-serif text-3xl font-bold">Sua Sacola</h1>
          <CartContent />
        </div>
      </main>
      <Footer />
    </>
  )
}
