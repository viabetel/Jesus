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
import { getAllProducts } from "@/lib/services/products-repo"
import { getTotalStock } from "@/lib/data/products"

export const dynamic = "force-dynamic"
export const revalidate = 60

export default async function Home() {
  const allProducts = await getAllProducts()

  const featured = allProducts.filter(p => p.isBestseller || p.isNew).slice(0, 4)
  const newArrivals = allProducts.filter(p => p.isNew).slice(0, 4)
  const promotions = allProducts.filter(p => p.isPromotion)
  const lowStock = allProducts.filter(p => { const s = getTotalStock(p); return s > 0 && s <= 10 }).slice(0, 3)
  const feedImages = allProducts.slice(0, 6).map(p => p.images[0]).filter(Boolean)

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <CategoriesSection />
        <FeaturedSection products={featured} />
        <PromotionsSection products={promotions} />
        <NewArrivalsSection products={newArrivals} />
        <LowStockSection products={lowStock} />
        <HowToBuySection />
        <BenefitsSection />
        <AboutSection />
        <InstagramSection feedImages={feedImages} />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
