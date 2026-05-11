import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { CategoriesSection } from "@/components/home/categories-section"
import { CommercialBannersSection } from "@/components/home/commercial-banners-section"
import { FeaturedSection } from "@/components/home/featured-section"
import { NewArrivalsSection } from "@/components/home/new-arrivals-section"
import { PromotionsSection } from "@/components/home/promotions-section"
import { HowToBuySection } from "@/components/home/how-to-buy-section"
import { BenefitsSection } from "@/components/home/benefits-section"
import { AboutSection } from "@/components/home/about-section"
import { CtaSection } from "@/components/home/cta-section"
import { getPublicProducts, filterFeatured, filterNew, filterPromo } from "@/lib/services/public-catalog"

export const dynamic = "force-dynamic"
export const revalidate = 60

export default async function Home() {
  const allProducts = await getPublicProducts()

  const featured = filterFeatured(allProducts)
  const newArrivals = filterNew(allProducts)
  const promotions = filterPromo(allProducts)

  return (
    <>
      <Header />
      <main>
        {/* 1. Hero — vende produto */}
        <HeroSection />

        {/* 2. Departamentos visuais */}
        <CategoriesSection />

        {/* 3. Campanha — ritmo de loja */}
        <CommercialBannersSection />

        {/* 4. Mais vendidos — primeira vitrine */}
        {featured.length > 0 && <FeaturedSection products={featured} />}

        {/* 5. Lançamentos */}
        {newArrivals.length > 0 && <NewArrivalsSection products={newArrivals} />}

        {/* 6. Promoções */}
        {promotions.length > 0 && <PromotionsSection products={promotions} />}

        {/* 7. Como comprar */}
        <HowToBuySection />

        {/* 8. Benefícios */}
        <BenefitsSection />

        {/* 9. Institucional — peso reduzido */}
        <AboutSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
