import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductDetails } from "@/components/products/product-details"
import { RelatedProducts } from "@/components/products/related-products"
import { getPublicProductBySlug, getPublicProducts } from "@/lib/services/public-catalog"
import { getProductMedia } from "@/lib/services/media-repo"
import { getTotalStock } from "@/lib/data/products"

type Props = { params: Promise<{ slug: string }> }

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getPublicProductBySlug(slug)
  if (!product) return { title: "Produto não encontrado" }
  const price = product.price.toFixed(2).replace(".", ",")
  return {
    title: `${product.name} — R$ ${price}`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Fashion Store`,
      description: product.description,
      type: "website",
      images: product.coverImage ? [{ url: product.coverImage, width: 800, height: 1000, alt: product.name }] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getPublicProductBySlug(slug)
  if (!product) notFound()

  const allProducts = await getPublicProducts()

  // Carregar toda a mídia estruturada (todas as cores + geral)
  // Serializar pra passar ao client component
  let mediaData: Array<{
    id: number; url: string; kind: string; role: string; sortOrder: number
    colorKey: string | null; colorName: string | null; colorHex: string | null
  }> = []
  try {
    const allMedia = await getProductMedia(product.id)
    mediaData = allMedia.map(m => ({
      id: m.id, url: m.url, kind: m.kind, role: m.role, sortOrder: m.sortOrder,
      colorKey: m.colorKey, colorName: m.colorName, colorHex: m.colorHex,
    }))
  } catch { /* fallback pra images[] no ProductDetails */ }

  return (
    <>
      <Header />
      <main className="min-h-dvh py-4 pb-20 sm:pb-6 lg:py-10">
        <div className="mx-auto max-w-6xl px-4">
          <ProductDetails product={product} structuredMedia={mediaData} />
          <RelatedProducts currentProduct={product} allProducts={allProducts} />

          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org", "@type": "Product",
            name: product.name, description: product.description,
            image: product.coverImage || undefined,
            brand: { "@type": "Brand", name: "Fashion Store" },
            offers: { "@type": "Offer", price: product.price, priceCurrency: "BRL",
              availability: getTotalStock(product) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
            category: product.category,
          }) }} />
        </div>
      </main>
      <Footer />
    </>
  )
}
