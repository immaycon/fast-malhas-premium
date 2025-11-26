import { Hero } from "@/components/Hero";
import { ProcessSection } from "@/components/ProcessSection";
import { ProductsSection } from "@/components/ProductsSection";
import { ContactSection } from "@/components/ContactSection";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <ProcessSection />
      <ProductsSection />
      <ContactSection />
    </main>
  );
};

export default Index;
