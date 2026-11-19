"use client";
import SmartLink from "./SmartLink";
import { useTilt, GLOW } from "@/lib/useTilt";

/** A card-sized link that tilts towards the cursor, with a soft light under it. */
export default function TiltLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  const tilt = useTilt(5);
  return (
    <SmartLink href={href} className={className} {...tilt}>
      <span aria-hidden className={GLOW} />
      {children}
    </SmartLink>
  );
}
