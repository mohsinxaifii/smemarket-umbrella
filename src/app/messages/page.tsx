import type { Metadata } from "next";
import { Suspense } from "react";
import Messages from "@/components/market/Messages";

export const metadata: Metadata = { title: "Messages", robots: { index: false } };

export default function MessagesPage() {
  return (
    <Suspense>
      <Messages />
    </Suspense>
  );
}
