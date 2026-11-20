import Image from "next/image";

const ITEMS: [string, string][] = [
  ["cafe-owners", "Cafés"],
  ["barber-cut", "Barbershops"],
  ["shop-counter", "Shops"],
  ["salon", "Salons"],
  ["gym", "Gyms"],
  ["restaurant-plate", "Restaurants"],
  ["tailoring-studio", "Studios"],
  ["warehouse", "Trading & logistics"],
];

/** A slow, endless row of the kinds of businesses that change hands here. Pauses under the pointer. */
export default function PhotoBand({ title, tone = "bg-paper" }: { title?: string; tone?: string }) {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section className={`overflow-hidden py-12 md:py-16 ${tone}`} aria-label={title ?? "Kinds of businesses"}>
      {title && <p className="container-x label mb-5 md:mb-7">{title}</p>}
      <div className="group flex w-max animate-[marquee_48s_linear_infinite] gap-3 hover:[animation-play-state:paused] motion-reduce:animate-none md:gap-4">
        {row.map(([img, label], i) => (
          <figure key={i} aria-hidden={i >= ITEMS.length} className="relative h-[150px] w-[210px] shrink-0 overflow-hidden rounded-[20px] md:h-[220px] md:w-[300px] md:rounded-[24px]">
            <Image src={`/images/${img}.jpg`} alt={i < ITEMS.length ? label : ""} fill sizes="(min-width:768px) 300px, 210px" className="object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <figcaption className="absolute bottom-3 left-3 rounded-full bg-paper/95 px-3 py-1 text-[13px] font-semibold text-ink md:bottom-4 md:left-4 md:text-[14px]">{label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
