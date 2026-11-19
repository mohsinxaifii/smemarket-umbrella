import type { Metadata } from "next";
import { Suspense } from "react";
import NdaForm from "@/components/market/NdaForm";

export const metadata: Metadata = { title: "Buyer NDA", robots: { index: false } };

export default function NdaPage() {
  return (
    <Suspense>
      <NdaForm />
    </Suspense>
  );
}
