import { Handshake, Compass, Search, TrendingUp, GraduationCap, type LucideProps } from "lucide-react";
import type { PillarIcon } from "@/lib/site";

const MAP = {
  handshake: Handshake,
  compass: Compass,
  search: Search,
  trending: TrendingUp,
  graduation: GraduationCap,
};

export default function Icon({ name, ...props }: { name: PillarIcon } & LucideProps) {
  const C = MAP[name];
  return <C strokeWidth={1.75} {...props} />;
}
