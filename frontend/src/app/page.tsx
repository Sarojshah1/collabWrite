import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Hero from "@/components/landing/Hero";
import KeyBenefits from "@/components/landing/KeyBenefits";
import HowItWorks from "@/components/landing/HowItWorks";
import DemoConflictPanel from "@/components/landing/DemoConflictPanel";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import TrustSection from "@/components/landing/TrustSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto  px-0 sm:px-0">
        <Hero />
        <KeyBenefits />
        <HowItWorks />
        <DemoConflictPanel />
        <FeaturesGrid />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
