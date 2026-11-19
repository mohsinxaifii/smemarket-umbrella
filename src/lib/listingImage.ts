/**
 * A stock photo for a listing, until sellers can upload their own. Picked from what the business
 * is (title words first, then its industry), so a barbershop shows a barbershop and a tailor a tailor.
 */
const BY_WORD: [RegExp, string, string][] = [
  [/barber/i, "/images/barber-cut.jpg", "A barber at work"],
  [/tailor|alteration|sewing/i, "/images/tailoring-studio.jpg", "A tailoring studio with sewing machines"],
  [/caf[eé]|coffee/i, "/images/cafe-counter.jpg", "A café counter"],
  [/restaurant|kitchen|food court/i, "/images/restaurant-plate.jpg", "A restaurant dish being plated"],
  [/gym|fitness|studio/i, "/images/gym.jpg", "A modern fitness studio"],
  [/salon|spa|beauty/i, "/images/salon.jpg", "A hair salon"],
];
const BY_INDUSTRY: Record<string, [string, string]> = {
  "Food & beverage": ["/images/cafe-counter.jpg", "A café counter"],
  "Beauty & grooming": ["/images/salon.jpg", "A salon"],
  "Health & fitness": ["/images/gym.jpg", "A fitness studio"],
  Retail: ["/images/dubai-shop-owner.jpg", "A shop owner in Dubai"],
  Hospitality: ["/images/restaurant-plate.jpg", "A restaurant dish"],
};
const DEFAULT: [string, string] = ["/images/dubai-shop-owner.jpg", "A small business in Dubai"];

export function listingImage(l: { title: string; industry: string }): { src: string; alt: string } {
  for (const [re, src, alt] of BY_WORD) if (re.test(l.title)) return { src, alt };
  const [src, alt] = BY_INDUSTRY[l.industry] ?? DEFAULT;
  return { src, alt };
}
