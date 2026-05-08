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

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <CategoriesSection />
        <FeaturedSection />
        <PromotionsSection />
        <NewArrivalsSection />
        <LowStockSection />
        <HowToBuySection />
        <BenefitsSection />
        <AboutSection />
        <InstagramSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
