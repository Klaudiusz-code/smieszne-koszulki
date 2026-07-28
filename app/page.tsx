import HeroSection from "@/components/Hero";
import CategoryCards from "@/components/CategoryCards";
import FeaturedProducts from "@/components/FeaturedProducts";
import ProcessSection from "@/components/ProcessSection";
import WhyUsSection from "@/components/WhyUsSection";
import MaterialsSection from "@/components/MaterialsSection";
import FaqSection from "@/components/Faq"; // NOWOŚĆ
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer"; // NOWOŚĆ

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoryCards />
      <FeaturedProducts />
      <ProcessSection />
      <WhyUsSection />
      <MaterialsSection />
      <FaqSection /> <ContactSection />
    </>
  );
}
