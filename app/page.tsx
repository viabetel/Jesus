import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { CategoriesSection } from "@/components/home/categories-section"
import { FeaturedSection } from "@/components/home/featured-section"
import { NewArrivalsSection } from "@/components/home/new-arrivals-section"
import { PromotionsSection } from "@/components/home/promotions-section"
import { LowStockSection } from "@/components/home/low-stock-section"
import { BenefitsSection } from "@/components/home/benefits-section"
import { HowToBuySection } from "@/components/home/how-to-buy-section"
import { AboutSection } from "@/components/home/about-section"
import { InstagramSection } from "@/components/home/instagram-section"
import { CtaSection } from "@/components/home/cta-section"
import { getPublicProducts, filterFeatured, filterNew, filterPromo, filterLowStock } from "@/lib/services/public-catalog"

export const dynamic = "force-dynamic"
export const revalidate = 60

export default async function Home() {
  const allProducts = await getPublicProducts()

  const featured = filterFeatured(allProducts)
  const newArrivals = filterNew(allProducts)
  const promotions = filterPromo(allProducts)
  const lowStock = filterLowStock(allProducts)
  const feedImages = allProducts.slice(0, 6).map(p => p.coverImage).filter(Boolean) as string[]

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <CategoriesSection />
        {featured.length > 0 && <FeaturedSection products={featured} />}
        {promotions.length > 0 && <PromotionsSection products={promotions} />}
        {newArrivals.length > 0 && <NewArrivalsSection products={newArrivals} />}
        {lowStock.length > 0 && <LowStockSection products={lowStock} />}
        <HowToBuySection />
        <BenefitsSection />
        <AboutSection />
        {feedImages.length > 0 && <InstagramSection feedImages={feedImages} />}
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
