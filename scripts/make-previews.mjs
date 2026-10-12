// Generates the small preview images used by the site, from the real template cards:
//   public/thumbs/<id>.webp   gallery thumbnails (360x640)
//   public/og/<id>.jpg        1200x630 social preview per template (public/og/default.jpg is composed separately)
// Needs a running copy of the built site and a local Chrome:
//   npm run build && npx serve out -l 3111      (in one terminal)
//   npm run previews                            (in another)
// Re-run whenever a template design or its sample text changes.
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3111";
const CHROME =
  process.env.CHROME_PATH ??
  ["C:/Program Files/Google/Chrome/Application/chrome.exe", "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find(existsSync);
if (!CHROME) throw new Error("Chrome not found. Set CHROME_PATH.");

mkdirSync("public/thumbs", { recursive: true });
mkdirSync("public/og", { recursive: true });

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const ids = [...sitemap.matchAll(/\/templates\/([a-z0-9-]+)<\/loc>/g)].map((m) => m[1]);
console.log(`found ${ids.length} templates`);

const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1.5 });
const page = await ctx.newPage();
const CARD = '[data-preview-card] [style*="container-type"]';

/** Re-encode a PNG buffer as WebP inside the page (Chrome's encoder), returns a Buffer. */
async function toWebp(png, quality = 0.8) {
  const b64 = await page.evaluate(async ([data, q]) => {
    const blob = await (await fetch(`data:image/png;base64,${data}`)).blob();
    const bmp = await createImageBitmap(blob);
    const c = Object.assign(document.createElement("canvas"), { width: bmp.width, height: bmp.height });
    c.getContext("2d").drawImage(bmp, 0, 0);
    return c.toDataURL("image/webp", q).split(",")[1];
  }, [png.toString("base64"), quality]);
  return Buffer.from(b64, "base64");
}

/** Place a clone of the card (and optional text) in a fixed box, screenshot it, remove it. */
async function shoot({ width, height, css, html, cardWidth, cardStyle, type }) {
  await page.evaluate(([o, sel]) => {
    const card = document.querySelector(sel).cloneNode(true);
    const root = document.createElement("div");
    root.id = "shot";
    root.style.cssText = `position:fixed;left:0;top:0;width:${o.width}px;height:${o.height}px;z-index:99999;overflow:hidden;${o.css}`;
    root.innerHTML = o.html;
    card.style.cssText += `;width:${o.cardWidth}px;${o.cardStyle}`;
    (root.querySelector("[data-card]") ?? root).appendChild(card);
    document.body.appendChild(root);
  }, [{ width, height, css, html, cardWidth, cardStyle }, CARD]);
  const buf = await page.locator("#shot").screenshot(type === "jpeg" ? { type: "jpeg", quality: 80, scale: "css" } : { type: "png" });
  await page.evaluate(() => document.getElementById("shot")?.remove());
  return buf;
}

const meta = {};
for (const id of ids) {
  await page.goto(`${BASE}/card?t=${id}`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.waitForSelector(CARD);
  await page.waitForTimeout(250);
  const info = await page.evaluate((sel) => {
    const c = document.querySelector(sel);
    const s = getComputedStyle(c);
    const m = s.color.match(/\d+/g).map(Number);
    const lum = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
    return { bg: s.backgroundImage, ink: s.color, light: lum < 0.5 };
  }, CARD);
  // name and category come from the template page title: "<Name>: <Category> invitation template | ..."
  const html = await (await fetch(`${BASE}/templates/${id}`)).text();
  const [, name = id, category = ""] = html.match(/<title>([^:<]+): ([^<]+?) invitation template/) ?? [];
  meta[id] = { ...info, name };

  // gallery thumbnail
  const thumbPng = await shoot({ width: 240, height: 427, css: "", html: '<div data-card></div>', cardWidth: 240, cardStyle: "position:static;", type: "png" });
  writeFileSync(`public/thumbs/${id}.webp`, await toWebp(thumbPng, 0.8));

  // social preview
  const accent = info.light ? info.ink : "#D9B96B"; // dark ink means a light card: keep contrast
  const og = await shoot({
    width: 1200, height: 630, type: "jpeg", cardWidth: 330,
    cardStyle: "position:absolute;left:0;top:0;border-radius:20px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.35);",
    css: `background:${info.bg};display:flex;align-items:center;font-family:var(--nf-sans),system-ui,sans-serif;color:${info.ink}`,
    html: `<div style="flex:1;padding:0 0 0 72px">
      <div style="font:600 24px var(--nf-sans);letter-spacing:.2em;text-transform:uppercase;color:${accent}">${category}</div>
      <div style="font:700 96px/1.02 var(--nf-display),Georgia,serif;margin:18px 0 22px">${name}</div>
      <div style="font:500 30px/1.35 var(--nf-sans);max-width:560px;opacity:.9">Invitation template. Tap the live demo, then add your names and events.</div>
      <div style="margin-top:34px;font:700 28px var(--nf-sans);color:${accent}">Digital Dawat</div></div>
      <div style="width:560px;height:630px;position:relative;flex:none"><div data-card style="position:absolute;left:150px;top:30px"></div></div>`,
  });
  writeFileSync(`public/og/${id}.jpg`, og);
  process.stdout.write(".");
}
console.log("\nthumbnails and per-template previews written");
await browser.close();
