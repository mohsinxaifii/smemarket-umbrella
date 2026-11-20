import type { Metadata } from "next";
import Browse from "@/components/market/Browse";

export const metadata: Metadata = {
  title: "Businesses for sale in the UAE",
  description: "Curated UAE businesses for sale, checked by SMEmarket before they go live. Filter by city, industry and price, and ask us about any of them.",
  alternates: { canonical: "/listings" },
};

export default function ListingsPage() {
  return <Browse />;
}
