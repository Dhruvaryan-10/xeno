// Generates the PWA / home-screen icons in public/icons. Run: node scripts/make-icons.mjs
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const rings = [
  { r: 0.3, color: "#FF6B5E", sweep: 0.82 },
  { r: 0.21, color: "#E0457B", sweep: 0.64 },
  { r: 0.12, color: "#FDA1A2", sweep: 0.4 }
];

function svg(size, { scale = 1, radius = 0.225 } = {}) {
  const c = size / 2;
  const stroke = size * 0.065 * scale;
  const arcs = rings
    .map(({ r, color, sweep }) => {
      const radiusPx = r * size * scale;
      const circumference = 2 * Math.PI * radiusPx;
      return `<circle cx="${c}" cy="${c}" r="${radiusPx}" fill="none" stroke="${color}" stroke-opacity="0.18" stroke-width="${stroke}"/>
<circle cx="${c}" cy="${c}" r="${radiusPx}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"
  stroke-dasharray="${circumference * sweep} ${circumference}" transform="rotate(-90 ${c} ${c})"/>`;
    })
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<rect width="${size}" height="${size}" rx="${size * radius}" fill="#1D1842"/>
${arcs}
</svg>`;
}

const out = new URL("../public/icons/", import.meta.url);
mkdirSync(out, { recursive: true });

const jobs = [
  ["icon-192.png", 192, {}],
  ["icon-512.png", 512, {}],
  // Maskable icons are cropped by the OS: full-bleed background, art inside the 80% safe zone.
  ["icon-maskable-512.png", 512, { scale: 0.78, radius: 0 }],
  // iOS applies its own rounded mask.
  ["apple-touch-icon.png", 180, { radius: 0 }]
];

for (const [name, size, options] of jobs) {
  await sharp(Buffer.from(svg(size, options))).png().toFile(new URL(name, out).pathname.replace(/^\/([A-Z]:)/, "$1"));
  console.log("wrote", name);
}
