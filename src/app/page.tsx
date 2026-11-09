import { DiwaliIntro } from "@/components/DiwaliIntro";
import { Approach } from "@/components/Approach";
import { ClientShowcase } from "@/components/ClientShowcase";
import { Manifesto } from "@/components/Manifesto";
import { Contact } from "@/components/Contact";
import { DesignStrip } from "@/components/DesignStrip";
import { Faq } from "@/components/Faq";
import { FloatingContact } from "@/components/FloatingContact";
import { Footer } from "@/components/Footer";
import { GrowthIntro } from "@/components/GrowthIntro";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { KeywordBand } from "@/components/KeywordBand";
import { Partner } from "@/components/Partner";
import { ServiceList } from "@/components/ServiceList";
import { SocialReels } from "@/components/SocialReels";
import { StartCta } from "@/components/StartCta";
import { StrategyPopup } from "@/components/StrategyPopup";

import { Testimonials } from "@/components/Testimonials";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <GrowthIntro />
        <KeywordBand />
        <ServiceList />
        <ClientShowcase />
        <DesignStrip />
        <Manifesto />
        <SocialReels />
        <Approach />
        <Testimonials />
        <StartCta />
        <Partner />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <FloatingContact />
      <DiwaliIntro />
      <StrategyPopup />
    </>
  );
}
