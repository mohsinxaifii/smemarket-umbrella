import type { Metadata } from "next";
import { Suspense } from "react";
import Login from "@/components/market/Login";

export const metadata: Metadata = { title: "Sign up or log in", description: "One SMEmarket account for buying, selling and growing your business.", alternates: { canonical: "/login" } };

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
