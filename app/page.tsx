import { FashionHeader } from "@/components/fashion/Header"
import { FashionFooter } from "@/components/fashion/Footer"
import { HeroSection } from "@/components/home/hero-section"
import { ServiceRow } from "@/components/home/service-row"
import { CategoryStrip } from "@/components/home/categories-section"
import { NewArrivalsSection } from "@/components/home/new-arrivals-section"
import { FeaturedSection } from "@/components/home/featured-section"
import { ProntaEntregaBand } from "@/components/home/pronta-entrega-band"
import { PromotionsSection } from "@/components/home/promotions-section"
import { CollectionsSection } from "@/components/home/collections-section"
import { LookbookSection } from "@/components/home/lookbook-section"
import { ComoComprarSection } from "@/components/home/como-comprar-section"
import { GuiaMedidasSection } from "@/components/home/guia-medidas-section"
import { DepoimentosSection } from "@/components/home/depoimentos-section"
import { FinalCTASection } from "@/components/home/final-cta-section"
import {
  getPublicProducts,
  filterNew,
  filterPromo,
  filterBestsellers,
} from "@/lib/services/public-catalog"

export const dynamic = "force-dynamic"
export const revalidate = 60

export default async function Home() {
  const allProducts = await getPublicProducts()

  const newArrivals = filterNew(allProducts)
  const bestsellers = filterBestsellers(allProducts)
  const promotions = filterPromo(allProducts)

  // Fallback: if no bestsellers flagged, use first 4 products
  const featured = bestsellers.length > 0 ? bestsellers : allProducts.slice(0, 4)

  return (
    <>
      {/* Header transparent overlaying hero — FASHION original behavior */}
      <div className="relative">
        <FashionHeader transparent />
        <HeroSection />
      </div>

      <main>
        {/* 2. Service row — trust/benefits */}
        <ServiceRow />

        {/* 3. Category departments */}
        <CategoryStrip />

        {/* 4. Lançamentos */}
        {newArrivals.length > 0 && <NewArrivalsSection products={newArrivals} />}

        {/* 5. Mais vendidos */}
        {featured.length > 0 && <FeaturedSection products={featured} />}

        {/* 6. Pronta entrega editorial band */}
        <ProntaEntregaBand />

        {/* 7. Promoções */}
        {promotions.length > 0 && <PromotionsSection products={promotions} />}

        {/* 8. Coleções / Estilo */}
        <CollectionsSection />

        {/* 9. Lookbook */}
        <LookbookSection />

        {/* 10. Como comprar */}
        <ComoComprarSection />

        {/* 11. Guia de medidas */}
        <GuiaMedidasSection />

        {/* 12. Depoimentos */}
        <DepoimentosSection />

        {/* 13. CTA final */}
        <FinalCTASection />
      </main>
      <FashionFooter />
    </>
  )
}
