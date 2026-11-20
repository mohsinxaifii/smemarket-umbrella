// One-off: draws the same eight people in several avatar styles so the team can pick one.
// Output: public/avatar-options/<style>/<n>.svg, shown on /avatars (internal, not linked or indexed).
//   node scripts/build-avatar-options.mjs
import { createAvatar } from "@dicebear/core";
import * as styles from "@dicebear/collection";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

// fixed seeds, so the same eight faces come out every time
const SEEDS = ["Lina", "Rashid", "Zara", "Priya", "James", "Omar", "Aisha", "Karim"];
// friendly, business-like expressions only (the styles' random picks include crying, angry and sleepy faces)
const OPTIONS = {
  notionists: { gestureProbability: 0 },
  lorelei: { mouth: ["happy01", "happy02", "happy03", "happy05", "happy06", "happy09"], glassesProbability: 15 },
  avataaars: {
    mouth: ["smile", "default", "twinkle"],
    eyes: ["default", "happy", "squint"],
    eyebrows: ["defaultNatural", "default", "raisedExcitedNatural"],
    accessoriesProbability: 15,
    facialHairProbability: 25,
    skinColor: ["614335", "d08b5b", "ae5d29", "edb98a", "ffdbb4"],
    hairColor: ["a55728", "2c1b18", "b58143", "724133", "4a312c"],
    backgroundColor: ["transparent"],
  },
  micah: { mouth: ["smile", "laughing", "smirk"], eyes: ["eyes", "round", "smiling"], glassesProbability: 20 },
  personas: { mouth: ["smile", "bigSmile", "smirk"], eyes: ["open", "happy"], hairColor: ["362c47", "6c4545"] },
  toonHead: { mouth: ["smile", "laugh"], eyes: ["happy", "humble"], eyebrows: ["happy", "neutral", "raised"] },
  dylan: { mood: ["happy", "superHappy", "hopeful"], backgroundColor: ["transparent"] },
};
const PICK = Object.keys(OPTIONS);

for (const name of PICK) {
  const dir = path.join(process.cwd(), "public/avatar-options", name);
  mkdirSync(dir, { recursive: true });
  SEEDS.forEach((seed, i) => {
    const svg = createAvatar(styles[name], { seed: `smem-${seed}`, size: 256, ...OPTIONS[name] }).toString();
    writeFileSync(path.join(dir, `${i}.svg`), svg);
  });
}
console.log(`avatar options: ${PICK.length} styles × ${SEEDS.length} people → public/avatar-options/`);
