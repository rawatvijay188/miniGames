// Generates all launcher icons + store assets from the SVG sources in assets/.
// Run with:  node scripts/generate-icons.mjs
//
// Outputs:
//   - android/app/src/main/res/mipmap-*/ic_launcher.png         (legacy square)
//   - android/app/src/main/res/mipmap-*/ic_launcher_round.png   (legacy round)
//   - android/app/src/main/res/mipmap-*/ic_launcher_foreground.png (adaptive)
//   - public/icon-512.png      (Play Store listing icon)
//   - public/icon-1024.png     (master / iOS later)
//   - public/feature-graphic.png (1024x500 Play Store feature graphic)

import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const A = (p) => resolve(root, p);

const fgSvg = readFileSync(A("assets/icon-foreground.svg"));
const bgSvg = readFileSync(A("assets/icon-background.svg"));
const featureSvg = readFileSync(A("assets/feature-graphic.svg"));

// Density buckets: [folder, legacy launcher px, adaptive foreground px]
const DENSITIES = [
  ["mdpi", 48, 108],
  ["hdpi", 72, 162],
  ["xhdpi", 96, 216],
  ["xxhdpi", 144, 324],
  ["xxxhdpi", 192, 432],
];

const render = (svg, size) =>
  sharp(svg, { density: 512 }).resize(size, size).png().toBuffer();

// Composite the foreground over the gradient background at a given size.
async function composed(size) {
  const [bg, fg] = await Promise.all([render(bgSvg, size), render(fgSvg, size)]);
  return sharp(bg).composite([{ input: fg }]).png().toBuffer();
}

// Circular mask so the "round" launcher icon is a true circle.
function circleMask(size) {
  const r = size / 2;
  const svg = `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`;
  return render(Buffer.from(svg), size);
}

async function roundIcon(size) {
  const [square, mask] = await Promise.all([composed(size), circleMask(size)]);
  return sharp(square)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function write(path, buf) {
  mkdirSync(dirname(A(path)), { recursive: true });
  const { writeFileSync } = await import("node:fs");
  writeFileSync(A(path), buf);
  console.log("  ✓", path);
}

async function main() {
  console.log("Generating Android launcher icons…");
  for (const [folder, legacyPx, fgPx] of DENSITIES) {
    const dir = `android/app/src/main/res/mipmap-${folder}`;
    await write(`${dir}/ic_launcher.png`, await composed(legacyPx));
    await write(`${dir}/ic_launcher_round.png`, await roundIcon(legacyPx));
    await write(`${dir}/ic_launcher_foreground.png`, await render(fgSvg, fgPx));
  }

  console.log("Generating store assets…");
  await write("public/icon-512.png", await composed(512));
  await write("public/icon-1024.png", await composed(1024));
  await write(
    "public/feature-graphic.png",
    await sharp(featureSvg, { density: 512 }).resize(1024, 500).png().toBuffer()
  );

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
