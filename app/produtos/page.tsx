import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductsContent } from "@/components/products/products-content"

export const metadata = {
  title: "Produtos | Fashion Store",
  description:
    "Explore nossa coleção de camisetas cristãs. Encontre peças com estilo, qualidade e propósito.",
}

export default function ProductsPage() {
  return (
    <>
      <Header />
      <main className="min-h-dvh">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold lg:text-4xl">
              Nossos Produtos
            </h1>
            <p className="mt-2 text-muted-foreground">
              Camisetas cristãs com estilo, qualidade e propósito
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            }
          >
            <ProductsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
