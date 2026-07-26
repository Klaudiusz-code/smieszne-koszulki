import HeroSection from "@/components/Hero";
import CategoryCards from "@/components/CategoryCards";
import ProcessSection from "@/components/ProcessSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import WhyUsSection from "@/components/WhyUsSection";
import MaterialsSection from "@/components/MaterialsSection";
import ContactSection from "@/components/ContactSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoryCards />
      <ProcessSection />
      <FeaturedProducts />
      <WhyUsSection />
      <MaterialsSection />
      <ContactSection />
    </>
  );
}
