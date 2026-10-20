// Link-preview images for invitation links (WhatsApp, Facebook, iMessage), 1200x630 JPEG, from the thumbnails in
// public/thumbs (run after `npm run previews`):  node scripts/make-share-images.mjs
//   public/share/bg-<id>.jpg   the design, blurred (no words): the background the customer's own preview is drawn on
//                              (src/lib/shareImage.ts writes their names and date over it when they order)
//   public/share/<id>.jpg      the same with a "You're invited" card: the fallback for invitations made before that
// functions/i.js puts the right one on each invitation link. No sample names appear on either.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";

const CHROME = process.env.CHROME_PATH ?? ["C:/Program Files/Google/Chrome/Application/chrome.exe", "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find(existsSync);
mkdirSync("public/share", { recursive: true });
const ids = readdirSync("public/thumbs").filter((f) => f.endsWith(".webp")).map((f) => f.replace(/\.webp$/, ""));
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const fontCss = "@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Great+Vibes&display=swap');";
for (const id of ids) {
  const src = `data:image/webp;base64,${readFileSync(`public/thumbs/${id}.webp`).toString("base64")}`;
  const bg = `<div style="position:absolute;inset:-80px;background:url(${src}) center/cover;filter:blur(22px) brightness(.8) saturate(1.1)"></div>`;
  await page.setContent(`<body style="margin:0;width:1200px;height:630px;overflow:hidden;position:relative;background:#222">${bg}</body>`);
  await page.waitForTimeout(150);
  writeFileSync(`public/share/bg-${id}.jpg`, await page.screenshot({ type: "jpeg", quality: 84 }));
  await page.setContent(`<html><head><style>${fontCss}</style></head><body style="margin:0;width:1200px;height:630px;overflow:hidden;position:relative;background:#222">${bg}
    <div style="position:absolute;left:50%;top:50%;width:620px;height:440px;transform:translate(-50%,-50%);border-radius:30px;background:rgba(255,253,248,.93);box-shadow:0 24px 60px rgba(0,0,0,.35);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#3a2a1e">
      <div style="font:600 22px 'Cormorant Garamond',Georgia,serif;letter-spacing:.35em;text-transform:uppercase;color:#8a6a3a">An invitation for you</div>
      <div style="font:400 104px/1.05 'Great Vibes',cursive;margin:18px 0 10px;color:#5b3f24">You're invited</div>
      <div style="font:600 28px 'Cormorant Garamond',Georgia,serif;color:#5a4a3a">Tap to open your invitation</div>
    </div></body></html>`);
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(400);
  writeFileSync(`public/share/${id}.jpg`, await page.screenshot({ type: "jpeg", quality: 84 }));
}
await browser.close();
console.log(`share images written: ${ids.length} designs`);
