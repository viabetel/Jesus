import { ProductCard } from "@/components/product-card"
import { products, type Product } from "@/lib/data/products"

type RelatedProductsProps = { currentProduct: Product }

export function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  const related = products
    .filter((p) => p.id !== currentProduct.id && p.category === currentProduct.category)
    .slice(0, 4)

  if (related.length === 0) return null

  return (
    <section className="mt-12 border-t pt-12 sm:mt-16 sm:pt-16">
      <h2 className="mb-6 font-serif text-xl font-bold sm:text-2xl">Produtos relacionados</h2>
      {/* Mobile: horizontal scroll | Tablet+: grid */}
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 lg:grid-cols-4">
        {related.map((product) => (
          <div key={product.id} className="w-[72vw] max-w-[280px] shrink-0 sm:w-auto sm:max-w-none">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
