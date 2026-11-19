import type { Metadata } from "next";
import { Suspense } from "react";
import ListingView from "@/components/market/ListingView";

export const metadata: Metadata = { title: "Business for sale", robots: { index: false } };

export default function ListingPage() {
  return (
    <Suspense>
      <ListingView />
    </Suspense>
  );
}
