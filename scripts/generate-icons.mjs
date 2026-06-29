// Generates all launcher icons, splash screens, and store assets from the SVG
// sources in assets/.  Run with:  node scripts/generate-icons.mjs
//
// Outputs:
//   - android/app/src/main/res/mipmap-*/ic_launcher.png         (legacy square)
//   - android/app/src/main/res/mipmap-*/ic_launcher_round.png   (legacy round)
//   - android/app/src/main/res/mipmap-*/ic_launcher_foreground.png (adaptive)
//   - android/app/src/main/res/drawable*/splash.png             (launch splash)
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

// Dark arcade gradient background sized to an arbitrary (non-square) canvas.
function splashBg(w, h) {
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1c1147"/>
        <stop offset="1" stop-color="#0b0d1a"/>
      </linearGradient>
      <radialGradient id="r" cx="0.5" cy="0.5" r="0.6">
        <stop offset="0" stop-color="#3a2480" stop-opacity="0.5"/>
        <stop offset="1" stop-color="#3a2480" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <rect width="${w}" height="${h}" fill="url(#r)"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// Splash = gradient background with the logo mark centered, sized relative to
// the shorter edge so it reads well in both portrait and landscape.
async function splash(w, h) {
  const logoPx = Math.round(Math.min(w, h) * 0.6);
  const [bg, logo] = await Promise.all([splashBg(w, h), render(fgSvg, logoPx)]);
  return sharp(bg)
    .composite([{ input: logo, gravity: "center" }])
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

  console.log("Generating splash screens…");
  // [folder, width, height] — Capacitor's portrait/landscape density buckets.
  const SPLASH = [
    ["drawable", 480, 320],
    ["drawable-v24", 480, 320],
    ["drawable-port-mdpi", 320, 480],
    ["drawable-port-hdpi", 480, 800],
    ["drawable-port-xhdpi", 720, 1280],
    ["drawable-port-xxhdpi", 960, 1600],
    ["drawable-port-xxxhdpi", 1280, 1920],
    ["drawable-land-mdpi", 480, 320],
    ["drawable-land-hdpi", 800, 480],
    ["drawable-land-xhdpi", 1280, 720],
    ["drawable-land-xxhdpi", 1600, 960],
    ["drawable-land-xxxhdpi", 1920, 1280],
  ];
  for (const [folder, w, h] of SPLASH) {
    await write(`android/app/src/main/res/${folder}/splash.png`, await splash(w, h));
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
