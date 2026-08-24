// Renders public/og-image.png (1200x630) — the Open Graph / Twitter share card
// referenced from app/layout.tsx's metadata.
//
//   npm run build && node scripts/make-og-image.mjs
//
// The card is drawn in headless Chromium (already installed for Playwright) and
// screenshotted, so the real brand faces are used rather than whatever the host
// happens to have installed. next/font/google downloads Montserrat and Inter into
// .next/**/static/media at build time; this script finds the latin subset of each
// by parsing the @font-face blocks Next generated and inlines them as data URIs.
// That is why a build must have run first — there is no network fetch here.
//
// The output is committed, so this only needs re-running when the card design or
// the brand copy changes.

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "og-image.png");
const WIDTH = 1200;
const HEIGHT = 630;

const INK = "#010417";
const CYAN = "#00c4cc";
const CANVAS = "#ffffff";
const ASH = "#d9d9d9";

async function walk(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(full)));
    else found.push(full);
  }
  return found;
}

// Find the woff2 for a family's *latin* subset. Next emits one @font-face per
// (weight, unicode-range); the latin block is the one whose range starts at
// U+0000. Google ships both families as variable fonts here, so every weight of
// a family resolves to the same file and one face per family is enough.
async function findLatinFont(cssFiles, family) {
  const faceRe = /@font-face\s*\{([^}]*)\}/g;
  for (const file of cssFiles) {
    const css = await readFile(file, "utf8");
    for (const [, block] of css.matchAll(faceRe)) {
      if (!new RegExp(`font-family:\\s*${family}\\b`, "i").test(block)) continue;
      const range = block.match(/unicode-range:\s*([^;]+);/i)?.[1] ?? "";
      // Next writes the latin range's first entry as "U+??" (i.e. U+0000-00FF).
      if (!/^\s*U\+(\?\?|0-)/i.test(range)) continue;
      const url = block.match(/url\(["']?([^"')]+\.woff2)["']?\)/i)?.[1];
      if (!url) continue;
      const resolved = path.resolve(path.dirname(file), url);
      if (existsSync(resolved)) return resolved;
    }
  }
  throw new Error(
    `Could not find the latin ${family} woff2 under .next — run \`npm run build\` (or \`npm run dev\`) first.`,
  );
}

async function dataUri(file) {
  const buf = await readFile(file);
  return `data:font/woff2;base64,${buf.toString("base64")}`;
}

const nextDir = path.join(ROOT, ".next");
if (!existsSync(nextDir)) {
  throw new Error("No .next directory — run `npm run build` first.");
}
const cssFiles = (await walk(nextDir)).filter((f) => f.endsWith(".css"));
const montserrat = await dataUri(await findLatinFont(cssFiles, "Montserrat"));
const inter = await dataUri(await findLatinFont(cssFiles, "Inter"));

// Wordmark treatment mirrors the intro overlay (components/intro/IntroOverlay.tsx):
// cyan "Nexlivo" over white letterspaced "LABS" on the ink plate. Flat fills, no
// gradients or shadows, same as the rest of the site.
const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: Montserrat; src: url("${montserrat}") format("woff2");
               font-weight: 100 900; font-style: normal; }
  @font-face { font-family: Inter; src: url("${inter}") format("woff2");
               font-weight: 100 900; font-style: normal; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: ${WIDTH}px; height: ${HEIGHT}px; background: ${INK};
         font-family: Inter, sans-serif; -webkit-font-smoothing: antialiased; }
  .card { position: relative; width: 100%; height: 100%;
          display: flex; flex-direction: column; justify-content: center;
          padding: 0 96px; overflow: hidden; }
  /* Same decorative dot field the footer uses, kept faint. */
  .dots { position: absolute; inset: 0; opacity: 0.14;
          background-image: radial-gradient(${ASH} 1.5px, transparent 1.5px);
          background-size: 28px 28px; }
  .rule { position: absolute; left: 0; top: 0; width: 100%; height: 10px; background: ${CYAN}; }
  .inner { position: relative; }
  .mark { display: block; width: 72px; height: 72px; margin-bottom: 44px; }
  .word { font-family: Montserrat, sans-serif; font-weight: 500; font-size: 118px;
          line-height: 1; letter-spacing: -3.54px; color: ${CYAN}; }
  .labs { font-family: Montserrat, sans-serif; font-weight: 700; font-size: 30px;
          line-height: 1; letter-spacing: 12px; color: ${CANVAS}; margin-top: 14px; }
  .tagline { margin-top: 44px; max-width: 34ch; font-size: 34px; line-height: 1.35;
             letter-spacing: -0.68px; color: ${ASH}; }
</style></head>
<body><div class="card">
  <div class="dots"></div><div class="rule"></div>
  <div class="inner">
    <svg class="mark" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="${CYAN}"/>
      <path d="M18 18 H26 L38 38 V18 H46 V46 H38 L26 26 V46 H18 Z" fill="${INK}"/>
    </svg>
    <div class="word">Nexlivo</div>
    <div class="labs">LABS</div>
    <div class="tagline">We design and build software that businesses run on.</div>
  </div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: OUT, type: "png" });
await browser.close();

const written = await readFile(OUT);
console.log(`wrote public/og-image.png (${WIDTH}x${HEIGHT}, ${written.length} bytes)`);
