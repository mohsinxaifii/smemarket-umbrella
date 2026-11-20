import type { Metadata } from "next";
import Sell from "@/components/market/Sell";

export const metadata: Metadata = {
  title: "Sell your business",
  description: "List your UAE business for free in about two minutes, no account needed. We handle every enquiry. 5% success fee only when it sells.",
  alternates: { canonical: "/sell" },
};

export default function SellPage() {
  return <Sell />;
}
