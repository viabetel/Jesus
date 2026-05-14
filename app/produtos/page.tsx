import { Suspense } from "react"
import { FashionHeader } from "@/components/fashion/Header"
import { FashionFooter } from "@/components/fashion/Footer"
import { ProductsContent } from "@/components/products/products-content"
import { getPublicProducts } from "@/lib/services/public-catalog"

export const dynamic = "force-dynamic"
export const revalidate = 60

export const metadata = {
  title: "Produtos | Fashion Store",
  description: "Explore camisetas cristãs masculinas, femininas e oversized com estilo, qualidade e propósito.",
}

export default async function ProductsPage() {
  const products = await getPublicProducts()

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 bg-white border-b border-[var(--border)]">
        <FashionHeader />
      </div>
      <main className="min-h-dvh pt-32 overflow-x-hidden">
        <div className="mx-auto max-w-[1600px] px-6 py-6 sm:px-10 lg:py-10">
          <div className="text-[11px] caps tracking-[0.22em] text-[var(--muted-foreground)]">Fashion Store / Catálogo</div>
          <h1 className="mt-4 font-serif italic font-bold text-[32px] leading-none sm:text-[42px] lg:text-[52px]">Moda Cristã Multisex</h1>
          <p className="mt-3 text-[14px] text-[var(--fg-soft)] max-w-[640px] leading-relaxed sm:text-[15px]">
            Peças masculinas, femininas e oversized com mensagens de propósito. Escolha no catálogo e finalize pelo WhatsApp.
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
              <ProductsContent products={products} />
            </Suspense>
          </div>
        </div>
      </main>
      <FashionFooter />
    </>
  )
}
