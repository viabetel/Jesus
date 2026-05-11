import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductsContent } from "@/components/products/products-content"
import { getPublicProducts } from "@/lib/services/public-catalog"

export const dynamic = "force-dynamic"
export const revalidate = 60

export const metadata = {
  title: "Produtos | Fashion Store",
  description: "Explore nossa coleção de camisetas cristãs. Encontre peças com estilo, qualidade e propósito.",
}

export default async function ProductsPage() {
  const products = await getPublicProducts()

  return (
    <>
      <Header />
      <main className="min-h-dvh">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:py-10">
          <div className="mb-6">
            <h1 className="font-serif text-2xl font-bold sm:text-3xl lg:text-4xl">Nossos Produtos</h1>
            <p className="mt-1 text-sm text-muted-foreground">Camisetas cristãs com estilo, qualidade e propósito</p>
          </div>
          <Suspense fallback={<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
            <ProductsContent products={products} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
