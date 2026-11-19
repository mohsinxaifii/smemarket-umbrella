import type { Metadata } from "next";
import Account from "@/components/market/Account";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default function AccountPage() {
  return <Account />;
}
