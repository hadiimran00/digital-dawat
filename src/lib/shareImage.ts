import { eventsDateText, type InviteContent } from "./content";
import type { Template } from "./templates";
import { PHOTO_BUCKET } from "./photos";

/*
 * The picture WhatsApp (and Facebook, iMessage) shows for an invitation link: the couple's names and date on a card,
 * over a blurred copy of their design (public/share/bg-<id>.jpg). Drawn in the customer's browser when they order,
 * saved to their photo folder, and put on the link by functions/i.js. 1200x630, the shape link previews use.
 */

const W = 1200, H = 630;
const cssVar = (name: string, fallback: string) =>
  (typeof document !== "undefined" && getComputedStyle(document.documentElement).getPropertyValue(name).trim()) || fallback;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

/** The largest font size (down to `min`) at which `text` fits in `maxW`. */
function fit(c: CanvasRenderingContext2D, text: string, font: (px: number) => string, start: number, min: number, maxW: number) {
  let px = start;
  for (; px > min; px -= 4) { c.font = font(px); if (c.measureText(text).width <= maxW) break; }
  c.font = font(px);
  return px;
}

export async function drawShareImage(template: Template, content: InviteContent): Promise<Blob> {
  const ur = content.language === "ur";
  const kids = template.print?.fonts === "kids";
  const script = ur ? cssVar("--nf-urdu", "serif") : kids ? cssVar("--nf-fun", "sans-serif") : cssVar("--nf-script", "cursive");
  const serif = ur ? cssVar("--nf-urdu", "serif") : cssVar("--nf-display", "Georgia, serif");
  const names = content.host2 ? `${content.host1} ${ur ? "اور" : "&"} ${content.host2}` : content.host1;
  const occasion = content.events.length > 1 ? (ur ? "شادی" : "Wedding") : content.events[0]?.title ?? "";
  await Promise.all([document.fonts.load(`400 90px ${script}`, names), document.fonts.load(`600 28px ${serif}`, occasion)]).catch(() => {});

  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const c = canvas.getContext("2d");
  if (!c) throw new Error("Canvas is not available in this browser.");
  const bg = await loadImage(`/share/bg-${template.id}.jpg`).catch(() => null);
  if (bg) c.drawImage(bg, 0, 0, W, H); else { c.fillStyle = template.theme.bg; c.fillRect(0, 0, W, H); }

  // the card
  const cw = 680, ch = 460, cx = (W - cw) / 2, cy = (H - ch) / 2;
  c.save();
  c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 50; c.shadowOffsetY = 20;
  c.fillStyle = "rgba(255,253,248,0.94)";
  c.beginPath(); c.roundRect(cx, cy, cw, ch, 30); c.fill();
  c.restore();
  c.strokeStyle = "rgba(154,118,67,0.55)"; c.lineWidth = 2;
  c.beginPath(); c.roundRect(cx + 14, cy + 14, cw - 28, ch - 28, 22); c.stroke();

  c.textAlign = "center"; c.textBaseline = "alphabetic"; c.direction = ur ? "rtl" : "ltr";
  c.fillStyle = "#8a6a3a";
  fit(c, (ur ? "آپ مدعو ہیں" : "You're invited").toUpperCase(), (px) => `600 ${px}px ${serif}`, 24, 16, cw - 120);
  c.save(); if (!ur) c.letterSpacing = "8px"; c.fillText(ur ? "آپ مدعو ہیں" : "YOU'RE INVITED", W / 2, cy + 112); c.restore();
  c.fillStyle = "#4e3520";
  const px = fit(c, names, (p) => `${kids ? 700 : 400} ${p}px ${script}`, 104, 44, cw - 110);
  c.fillText(names, W / 2, cy + 150 + px * 0.85);
  c.fillStyle = "#5a4a3a";
  fit(c, occasion, (p) => `600 ${p}px ${serif}`, 34, 20, cw - 120);
  c.fillText(occasion, W / 2, cy + ch - 118);
  const date = eventsDateText(content, ur ? "ur-PK" : "en-GB");
  fit(c, date, (p) => `600 ${p}px ${serif}`, 28, 18, cw - 120);
  c.fillStyle = "#8a6a3a";
  c.fillText(date, W / 2, cy + ch - 74);

  return new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Could not create the picture."))), "image/jpeg", 0.86));
}

/** Draws and uploads the link-preview picture to the customer's photo folder; returns its URL, or "" if it couldn't. */
export async function uploadShareImage(template: Template, content: InviteContent): Promise<string> {
  try {
    const { getSupabase } = await import("./supabase");
    const sb = getSupabase();
    const user = sb && (await sb.auth.getSession()).data.session?.user;
    if (!sb || !user) return "";
    const blob = await drawShareImage(template, content);
    const path = `${user.id}/share-${crypto.randomUUID()}.jpg`;
    const { error } = await sb.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
    if (error) return "";
    return sb.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
  } catch {
    return ""; // the link then shows the design's own "You're invited" picture
  }
}
