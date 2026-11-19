import type { Metadata } from "next";
import Sell from "@/components/market/Sell";

export const metadata: Metadata = {
  title: "Sell your business",
  description: "List your UAE business for free in about three minutes. Anonymous until you approve a buyer. 5% success fee only when it sells.",
  alternates: { canonical: "/sell" },
};

export default function SellPage() {
  return <Sell />;
}
