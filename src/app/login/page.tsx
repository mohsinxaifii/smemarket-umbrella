import type { Metadata } from "next";
import { Suspense } from "react";
import Login from "@/components/market/Login";

export const metadata: Metadata = { title: "Team log in", description: "For the SMEmarket team.", alternates: { canonical: "/login" } };

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
