import Hero from "@/components/home/Hero";
import Featured from "@/components/home/Featured";
import Numbers from "@/components/home/Numbers";
import HowItWorks from "@/components/home/HowItWorks";
import Compare from "@/components/home/Compare";
import DealFlow from "@/components/home/DealFlow";
import FeeCalc from "@/components/home/FeeCalc";
import ForWho from "@/components/home/ForWho";
import Services from "@/components/home/Services";
import Faq from "@/components/home/Faq";
import { FAQ } from "@/lib/site";

/**
 * Written for someone landing from an ad. In order:
 * what this is → what's for sale today → why it matters → how it works → how it's different →
 * why it's safe → what selling costs → who it's for → the other services → questions.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Featured />
      <Numbers />
      <HowItWorks />
      <Compare />
      <DealFlow />
      <FeeCalc />
      <ForWho />
      <Services />
      <Faq items={FAQ} tone="bg-paper-2" />
    </>
  );
}
