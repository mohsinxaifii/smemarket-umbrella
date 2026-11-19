import type { Metadata } from "next";
import Admin from "@/components/market/Admin";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminPage() {
  return <Admin />;
}
