import { FashionHeader } from "@/components/fashion/Header"
import { FashionFooter } from "@/components/fashion/Footer"
import { CartContent } from "@/components/cart/cart-content"

export const metadata = {
  title: "Sacola | Fashion Store",
  description: "Revise seus itens e finalize seu pedido pelo WhatsApp.",
}

export default function CartPage() {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 bg-white border-b border-[var(--border)]">
        <FashionHeader />
      </div>
      <main className="min-h-dvh pt-36 pb-24 bg-white">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <div className="text-[11px] caps tracking-[0.22em] text-[var(--muted-foreground)]">Fashion Store / Sacola</div>
          <h1 className="mt-4 font-serif italic font-bold text-[32px] leading-none sm:text-[42px] lg:text-[52px]">Sua Sacola</h1>
          <div className="mt-8">
            <CartContent />
          </div>
        </div>
      </main>
      <FashionFooter />
    </>
  )
}
