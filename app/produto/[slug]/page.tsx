import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductDetails } from "@/components/products/product-details"
import { RelatedProducts } from "@/components/products/related-products"
import { getProductBySlug, getAllProducts } from "@/lib/services/products-repo"
import { getProductMedia } from "@/lib/services/media-repo"
import { getTotalStock } from "@/lib/data/products"

type Props = { params: Promise<{ slug: string }> }

export const dynamic = "force-dynamic"
export const revalidate = 60

export async function generateStaticParams() {
  const products = await getAllProducts({ includeAll: true })
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Produto não encontrado" }

  const price = product.price.toFixed(2).replace(".", ",")
  return {
    title: `${product.name} — R$ ${price}`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Fashion Store`,
      description: product.description,
      type: "website",
      images: product.images[0]
        ? [{ url: product.images[0], width: 800, height: 1000, alt: product.name }]
        : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  // Block non-active products from public access
  if (product.status !== "ativo") notFound()

  const allProducts = await getAllProducts()

  // Carrega mídia estruturada da tabela (rodada 3) — se existir, sobrescreve images/video
  const dbMedia = await getProductMedia(product.id).catch(() => [])

  let displayProduct = product
  if (dbMedia.length > 0) {
    // Ordem: cover primeiro, depois hover, depois resto pela sortOrder
    const cover = dbMedia.find(m => m.role === "cover" && m.kind === "image")
    const hover = dbMedia.find(m => m.role === "hover" && m.kind === "image")
    const others = dbMedia
      .filter(m => m.kind === "image" && m.role !== "cover" && m.role !== "hover")
      .sort((a, b) => a.sortOrder - b.sortOrder)

    const orderedImages: string[] = []
    if (cover) orderedImages.push(cover.url)
    if (hover) orderedImages.push(hover.url)
    orderedImages.push(...others.map(m => m.url))

    const videoRow = dbMedia.find(m => m.kind === "video")

    displayProduct = {
      ...product,
      images: orderedImages.length > 0 ? orderedImages : product.images,
      video: videoRow?.url ?? product.video,
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-dvh py-4 pb-20 sm:pb-6 lg:py-10">
        <div className="mx-auto max-w-6xl px-4">
          <ProductDetails product={displayProduct} />
          <RelatedProducts currentProduct={displayProduct} allProducts={allProducts} />

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: displayProduct.name,
                description: displayProduct.description,
                image: displayProduct.images[0] || undefined,
                brand: { "@type": "Brand", name: "Fashion Store" },
                offers: {
                  "@type": "Offer",
                  price: displayProduct.price,
                  priceCurrency: "BRL",
                  availability:
                    getTotalStock(displayProduct) > 0
                      ? "https://schema.org/InStock"
                      : "https://schema.org/OutOfStock",
                },
                category: displayProduct.category,
              }),
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
