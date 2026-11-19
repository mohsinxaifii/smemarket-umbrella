"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Character from "@/components/ui/Character";
import { APP } from "@/lib/site";

/** Shown in place of a page that needs an account. */
export default function SignInGate({ title = "Log in to continue", children }: { title?: string; children?: React.ReactNode }) {
  const path = usePathname();
  const [next, setNext] = useState(path);
  useEffect(() => setNext(path + window.location.search), [path]);
  return (
    <div className="mx-auto grid max-w-3xl items-center gap-8 overflow-hidden rounded-[28px] bg-[#f6e3b5] p-7 md:grid-cols-[1fr_200px] md:p-10">
      <div>
        <h2 className="display text-[clamp(1.8rem,3vw,2.4rem)]">{title}</h2>
        <div className="mt-3 text-[17px] text-ink-2">{children ?? "One free account works for buying, selling and growing."}</div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`${APP.signup}&next=${encodeURIComponent(next)}`} className="flex h-12 items-center rounded-[10px] bg-ink px-5 text-[15px] font-semibold text-paper">
            Create a free account
          </Link>
          <Link href={`${APP.login}?next=${encodeURIComponent(next)}`} className="flex h-12 items-center rounded-[10px] border border-ink/40 px-5 text-[15px] font-semibold">
            Log in
          </Link>
        </div>
      </div>
      <Character who="rashid" mood="calm" body="Device" size={200} className="-mb-12 hidden md:block" />
    </div>
  );
}
