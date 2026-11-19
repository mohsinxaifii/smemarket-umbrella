import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import DealFlow from "@/components/home/DealFlow";
import FeeCalc from "@/components/home/FeeCalc";
import Services from "@/components/home/Services";
import Faq from "@/components/home/Faq";
import { FAQ } from "@/lib/site";

/**
 * Written for someone landing from an ad. In order:
 * what this is and the three choices → how buying/selling works → why it's safe → what selling costs →
 * the other services → questions.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <DealFlow />
      <FeeCalc />
      <Services />
      <Faq items={FAQ} tone="bg-paper-2" />
    </>
  );
}
