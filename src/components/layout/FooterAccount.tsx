"use client";
import { ArrowUpRight } from "lucide-react";
import { useMe } from "@/lib/api";
import { APP } from "@/lib/site";

/** The footer's main button: sign up when signed out, your account when signed in. */
export default function AccountCta() {
  const { user } = useMe();
  return (
    <a href={user ? APP.account : APP.signup} className="group flex h-14 items-center justify-center gap-2 rounded-[10px] bg-lime px-6 text-[16px] font-semibold text-ink transition hover:brightness-95">
      {user ? "Go to my account" : "Sign up free"} <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
    </a>
  );
}

/** Marketplace links, with account links that match whether you're signed in. */
export function MarketLinks() {
  const { user } = useMe();
  const links: [string, string][] = [
    [APP.listings, "Businesses for sale"],
    [APP.sell, "Sell your business"],
    ...(user
      ? ([
          [APP.account, "My account"],
          [APP.messages, "Messages"],
        ] as [string, string][])
      : ([
          [APP.signup, "Sign up"],
          [APP.login, "Log in"],
        ] as [string, string][])),
  ];
  return (
    <>
      {links.map(([h, l]) => (
        <li key={l}>
          <a href={h} className="text-[15px] text-paper/75 transition-colors hover:text-paper">
            {l}
          </a>
        </li>
      ))}
    </>
  );
}
