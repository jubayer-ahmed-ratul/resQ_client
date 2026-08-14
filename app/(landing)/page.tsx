import Hero from "@/components/sections/homepage/hero";
import ProblemSection from "@/components/sections/homepage/problem-section";
import Workflow from "@/components/sections/homepage/workflow";
import FeaturesSection from "@/components/sections/homepage/features-section";
import DecisionEngine from "@/components/sections/homepage/decision-engine";
import Reoptimization from "@/components/sections/homepage/reoptimization";
import Architecture from "@/components/sections/homepage/architecture";
import FinalCta from "@/components/sections/homepage/final-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <Workflow />
      <FeaturesSection />
      <DecisionEngine />
      <Reoptimization />
      <Architecture />
      <FinalCta />
    </>
  );
}
