import type { InviteContent } from "./content";

/** One invited guest (or family) on the host's list. `events` are positions in content.events; null = all events. */
export interface Guest {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  seats: number;
  events: number[] | null;
  sent_at: string | null;
  opened_at: string | null;
  created_at: string;
}

export const MAX_GUESTS = 1500;

/** A private, unguessable link code for one guest (lowercase letters and digits, 10 characters). */
export function guestCode() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

/**
 * Normalise a phone number to WhatsApp's international digits-only form, Pakistan-first:
 * "0300-1234567" -> "923001234567", "+92 300 1234567" -> "923001234567", "00971 50..." -> "97150...".
 * Returns null when it does not look like a phone number.
 */
export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/[^\d+]/g, "");
  if (!d) return null;
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0") && d.length === 11) d = `92${d.slice(1)}`; // 03001234567
  else if (d.length === 10 && d.startsWith("3")) d = `92${d}`; // 3001234567
  d = d.replace(/\D/g, "");
  return /^[0-9]{8,15}$/.test(d) ? d : null;
}

/** The guest's private invitation link. */
export const guestLink = (origin: string, slug: string, g: Pick<Guest, "code">) => `${origin}/i?s=${encodeURIComponent(slug)}&c=${g.code}`;

export const DEFAULT_MESSAGE =
  "Assalam-o-Alaikum {name}! You are warmly invited to the wedding of {hosts}. Please open your invitation and let us know if you can come: {link}";

/** Fill the host's message template for one guest. */
export function fillMessage(template: string, v: { name: string; hosts: string; link: string; events: string }) {
  const out = template.replace(/\{name\}/g, v.name).replace(/\{hosts\}/g, v.hosts).replace(/\{events\}/g, v.events).replace(/\{link\}/g, v.link);
  return out.includes(v.link) ? out : `${out} ${v.link}`; // the link must always be in the message
}

/** WhatsApp link: straight to the guest's chat when we have a number, otherwise WhatsApp's own contact picker. */
export const whatsappLink = (phone: string | null, text: string) =>
  `https://wa.me/${phone ?? ""}?text=${encodeURIComponent(text)}`;

/** Names of the events a guest is invited to ("All events" when null). */
export function eventNames(content: InviteContent, events: number[] | null) {
  if (!events) return content.events.map((e) => e.title);
  return events.map((i) => content.events[i]?.title).filter(Boolean) as string[];
}

export interface ImportRow {
  name: string;
  phone: string | null;
  phoneRaw: string;
  seats: number;
  events: number[] | null;
  problem?: string;
}

/**
 * Parse guests pasted from Excel / Google Sheets (tab-separated) or a CSV file.
 * Columns, in any order when there is a header row: Name, Phone, Places (or Guests/Seats), Events.
 * Without a header the order is Name, Phone, Places, Events. Events may be "all" or names separated by commas/semicolons.
 */
export function parseGuests(text: string, content: InviteContent, defaultEvents: number[] | null): ImportRow[] {
  const lines = text.replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const sep = lines.some((l) => l.includes("\t")) ? "\t" : ",";
  const split = (line: string) => {
    if (sep === "\t") return line.split("\t").map((c) => c.trim());
    // CSV with quotes
    const cells: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === ",") { cells.push(cur.trim()); cur = ""; } else cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  };
  let rows = lines.map(split);
  let col = { name: 0, phone: 1, seats: 2, events: 3 };
  const head = rows[0].map((c) => c.toLowerCase());
  if (head.some((c) => /^(name|guest|guest name)$/.test(c))) {
    const find = (re: RegExp, fallback: number) => { const i = head.findIndex((c) => re.test(c)); return i === -1 ? fallback : i; };
    col = { name: find(/name|guest/, 0), phone: find(/phone|mobile|number|whatsapp|contact/, -1), seats: find(/place|seat|guests|count|people|persons/, -1), events: find(/event|function/, -1) };
    rows = rows.slice(1);
  }
  const titles = content.events.map((e) => e.title.trim().toLowerCase());
  return rows.slice(0, MAX_GUESTS).map((cells) => {
    const name = (cells[col.name] ?? "").slice(0, 80);
    const phoneRaw = col.phone >= 0 ? cells[col.phone] ?? "" : "";
    const phone = phoneRaw ? normalizePhone(phoneRaw) : null;
    const seatsNum = col.seats >= 0 ? parseInt(cells[col.seats] ?? "", 10) : NaN;
    const seats = Number.isInteger(seatsNum) && seatsNum >= 1 && seatsNum <= 20 ? seatsNum : 1;
    let events = defaultEvents;
    let problem = !name ? "No name" : phoneRaw && !phone ? "Phone number not recognised" : undefined;
    const evCell = col.events >= 0 ? (cells[col.events] ?? "").trim() : "";
    if (evCell && !/^all/i.test(evCell)) {
      const picked = evCell.split(/[;,/|+&]| and /i).map((s) => s.trim().toLowerCase()).filter(Boolean);
      const idx = picked.map((p) => titles.findIndex((t) => t === p || t.startsWith(p) || p.startsWith(t))).filter((i) => i >= 0);
      if (idx.length) events = [...new Set(idx)].sort((a, b) => a - b);
      else problem ??= `Unknown event "${evCell}"`;
    } else if (/^all/i.test(evCell)) events = null;
    return { name, phone, phoneRaw, seats, events, problem };
  });
}

const csvCell = (v: string | number) => {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralise spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};
export const toCsv = (rows: (string | number)[][]) => rows.map((r) => r.map(csvCell).join(",")).join("\n");
