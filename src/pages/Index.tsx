import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CompanySection } from "@/components/CompanySection";
import { ProductShowcase } from "@/components/ProductShowcase";
import { LocationContact } from "@/components/LocationContact";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Hero />
        <CompanySection />
        <ProductShowcase />
        <LocationContact />
      </main>
      <Footer />
    </>
  );
};

export default Index;
