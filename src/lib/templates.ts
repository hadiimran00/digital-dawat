export type CategoryId =
  | "wedding"
  | "nikkah"
  | "dholki"
  | "mehndi"
  | "walima"
  | "baraat"
  | "engagement"
  | "eid"
  | "birthday"
  | "baby-shower";

export const CATEGORIES: { id: CategoryId; label: string; urdu: string }[] = [
  { id: "wedding", label: "Full wedding", urdu: "مکمل شادی" },
  { id: "nikkah", label: "Nikkah", urdu: "نکاح" },
  { id: "dholki", label: "Dholki", urdu: "ڈھولکی" },
  { id: "mehndi", label: "Mehndi", urdu: "مہندی" },
  { id: "baraat", label: "Baraat", urdu: "بارات" },
  { id: "walima", label: "Walima", urdu: "ولیمہ" },
  { id: "engagement", label: "Engagement", urdu: "منگنی" },
  { id: "eid", label: "Eid", urdu: "عید" },
  { id: "birthday", label: "Birthday", urdu: "سالگرہ" },
  { id: "baby-shower", label: "Baby Shower", urdu: "بے بی شاور" },
];

export type VideoStyle = "rise" | "envelope" | "scratch" | "sparkle";

export type Ornament = "none" | "bars" | "arch" | "jharokha" | "rosette" | "jali" | "geometric" | "floral" | "crescent" | "confetti";

export interface Template {
  id: string;
  name: string;
  category: CategoryId;
  tagline: string;
  tags: string[];
  /** Flat price in PKR, shown upfront. */
  price: number;
  popular?: boolean;
  /** Our signature invitations: listed first, with a badge. Lower number = earlier. */
  signature?: number;
  /** Default animation for this template's video and hover preview. */
  motion: VideoStyle;
  /**
   * Optional storytelling concept: full-screen photo scenes, one section per screen.
   * "tape" = retro home video, "royal" = palace doors and maroon glass, "ivory" = curtains and frosted cream.
   * Modern looks: "editorial" = a magazine feature on paper, "aurora" = moving light behind glass, "monogram" = initials drawn in gold.
   */
  concept?: "tape" | "royal" | "ivory" | "editorial" | "aurora" | "monogram" | "embossed" | "garden";
  /** "garden": the Bismillah as calligraphy artwork (transparent image) instead of typeset text */
  bismillahArt?: string;
  /** "embossed": a short video of the closing doors opening, played when the guest taps open (the `gate` image is its first frame) */
  gateVideo?: string;
  /** "embossed": the ornamental frame drawn around the date */
  dateFrame?: string;
  /** Real artwork (public-domain / CC0) used as the hero image of the card. See CREDITS.md. */
  art?: { src: string; position: string; zoom: number; credit: string };
  /** Optional full-bleed photo behind the whole experience (tape concept). */
  backdrop?: { src: string; credit: string };
  /** The template's own photos, used until the customer uploads their own. */
  sample?: { couple?: string };
  /** Photo behind each section (royal / ivory). Event photos are keyed by event name (mehndi, nikkah, baraat, walima). */
  scenes?: { families?: string; message?: string; countdown?: string; couple?: string; dress?: string; faq?: string; rsvp?: string; closing?: string; events?: Record<string, string> };
  /** Image used for the opening gate: the doors (royal) or the curtain fabric (ivory). */
  gate?: string;
  /** Optional background track that starts when the guest opens the invitation (they can mute it). */
  music?: { src: string; title: string };
  theme: {
    bg: string;
    bg2: string;
    ink: string;
    accent: string;
    muted: string;
    ornament: Ornament;
    headingFont: "serif" | "script" | "sans";
  };
}

export const TEMPLATES: Template[] = [
  {
    id: "zamurd-nikkah",
    motion: "envelope",
    name: "Zamurd",
    category: "nikkah",
    tagline: "Emerald and gold arch, quietly regal.",
    tags: ["emerald", "gold", "classic", "arch"],
    price: 2499,
    popular: true,
    theme: { bg: "#0F3D33", bg2: "#14503f", ink: "#F6EBD0", accent: "#D9B96B", muted: "#A9C5B8", ornament: "arch", headingFont: "serif" },
  },
  {
    id: "gulab-nikkah",
    motion: "sparkle",
    name: "Gulab",
    category: "nikkah",
    tagline: "Soft rose petals on warm ivory.",
    tags: ["rose", "ivory", "floral", "soft"],
    price: 2499,
    theme: { bg: "#FBF2EC", bg2: "#F4E0D8", ink: "#5A1F33", accent: "#B04A66", muted: "#8A6A70", ornament: "floral", headingFont: "script" },
  },
  {
    id: "haldi-mehndi",
    motion: "scratch",
    name: "Haldi",
    category: "mehndi",
    tagline: "Marigold yellow, loud and joyful.",
    tags: ["yellow", "marigold", "vibrant", "dholki"],
    price: 1999,
    popular: true,
    theme: { bg: "#F6B829", bg2: "#F9CE5B", ink: "#3A1D05", accent: "#B3261E", muted: "#6B4A1B", ornament: "geometric", headingFont: "serif" },
  },
  {
    id: "mehr-mehndi",
    motion: "rise",
    name: "Mehr",
    category: "mehndi",
    tagline: "Henna green with a hand-drawn feel.",
    tags: ["green", "henna", "modern"],
    price: 1999,
    theme: { bg: "#1F4A2C", bg2: "#2B6038", ink: "#F3F0DC", accent: "#E6A93A", muted: "#B5CDB4", ornament: "floral", headingFont: "sans" },
  },
  {
    id: "shahi-baraat",
    motion: "envelope",
    name: "Shahi",
    category: "baraat",
    tagline: "Deep maroon and antique gold.",
    tags: ["maroon", "gold", "royal"],
    price: 2999,
    popular: true,
    theme: { bg: "#5B0F1F", bg2: "#751A2D", ink: "#F8E9C7", accent: "#E0B558", muted: "#D3A8A8", ornament: "arch", headingFont: "serif" },
  },
  {
    id: "chandni-walima",
    motion: "sparkle",
    name: "Chandni",
    category: "walima",
    tagline: "Moonlit ivory with silver-blue accents.",
    tags: ["ivory", "blue", "elegant", "crescent"],
    price: 2499,
    theme: { bg: "#F4F1EA", bg2: "#E5E8EE", ink: "#1F2C4A", accent: "#5B7AB0", muted: "#6B7690", ornament: "crescent", headingFont: "serif" },
  },
  {
    id: "mangni-engagement",
    motion: "rise",
    name: "Mangni",
    category: "engagement",
    tagline: "Blush and champagne, minimal and modern.",
    tags: ["blush", "champagne", "minimal"],
    price: 1999,
    theme: { bg: "#F7E7E1", bg2: "#FBF3EF", ink: "#3B2A2A", accent: "#B88A5B", muted: "#8B7469", ornament: "geometric", headingFont: "sans" },
  },
  {
    id: "hilal-eid",
    motion: "sparkle",
    name: "Hilal",
    category: "eid",
    tagline: "Midnight blue crescent for Eid gatherings.",
    tags: ["midnight", "crescent", "gold", "eid"],
    price: 999,
    theme: { bg: "#0B1B3A", bg2: "#13295A", ink: "#F5EFD8", accent: "#F0C75E", muted: "#9AA8C9", ornament: "crescent", headingFont: "serif" },
  },
  {
    id: "rang-birthday",
    motion: "scratch",
    name: "Rang",
    category: "birthday",
    tagline: "Bright confetti for any age.",
    tags: ["colourful", "fun", "confetti"],
    price: 999,
    theme: { bg: "#FFF4D6", bg2: "#FFE3EC", ink: "#2B1B4A", accent: "#E5446D", muted: "#6D5A8F", ornament: "confetti", headingFont: "sans" },
  },
  {
    id: "nanha-baby",
    motion: "rise",
    name: "Nanha",
    category: "baby-shower",
    tagline: "Gentle sage and cream for a new arrival.",
    tags: ["sage", "cream", "gentle"],
    price: 1499,
    theme: { bg: "#EEF1E6", bg2: "#F9F5EA", ink: "#2F3F2A", accent: "#8FA37A", muted: "#71806A", ornament: "floral", headingFont: "script" },
  },
  // ---- Original designs, round 2 --------------------------------------------------------
  {
    id: "mehrab-wedding",
    motion: "envelope",
    name: "Mehrab",
    category: "wedding",
    tagline: "Every function in one invitation, under a gold mehrab.",
    tags: ["full wedding", "all events", "teal", "copper", "multi-event"],
    price: 3999,
    popular: true,
    theme: { bg: "#0A3A46", bg2: "#0F4F5E", ink: "#F7EBD6", accent: "#E0A468", muted: "#A9C9CF", ornament: "jharokha", headingFont: "serif" },
  },
  {
    id: "jharokha-baraat",
    motion: "scratch",
    name: "Jharokha",
    category: "baraat",
    tagline: "A Mughal window arch in crimson and gold.",
    tags: ["crimson", "gold", "mughal", "royal"],
    price: 2999,
    theme: { bg: "#6B0F2A", bg2: "#8A1A3A", ink: "#FBEBC8", accent: "#E8B95C", muted: "#E0B6B8", ornament: "jharokha", headingFont: "serif" },
  },
  {
    id: "noor-nikkah",
    motion: "sparkle",
    name: "Noor",
    category: "nikkah",
    tagline: "Light on ivory with a champagne rosette.",
    tags: ["ivory", "champagne", "quiet luxury", "rosette"],
    price: 2499,
    theme: { bg: "#F8F3E8", bg2: "#EFE6D3", ink: "#3B3226", accent: "#A98A4E", muted: "#7C6D55", ornament: "rosette", headingFont: "serif" },
  },
  {
    id: "jali-walima",
    motion: "rise",
    name: "Jali",
    category: "walima",
    tagline: "A carved stone screen in sage and stone.",
    tags: ["sage", "stone", "neutral", "lattice", "minimal"],
    price: 2499,
    theme: { bg: "#E3E9DC", bg2: "#F3F0E7", ink: "#2E3B2C", accent: "#6F8560", muted: "#68785E", ornament: "jali", headingFont: "sans" },
  },
  {
    id: "rangmahal-mehndi",
    motion: "scratch",
    name: "Rang Mahal",
    category: "mehndi",
    tagline: "Hot pink and saffron, made for dancing.",
    tags: ["pink", "orange", "vibrant", "festive"],
    price: 1999,
    popular: true,
    theme: { bg: "#B3124F", bg2: "#DD4A2E", ink: "#FFF2D6", accent: "#FFD54F", muted: "#FFD9C4", ornament: "rosette", headingFont: "sans" },
  },
  {
    id: "dholki-raat",
    motion: "sparkle",
    name: "Dholki Raat",
    category: "dholki",
    tagline: "Marigold and plum for the first night of songs.",
    tags: ["marigold", "plum", "songs", "family"],
    price: 1499,
    theme: { bg: "#FF9F1C", bg2: "#FFC15E", ink: "#2B0A3D", accent: "#7B1E7A", muted: "#5A2A56", ornament: "confetti", headingFont: "serif" },
  },
  {
    id: "sitara-engagement",
    motion: "sparkle",
    name: "Sitara",
    category: "engagement",
    tagline: "Midnight navy with rose-gold stars.",
    tags: ["navy", "rose gold", "romantic", "rosette"],
    price: 1999,
    theme: { bg: "#14213D", bg2: "#22335C", ink: "#FBEFE6", accent: "#E5B299", muted: "#B4BCD3", ornament: "rosette", headingFont: "serif" },
  },
  {
    id: "roshan-eid",
    motion: "envelope",
    name: "Roshan",
    category: "eid",
    tagline: "Deep teal lattice with a golden glow.",
    tags: ["teal", "gold", "lattice", "eid"],
    price: 999,
    theme: { bg: "#0F4C5C", bg2: "#166F82", ink: "#FFF4DA", accent: "#F2C14E", muted: "#A8D3DA", ornament: "jali", headingFont: "serif" },
  },
  {
    id: "chaand-baby",
    motion: "rise",
    name: "Chaand",
    category: "baby-shower",
    tagline: "Powder blue moon for a little one.",
    tags: ["blue", "moon", "soft", "boy"],
    price: 1499,
    theme: { bg: "#E6EEF7", bg2: "#F7F2EA", ink: "#2B3A55", accent: "#7F9BC8", muted: "#6B7A96", ornament: "crescent", headingFont: "script" },
  },
  {
    id: "gulzar-birthday",
    motion: "scratch",
    name: "Gulzar",
    category: "birthday",
    tagline: "Lavender and raspberry blooms.",
    tags: ["lavender", "raspberry", "floral", "party"],
    price: 999,
    theme: { bg: "#F3E8FF", bg2: "#FFE8F0", ink: "#3B1B5A", accent: "#D6336C", muted: "#7A5A9A", ornament: "floral", headingFont: "script" },
  },
  {
    id: "replay-wedding",
    signature: 1,
    motion: "rise",
    concept: "tape",
    music: { src: "/audio/replay.mp3", title: "Replay" },
    sample: { couple: "/art/couple-hands.webp" },
    backdrop: { src: "/art/mehndi-stage.webp", credit: "Mehndi stage photograph supplied by the site owner, who holds the licence." },
    // scene photos via Pinterest; the site owner holds the licence (see CREDITS.md)
    scenes: {
      families: "/art/rp-families.webp", message: "/art/rp-message.webp", countdown: "/art/rp-countdown.webp",
      dress: "/art/rp-dress.webp", faq: "/art/rp-faq.webp", rsvp: "/art/rp-rsvp.webp", closing: "/art/rp-closing.webp",
      events: { mehndi: "/art/rp-mehndi.webp", nikkah: "/art/rp-nikkah.webp", baraat: "/art/rp-baraat.webp", walima: "/art/rp-walima.webp" },
    },
    name: "Replay",
    category: "wedding",
    tagline: "Your wedding week as a retro home-video tape.",
    tags: ["retro", "vhs", "tape", "full wedding", "fun", "dark"],
    price: 3999,
    popular: true,
    theme: { bg: "#140C08", bg2: "#2A160C", ink: "#F6E7C8", accent: "#FF9A3C", muted: "#D9C29A", ornament: "bars", headingFont: "script" },
  },
  {
    id: "gulistan-nikkah",
    motion: "rise",
    name: "Gulistan",
    category: "nikkah",
    tagline: "A Mughal flower painting on gold leaf.",
    tags: ["mughal", "painting", "gold", "floral", "artwork", "heritage"],
    price: 2999,
    popular: true,
    art: { src: "/art/mughal-floral.webp", position: "50% 42%", zoom: 1.18, credit: "Vase with flower arrangement and scrollwork, Mughal India, Lucknow, c. 1750–1800. The Cleveland Museum of Art, Open Access (CC0)." },
    theme: { bg: "#F3E4BE", bg2: "#EAD39B", ink: "#4A1620", accent: "#A8321F", muted: "#6B4A3A", ornament: "none", headingFont: "serif" },
  },
  {
    id: "bagh-walima",
    motion: "sparkle",
    name: "Bagh",
    category: "walima",
    tagline: "A garden of embroidered flowers, ivory and rose.",
    tags: ["embroidery", "garden", "ivory", "rose", "artwork", "heritage"],
    price: 2499,
    art: { src: "/art/mughal-medallion.webp", position: "50% 46%", zoom: 1.5, credit: "Spread with floral medallion pattern, Mughal India (Deccan), embroidery. The Cleveland Museum of Art, Open Access (CC0)." },
    theme: { bg: "#FBF6EA", bg2: "#F1E6CF", ink: "#3C2A1E", accent: "#B0345A", muted: "#6E6A3A", ornament: "none", headingFont: "serif" },
  },
  // ---- Scene templates (royal / ivory) built from Ceremonia references. Images and songs: see CREDITS.md. ----
  {
    id: "darbar-wedding",
    signature: 2,
    motion: "sparkle",
    concept: "royal",
    name: "Shahi Darbar",
    category: "wedding",
    tagline: "Palace doors open onto your wedding week, in maroon and gold.",
    tags: ["royal", "palace", "maroon", "gold", "full wedding", "mughal"],
    price: 3999,
    music: { src: "/audio/darbar-song.m4a", title: "Usne Jana Ki Tarif" },
    gate: "/art/bs-door.webp",
    backdrop: { src: "/art/bs-hall.webp", credit: "Via Pinterest; the site owner holds the licence (see CREDITS.md)." },
    sample: { couple: "/art/bs-couple.webp" },
    scenes: {
      dress: "/art/bs-corridor.webp", faq: "/art/bs-corridor.webp", rsvp: "/art/bs-corridor.webp", closing: "/art/bs-closing.webp",
      couple: "/art/bs-corridor.webp",
      events: { mehndi: "/art/bs-mehndi.webp", nikkah: "/art/bs-nikkah.webp", baraat: "/art/bs-baraat.webp", walima: "/art/bs-walima.webp" },
    },
    theme: { bg: "#2A0A0E", bg2: "#4A1218", ink: "#F7E7C6", accent: "#E8C06A", muted: "#D9BFA0", ornament: "none", headingFont: "serif" },
  },
  {
    id: "wisaal-wedding",
    signature: 3,
    motion: "rise",
    concept: "ivory",
    name: "Wisaal",
    category: "wedding",
    tagline: "An ivory curtain parts on a love story by the Taj.",
    tags: ["ivory", "taj mahal", "romantic", "night", "fireworks", "full wedding"],
    price: 3999,
    music: { src: "/audio/wisaal-song.m4a", title: "Do Pal" },
    gate: "/art/dw-curtain.webp",
    backdrop: { src: "/art/dw-opening.webp", credit: "Via Pinterest; the site owner holds the licence (see CREDITS.md)." },
    sample: { couple: "/art/dw-couple.webp" },
    scenes: {
      message: "/art/dw-arch.webp", countdown: "/art/dw-night.webp", couple: "/art/dw-night.webp",
      dress: "/art/dw-lit.webp", faq: "/art/dw-lit.webp", rsvp: "/art/dw-night.webp", closing: "/art/dw-moon.webp",
      events: { mehndi: "/art/dw-mehndi.webp", nikkah: "/art/dw-arch.webp", baraat: "/art/dw-baraat.webp", walima: "/art/dw-walima.webp" },
    },
    theme: { bg: "#F6EFE4", bg2: "#EFE3D0", ink: "#4A1C20", accent: "#A8783A", muted: "#7A5A48", ornament: "none", headingFont: "serif" },
  },
  {
    id: "kahani-wedding",
    signature: 4,
    motion: "rise",
    concept: "editorial",
    name: "Kahani",
    category: "wedding",
    tagline: "Your wedding week as a magazine feature: big type, real photos, white space.",
    tags: ["modern", "editorial", "magazine", "minimal", "white", "photo", "full wedding"],
    price: 3999,
    // demo photos are the licensed ones already on the site (see CREDITS.md); customers' own photos replace them
    backdrop: { src: "/art/rp-walima.webp", credit: "Via Pinterest; the site owner holds the licence (see CREDITS.md)." },
    sample: { couple: "/art/dw-couple.webp" },
    scenes: { events: { mehndi: "/art/rp-mehndi.webp", nikkah: "/art/rp-nikkah.webp", baraat: "/art/rp-baraat.webp", walima: "/art/dw-walima.webp" } },
    theme: { bg: "#F5F1EA", bg2: "#ECE5D8", ink: "#141414", accent: "#8C1C13", muted: "#5B5550", ornament: "none", headingFont: "serif" },
  },
  {
    id: "roshni-wedding",
    signature: 5,
    motion: "sparkle",
    concept: "aurora",
    name: "Roshni",
    category: "wedding",
    tagline: "Soft moving light and glass cards, like a night of fairy lights.",
    tags: ["modern", "night", "glow", "aurora", "dark", "glass", "minimal", "full wedding"],
    price: 3999,
    theme: { bg: "#07060F", bg2: "#15112B", ink: "#F5F3FF", accent: "#C9B8FF", muted: "#B9B3D6", ornament: "none", headingFont: "sans" },
  },
  {
    id: "mohr-wedding",
    signature: 6,
    motion: "rise",
    concept: "monogram",
    name: "Mohr",
    category: "wedding",
    tagline: "Your initials drawn in fine gold, on quiet off-white. Timeless and minimal.",
    tags: ["modern", "monogram", "minimal", "gold", "white", "classic", "elegant", "full wedding"],
    price: 3999,
    theme: { bg: "#FAF8F3", bg2: "#F1ECE1", ink: "#1F2A28", accent: "#B08D57", muted: "#6B6F69", ornament: "none", headingFont: "serif" },
  },
  {
    id: "afreen-wedding",
    signature: 7,
    motion: "rise",
    concept: "embossed",
    name: "Afreen",
    category: "wedding",
    tagline: "Ivory doors with a wax seal open onto an embossed flower arch.",
    tags: ["ivory", "embossed", "wax seal", "doors", "floral", "elegant", "minimal", "full wedding"],
    price: 3999,
    // design files from in-vitely.com's Elysee theme, used with the site owner's permission from them (see CREDITS.md)
    gate: "/art/afreen-doors.webp",
    gateVideo: "/art/afreen-doors-open.mp4",
    backdrop: { src: "/art/afreen-frame.webp", credit: "Elysee design by in-vitely.com, used with permission (see CREDITS.md)." },
    dateFrame: "/art/afreen-date-frame.webp",
    sample: { couple: "/art/dw-couple.webp" },
    theme: { bg: "#EFE8DD", bg2: "#E7DDCF", ink: "#6E5A43", accent: "#9C8462", muted: "#8A7660", ornament: "none", headingFont: "script" },
  },
  {
    id: "qabool-nikkah",
    signature: 8,
    motion: "rise",
    concept: "garden",
    name: "Qabool",
    category: "nikkah",
    tagline: "A pearl curtain parts on a blush flower arch: Bismillah, your names, and Qabool Hai.",
    tags: ["nikkah", "pastel", "pink", "blush", "sage", "floral", "illustrated", "couple", "chandelier", "qabool hai"],
    price: 2999,
    // artwork and song from ShubhamArt's video invitation, used with the site owner's permission (see CREDITS.md);
    // the frames were cleaned of text and AI-upscaled 4x
    music: { src: "/audio/qabool-song.m4a", title: "Qabool" },
    gate: "/art/qabool-curtain.webp",
    gateVideo: "/art/qabool-curtain.mp4",
    backdrop: { src: "/art/qabool-scene.webp", credit: "ShubhamArt, used with permission (see CREDITS.md)." },
    bismillahArt: "/art/qabool-bismillah.webp",
    scenes: { couple: "/art/qabool-couple.webp", closing: "/art/qabool-couple.webp" },
    theme: { bg: "#F6E9E8", bg2: "#F1E2E0", ink: "#4F5F57", accent: "#7F9A88", muted: "#6E7D74", ornament: "none", headingFont: "script" },
  },
];

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id);
export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export function formatPKR(n: number) {
  return `Rs ${n.toLocaleString("en-PK")}`;
}

/** Signature invitations first (in their set order), then everything else in catalogue order. */
export const ORDERED = [...TEMPLATES].sort((a, b) => (a.signature ?? 99) - (b.signature ?? 99));
export const SIGNATURE = ORDERED.filter((t) => t.signature);

/** How people actually type it: Roman Urdu spellings and everyday words, mapped to the words templates use. */
const ALIASES: Record<string, string> = {
  shadi: "wedding", shaadi: "wedding", marriage: "wedding", biyah: "wedding",
  valima: "walima", nikah: "nikkah", nikaah: "nikkah", barat: "baraat", baarat: "baraat",
  mehendi: "mehndi", mehandi: "mehndi", henna: "mehndi", mayun: "mehndi", mayoun: "mehndi",
  dholak: "dholki", mangni: "engagement", mangi: "engagement", salgira: "birthday", salgirah: "birthday",
};
/** Every template has these, so they shouldn't narrow the results. */
const EVERY_TEMPLATE = new Set(["urdu", "english", "bismillah", "rsvp", "invitation", "invitations", "invite", "card", "cards", "digital", "whatsapp", "template", "templates", "video", "design", "designs", "online"]);

export function searchTemplates(q: string, category: CategoryId | "all") {
  const words = q.trim().toLowerCase().split(/[\s,]+/).filter((w) => w && !EVERY_TEMPLATE.has(w)).map((w) => ALIASES[w] ?? w);
  return ORDERED.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    if (!words.length) return true;
    const cat = CATEGORIES.find((c) => c.id === t.category);
    const hay = [t.name, t.tagline, cat?.label, cat?.urdu, t.signature ? "signature" : "", t.music ? "music song" : "", t.concept ? "photo photos cinematic" : "", ...t.tags]
      .join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}
