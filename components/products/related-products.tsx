import { ProductCard } from "@/components/product-card"
import { products, type Product } from "@/lib/data/products"

export function RelatedProducts({ currentProduct }: { currentProduct: Product }) {
  const related = products.filter((p) => p.id !== currentProduct.id && p.category === currentProduct.category).slice(0, 4)
  if (related.length === 0) return null

  return (
    <section className="mt-10 border-t pt-10 sm:mt-14 sm:pt-14">
      <h2 className="mb-4 font-serif text-lg font-bold sm:mb-6 sm:text-xl">Produtos relacionados</h2>
      <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-3 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 lg:grid-cols-4">
        {related.map((p) => (
          <div key={p.id} className="w-[66vw] max-w-[260px] shrink-0 sm:w-auto sm:max-w-none"><ProductCard product={p} /></div>
        ))}
      </div>
    </section>
  )
}
