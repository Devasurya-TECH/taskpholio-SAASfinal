import Navigation from "@/components/landing/Navigation";
import Hero from "@/components/landing/Hero";
import FeatureBento from "@/components/landing/FeatureBento";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] selection:bg-primary/30 selection:text-primary">
      <Navigation />
      
      <div className="relative pt-16">
        <Hero />
        <FeatureBento />
      </div>

      <Footer />
    </main>
  );
}