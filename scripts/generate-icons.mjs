// Generates the PNG icons required for installing the PWA (iOS does not accept SVG).
// Run with: npm run icons
import sharp from "sharp";

const EMERALD = "#059669";
// Basket glyph from app/icon.svg, drawn on a 64×64 grid.
const glyph = `
  <path d="M20 26h24l-3 18a4 4 0 0 1-4 3H27a4 4 0 0 1-4-3z" fill="#fff"/>
  <path d="M26 26l6-9 6 9" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="32" cy="36" r="3.5" fill="${EMERALD}"/>`;

/** Rounded tile: for browsers that show the icon as-is. */
const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${EMERALD}"/>${glyph}</svg>`;

/** Full-bleed square with the glyph inside the maskable safe zone (Android adaptive icons, iOS rounds it itself). */
const fullBleed = (scale) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${EMERALD}"/><g transform="translate(32 34) scale(${scale}) translate(-32 -32)">${glyph}</g></svg>`;

const jobs = [
  ["public/icons/icon-192.png", rounded, 192],
  ["public/icons/icon-512.png", rounded, 512],
  ["public/icons/maskable-512.png", fullBleed(1.05), 512],
  ["public/icons/apple-touch-icon.png", fullBleed(1.25), 180],
];

for (const [file, svg, size] of jobs) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(file);
  console.log("✓", file);
}
