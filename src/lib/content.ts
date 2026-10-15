import type { CategoryId } from "./templates";

export type { InviteContent, InviteEvent } from "./contentSchema";
import type { InviteContent, InviteEvent } from "./contentSchema";

export const BISMILLAH = "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

const COUPLE: CategoryId[] = ["wedding", "nikkah", "mehndi", "baraat", "walima", "engagement", "dholki"];

/** Suggested starting dress codes, based on common guidance (editable). */
const EVENT_KINDS: Record<string, { en: string; ur: string; dressEn: string; dressUr: string }> = {
  dholki: { en: "Dholki", ur: "ڈھولکی", dressEn: "Casual festive", dressUr: "سادہ اور رنگین" },
  mehndi: { en: "Mehndi", ur: "مہندی", dressEn: "Yellows and greens", dressUr: "پیلا اور سبز" },
  nikkah: { en: "Nikkah", ur: "نکاح", dressEn: "Soft, traditional", dressUr: "ہلکے رنگ، روایتی" },
  baraat: { en: "Baraat", ur: "بارات", dressEn: "Formal", dressUr: "رسمی" },
  walima: { en: "Walima", ur: "ولیمہ", dressEn: "Formal, light colours", dressUr: "رسمی، ہلکے رنگ" },
  engagement: { en: "Engagement", ur: "منگنی", dressEn: "Semi-formal", dressUr: "نیم رسمی" },
  eid: { en: "Eid Gathering", ur: "عید ملن", dressEn: "", dressUr: "" },
  birthday: { en: "Birthday Celebration", ur: "سالگرہ", dressEn: "", dressUr: "" },
  aqiqah: { en: "Aqiqah", ur: "عقیقہ", dressEn: "", dressUr: "" },
  "baby-shower": { en: "Baby Shower", ur: "بے بی شاور", dressEn: "", dressUr: "" },
};

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const blankEvent = (kind: string, ur: boolean, date: string, time: string): InviteEvent => {
  const k = EVENT_KINDS[kind];
  return {
    title: ur ? k.ur : k.en,
    date,
    time,
    venue: "",
    address: "",
    mapUrl: "",
    dressCode: ur ? k.dressUr : k.dressEn,
    photo: "",
  };
};

export function newEvent(language: "en" | "ur" = "en"): InviteEvent {
  return { title: language === "ur" ? "تقریب" : "New event", date: addDays(30), time: "19:00", venue: "", address: "", mapUrl: "", dressCode: "", photo: "" };
}

export function defaultContent(category: CategoryId, language: "en" | "ur" = "en"): InviteContent {
  const ur = language === "ur";
  const couple = COUPLE.includes(category);
  const d0 = 30;
  const events: InviteEvent[] =
    category === "wedding"
      ? [
          blankEvent("mehndi", ur, addDays(d0), "19:00"),
          blankEvent("nikkah", ur, addDays(d0 + 2), "16:00"),
          blankEvent("baraat", ur, addDays(d0 + 2), "19:30"),
          blankEvent("walima", ur, addDays(d0 + 4), "19:00"),
        ]
      : [blankEvent(category, ur, addDays(d0), "19:00")];

  if (category === "aqiqah") {
    return {
      ...defaultContent("birthday", language),
      bismillah: true,
      headline: ur ? "اللہ کے فضل و کرم سے" : "With the blessings of Allah",
      host1: ur ? "زارا فاطمہ" : "Zara Fatima",
      family1: ur ? "مسٹر اور مسز حمزہ شاہد" : "Mr. & Mrs. Hamza Shahid",
      message: ur
        ? "ہماری بیٹی کی نعمت پر اللہ کا شکر ادا کرنے میں ہمارے ساتھ شریک ہوں۔"
        : "Join us as we give thanks to Allah for the gift of our daughter.",
      events: [blankEvent("aqiqah", ur, addDays(d0), "13:00")],
      closing: ur ? "آپ کی دعاؤں کے منتظر" : "Your duas mean the world to us",
    };
  }
  return {
    language,
    bismillah: couple && category !== "engagement" && category !== "dholki",
    headline: ur
      ? couple ? "اپنے اہلِ خانہ کے ہمراہ" : "آپ کو دلی دعوت ہے"
      : couple ? "Together with their families" : "You are warmly invited",
    host1: couple ? "Ayesha" : category === "eid" ? "The Khan Family" : "Zain",
    host2: couple ? "Hamza" : "",
    message: ur
      ? couple ? "ہماری خوشیوں میں شریک ہونے کے لیے آپ کو دلی دعوت دی جاتی ہے۔" : "ہمارے ساتھ ایک خوبصورت شام گزارنے کے لیے تشریف لائیں۔"
      : couple
        ? "Request the pleasure of your company as we begin our new chapter together."
        : "Join us for an evening of food, laughter and good company.",
    family1: couple && category === "wedding" ? (ur ? "مسٹر اور مسز خالد محمود اور اہلِ خانہ" : "Mr. & Mrs. Khalid Mehmood and family") : "",
    family2: couple && category === "wedding" ? (ur ? "مسٹر اور مسز نوید اقبال اور اہلِ خانہ" : "Mr. & Mrs. Naveed Iqbal and family") : "",
    side1Label: category === "wedding" ? (ur ? "دولہا کی طرف" : "Groom's side") : "",
    side2Label: category === "wedding" ? (ur ? "دلہن کی طرف" : "Bride's side") : "",
    members1:
      category === "wedding"
        ? [
            { name: ur ? "حمزہ محمود" : "Hamza Mehmood", phone: "+92 300 0000000" },
            { name: ur ? "عریبہ محمود" : "Areeba Mehmood", phone: "" },
          ]
        : [],
    members2: category === "wedding" ? [{ name: ur ? "حنا اقبال" : "Hina Iqbal", phone: "+92 300 0000001" }] : [],
    events,
    faq:
      category === "wedding"
        ? [
            { q: ur ? "کیا پہنوں؟" : "What should I wear?", a: ur ? "ہر تقریب کا ڈریس کوڈ اوپر لکھا ہے۔" : "Each event's dress code is listed above." },
            { q: ur ? "پارکنگ کہاں ہے؟" : "Where do I park?", a: ur ? "مقام پر پارکنگ دستیاب ہے۔" : "Parking is available at the venue." },
          ]
        : [],
    timeline:
      category === "wedding" || category === "nikkah"
        ? [
            { time: "19:00", title: ur ? "نکاح" : "Nikkah", note: ur ? "خاندان اور عزیزوں کی موجودگی میں نکاح کی تقریب۔" : "The nikkah ceremony, with our families and loved ones." },
            { time: "20:30", title: ur ? "عشائیہ" : "Dinner", note: ur ? "کھانا، ملاقاتیں اور خوشیاں۔" : "Dinner, catching up and celebrating together." },
            { time: "22:00", title: ur ? "رخصتی" : "Rukhsati", note: ur ? "دعاؤں کے ساتھ رخصتی۔" : "We say goodbye to the bride with our prayers." },
          ]
        : [],
    closing: ur ? "آپ کی آمد کے منتظر" : "We can’t wait to celebrate with you",
    age: "",
    rsvpEnabled: true,
    contactPhone: "",
    coverPhoto: "",
    couplePhoto: "",
  };
}

/** Title shown on the card: one event's name, or all of them joined. */
export const eventsTitle = (c: InviteContent) => c.events.map((e) => e.title).join(" · ");

/** One date, or "first – last" when the events span several days. */
export function eventsDateText(c: InviteContent, locale = "en-GB") {
  const dates = c.events.map((e) => e.date).filter(Boolean).sort();
  if (dates.length === 0) return "";
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (first === last) return formatEventDate(first, locale);
  const fmt = (d: string, o: Intl.DateTimeFormatOptions) => new Date(`${d}T00:00:00`).toLocaleDateString(locale, o);
  return `${fmt(first, { day: "numeric", month: "short" })} – ${fmt(last, { day: "numeric", month: "short", year: "numeric" })}`;
}

export function formatEventDate(date: string, locale = "en-GB") {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function formatEventTime(time: string) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!m) return time;
  const h = Number(m[1]);
  return `${((h + 11) % 12) + 1}:${m[2]} ${h >= 12 ? "PM" : "AM"}`;
}

const icsEscape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** A standards-compliant .ics file (floating local time, 3 hour default length) for "Add to calendar". */
export function buildIcs(ev: InviteEvent, hosts: string): string {
  const [y, mo, d] = ev.date.split("-");
  const [h, mi] = (ev.time || "19:00").split(":");
  const start = `${y}${mo}${d}T${h.padStart(2, "0")}${mi}00`;
  const end = new Date(Number(y), Number(mo) - 1, Number(d), Number(h) + 3, Number(mi));
  const pad = (n: number) => String(n).padStart(2, "0");
  const endStr = `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const location = [ev.venue, ev.address].filter(Boolean).join(", ");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Digital Dawat//Invitation//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@digitaldawat`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${endStr}`,
    `SUMMARY:${icsEscape(`${ev.title} – ${hosts}`)}`,
    location ? `LOCATION:${icsEscape(location)}` : "",
    ev.mapUrl ? `URL:${ev.mapUrl}` : "",
    ev.dressCode ? `DESCRIPTION:${icsEscape(`Dress code: ${ev.dressCode}`)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function randomSlug() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
