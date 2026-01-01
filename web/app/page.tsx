"use client";

import NewHeader from "@/components/landing/NewHeader";
import NewHero from "@/components/landing/NewHero";
import BentoGrid1 from "@/components/landing/BentoGrid1";
import BentoGrid2 from "@/components/landing/BentoGrid2";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <NewHeader />
      <NewHero />
      <BentoGrid2 />
      <BentoGrid1 />
      <Footer />
    </main>
  );
}
