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
  | "aqiqah"
  | "baby-shower";

export const CATEGORIES: { id: CategoryId; label: string; urdu: string }[] = [
  { id: "wedding", label: "Full wedding", urdu: "Ù…Ú©Ù…Ù„ Ø´Ø§Ø¯ÛŒ" },
  { id: "nikkah", label: "Nikkah", urdu: "Ù†Ú©Ø§Ø­" },
  { id: "dholki", label: "Dholki", urdu: "ÚˆÚ¾ÙˆÙ„Ú©ÛŒ" },
  { id: "mehndi", label: "Mehndi", urdu: "Ù…ÛÙ†Ø¯ÛŒ" },
  { id: "baraat", label: "Baraat", urdu: "Ø¨Ø§Ø±Ø§Øª" },
  { id: "walima", label: "Walima", urdu: "ÙˆÙ„ÛŒÙ…Û" },
  { id: "engagement", label: "Engagement", urdu: "Ù…Ù†Ú¯Ù†ÛŒ" },
  { id: "eid", label: "Eid", urdu: "Ø¹ÛŒØ¯" },
  { id: "birthday", label: "Birthday", urdu: "Ø³Ø§Ù„Ú¯Ø±Û" },
  { id: "aqiqah", label: "Aqiqah", urdu: "Ø¹Ù‚ÛŒÙ‚Û" },
  { id: "baby-shower", label: "Baby Shower", urdu: "Ø¨Û’ Ø¨ÛŒ Ø´Ø§ÙˆØ±" },
];

export type VideoStyle = "rise" | "envelope" | "scratch" | "sparkle";

export type Ornament = "none" | "bars" | "arch" | "jharokha" | "rosette" | "jali" | "geometric" | "floral" | "crescent" | "confetti";

/**
 * The opening of the "Tap to open" cover. envelope: the seal lifts, the flap opens and the card slides out;
 * doors / curtain / split: the cover parts in two (swinging, sideways, up and down); fold: opens like a greeting card;
 * float: drifts up and away; bloom: swells and fades; veil: blurs and lifts; settle: sinks back and fades; glide: slides up.
 */
export type Opening = "envelope" | "doors" | "curtain" | "split" | "fold" | "float" | "bloom" | "veil" | "settle" | "glide";

export const openingOf = (t: Template): Opening =>
  t.opening ?? (t.motion === "envelope" ? "envelope" : t.motion === "sparkle" ? "veil" : t.motion === "scratch" ? "bloom" : "glide");

export type PrintArtId = "lifafa" | "gubbara" | "neelam" | "pehli" | "gulnaar" | "teddy" | "bhalu" | "saadgi" | "zaitoon" | "surkh"
  | "jashn" | "khilona" | "pari"; // the kids' 3D party designs (KidsArt.tsx): animated balloons, candles, confetti

export interface PrintSpec {
  art: PrintArtId;
  /** where the words sit, in % of the card: top and bottom edges, and the inset from each side */
  box: { top: number; bottom: number; x: number; topW?: number; bottomW?: number };
  // topW / bottomW: at least this much room (in % of the card's width) for artwork that grows with the width, such as
  // a teddy at the top or the couple at the bottom, so the words clear it on tall phones as well as on the card
  /** the big title (script), the small spaced capitals, and the body text */
  title: string;
  caps: string;
  body: string;
  /** the title's font: flowing script, or engraved serif capitals */
  titleFont?: "script" | "serif";
  /** a frame on the card for the customer's cover photo */
  photo?: "circle";
  /** the artwork is dark (light panels and lettering on the following screens) */
  dark?: boolean;
  /** colours of the petals that fall where a guest taps: the artwork's own flowers and balloons */
  petals: string[];
  /** how the date is set: a row with bars, a list, icons, columns, a round badge, a big stamp, or pill chips */
  date?: "bars" | "list" | "icons" | "columns" | "badge" | "stamp" | "chips";
  /** the small word under the title on a ribbon, or the title as a chunky outlined toy font */
  titleDeco?: "ribbon" | "outline";
  /** the names before the title ("Zain / Birthday Party") */
  namesFirst?: boolean;
  /** the colour the words sit on: the card's text colours are adjusted until they read against it (PrintText) */
  ground?: string;
  /** "kids": rounded, friendly type (Fredoka and Nunito) instead of the wedding script and engraved capitals */
  fonts?: "kids";
  /** the opening screen's words start this far down (% of the screen) instead of the middle: clear of a character's face */
  coverAt?: number;
  /** where the following screens' panels sit: top (default) or bottom, so they clear the character's face */
  panelsAt?: "top" | "bottom";
  /** the picture in a polaroid event card until the customer adds a photo (the kids' characters) */
  polaroid?: string;
  /** the shape of the panels on the following screens */
  panel?: "rounded" | "arch" | "frame" | "ticket" | "cloud" | "line" | "sticker" | "bubble";
  /** the countdown: plain cells, 3D balloons, flip-clock tiles, progress rings or postage stamps */
  countdown?: "cells" | "balloons" | "flip" | "rings" | "stamps";
  /** the "Dear guest" screen: a panel, a handwritten letter on lined paper, or a speech bubble */
  message?: "card" | "letter" | "bubble";
  /** each event: a panel, an admission ticket with a tear-off stub, or a polaroid */
  eventStyle?: "card" | "ticket" | "polaroid";
  /** birthdays: the design shows the age as a big number ("gold" foil or a "3d" toy number); `sampleAge` until the customer types one */
  number?: "gold" | "3d";
  sampleAge?: string;
  /** what bursts where a guest taps (each design its own): balloons, stars, hearts, confetti, bubbles, glitter, petals */
  tap: "petals" | "hearts" | "confetti" | "balloons" | "stars" | "bubbles" | "glitter";
}

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
  concept?: "tape" | "royal" | "ivory" | "editorial" | "aurora" | "monogram" | "embossed" | "garden" | "print";
  /** How guests move through the invitation: scroll (the default) or "stories" (full-screen pages, tap to go on) */
  mode?: "stories";
  /** How the "Tap to open" cover leaves (see globals.css .open-*). Unset: from `motion` (see openingOf). */
  opening?: Opening;
  /** "print": a printed-card design (illustrated artwork from PrintArt.tsx, the words laid out like the card) */
  print?: PrintSpec;
  /**
   * A flowing single page (FlowInvite.tsx): an envelope that opens, then one long illustrated page where each part
   * fades in as the guest scrolls. "hadiqa" = a rose garden arch with swans; "ambar" = ivory damask, a gold
   * Bismillah seal and a Moorish arch.
   */
  flow?: "hadiqa" | "ambar" | "firdaus"; // "firdaus" = a painted chateau courtyard, wine and ivory (Firdaus.tsx)
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
  // ---- Original designs, round 2 --------------------------------------------------------
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
    price: 4999,
    popular: true,
    theme: { bg: "#140C08", bg2: "#2A160C", ink: "#F6E7C8", accent: "#FF9A3C", muted: "#D9C29A", ornament: "bars", headingFont: "script" },
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
    price: 4999,
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
    price: 4999,
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
    price: 3499,
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
    price: 3499,
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
    price: 4499,
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
    price: 3499,
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
  // Printed-card designs: the most-saved Pinterest invitations of their kind (October 2026), redrawn as our own vector
  // artwork with the words laid out the same way. The owner is arranging licences from the original designers (see CREDITS.md).
  {
    id: "lifafa-birthday",
    opening: "envelope",
    motion: "rise",
    concept: "print",
    name: "Lifafa",
    category: "birthday",
    tagline: "A lace-edged card tucked into a maroon envelope, sealed with gold wax.",
    tags: ["birthday", "elegant", "adult", "maroon", "cream", "gold", "wax seal", "envelope", "lace"],
    price: 1499,
    // our own arrangement of the public-domain melody (see CREDITS.md)
    music: { src: "/audio/birthday-piano.m4a", title: "Happy Birthday (piano waltz)" },
    print: { art: "lifafa", ground: "#efe6d6", countdown: "stamps", message: "letter", eventStyle: "ticket", date: "list", panel: "frame", box: { top: 5, bottom: 30, x: 15 }, title: "#5B3A2E", caps: "#4A3A2E", body: "#5B4A3E", titleFont: "serif", petals: ["#8a2637", "#c9a24a", "#efe6d6"], tap: "glitter" },
    theme: { bg: "#5A1420", bg2: "#3E0C15", ink: "#4A3A2E", accent: "#B08A3E", muted: "#7A6656", ornament: "none", headingFont: "script" },
  },
  {
    id: "gubbara-birthday",
    opening: "bloom",
    motion: "sparkle",
    concept: "print",
    name: "Gubbara",
    category: "birthday",
    tagline: "Blush and gold balloons, butterflies and roses around a soft pink arch.",
    tags: ["birthday", "girl", "pink", "blush", "gold", "balloons", "butterflies", "floral", "arch"],
    price: 1499,
    // our own arrangement of the public-domain melody (see CREDITS.md)
    music: { src: "/audio/birthday-musicbox.m4a", title: "Happy Birthday (music box)" },
    print: { art: "gubbara", ground: "#f4d0d8", countdown: "balloons", message: "bubble", eventStyle: "card", date: "icons", titleDeco: "ribbon", panel: "arch", box: { top: 15, bottom: 13, x: 19 }, title: "#D2697E", caps: "#8A5A62", body: "#7A4A52", petals: ["#f2a7b8", "#e7c983", "#fbd6de"], tap: "balloons" },
    theme: { bg: "#FBE3E6", bg2: "#F7D3D9", ink: "#7A4A52", accent: "#D2697E", muted: "#9A6E75", ornament: "none", headingFont: "script" },
  },
  {
    id: "neelam-birthday",
    opening: "fold",
    motion: "rise",
    concept: "print",
    name: "Neelam",
    category: "birthday",
    tagline: "Navy watercolour roses and a fine gold frame on crisp white.",
    tags: ["birthday", "elegant", "adult", "navy", "blue", "white", "gold", "floral", "minimal"],
    price: 1499,
    // our own arrangement of the public-domain melody (see CREDITS.md)
    music: { src: "/audio/birthday-piano.m4a", title: "Happy Birthday (piano waltz)" },
    print: { art: "neelam", ground: "#ffffff", countdown: "rings", message: "letter", eventStyle: "card", date: "bars", panel: "frame", box: { top: 15, bottom: 15, x: 17 }, title: "#1B1B1B", caps: "#1F2A44", body: "#2C2C2C", petals: ["#24345a", "#3f5384", "#8fa2c9"], tap: "stars" },
    theme: { bg: "#FFFFFF", bg2: "#F4F6FA", ink: "#1F2A44", accent: "#2F4170", muted: "#5A6378", ornament: "none", headingFont: "script" },
  },
  {
    id: "pehli-birthday",
    opening: "bloom",
    motion: "sparkle",
    concept: "print",
    name: "Pehli Salgirah",
    category: "birthday",
    tagline: "A first-birthday card with your baby's photo, pink balloons, roses and a gold number.",
    tags: ["birthday", "first birthday", "1st", "baby", "girl", "pink", "gold", "balloons", "photo", "floral", "kids"],
    price: 1499,
    // our own arrangement of the public-domain melody (see CREDITS.md)
    music: { src: "/audio/birthday-musicbox.m4a", title: "Happy Birthday (music box)" },
    print: { art: "pehli", ground: "#f9e0d6", countdown: "balloons", message: "bubble", eventStyle: "polaroid", date: "columns", titleDeco: "ribbon", panel: "rounded", number: "gold", sampleAge: "1", box: { top: 6, bottom: 6, x: 9 }, title: "#D86F86", caps: "#A3707A", body: "#7A5A60", photo: "circle", petals: ["#f4a9ba", "#e9c97c", "#fde3e9"], tap: "confetti" },
    theme: { bg: "#FFF6EE", bg2: "#FDEBE4", ink: "#7A5A60", accent: "#D86F86", muted: "#A3707A", ornament: "none", headingFont: "script" },
  },
  {
    id: "gulnaar-aqiqah",
    opening: "veil",
    motion: "rise",
    concept: "print",
    name: "Gulnaar",
    category: "aqiqah",
    tagline: "Pink watercolour blossoms, a butterfly and a little pram around a fine arch, with Bismillah.",
    tags: ["aqiqah", "aqeeqah", "baby", "girl", "pink", "floral", "pram", "butterfly", "arch", "bismillah"],
    price: 1999,
    print: { art: "gulnaar", ground: "#f3d8e2", countdown: "rings", message: "letter", eventStyle: "polaroid", date: "badge", panel: "arch", box: { top: 15, bottom: 17, x: 17 }, title: "#B8607A", caps: "#8A5F6C", body: "#6E5560", petals: ["#e9a6bc", "#f8dbe5", "#c46f8d"], tap: "petals" },
    theme: { bg: "#FFFFFF", bg2: "#FBF1F4", ink: "#6E5560", accent: "#C77A92", muted: "#8A6F79", ornament: "none", headingFont: "script" },
  },
  {
    id: "dua-aqiqah",
    opening: "split",
    motion: "rise",
    concept: "print",
    name: "Dua",
    category: "aqiqah",
    tagline: "Bismillah in calligraphy on warm linen, with taupe balloons and teddy bears.",
    tags: ["aqiqah", "aqeeqah", "baby", "neutral", "beige", "taupe", "balloons", "teddy", "bismillah", "boy", "girl"],
    price: 1999,
    print: { art: "teddy", ground: "#e7e0d5", countdown: "cells", message: "bubble", eventStyle: "polaroid", date: "stamp", panel: "cloud", box: { top: 12, bottom: 17, x: 13 }, title: "#6B5444", caps: "#6B5A4C", body: "#5C4B3E", petals: ["#bfa68c", "#efe7dc", "#8f7360"], tap: "bubbles" },
    theme: { bg: "#E8E1D6", bg2: "#DED5C7", ink: "#5C4B3E", accent: "#9C8268", muted: "#7E6D5E", ornament: "none", headingFont: "script" },
  },
  {
    id: "bhalu-aqiqah",
    opening: "float",
    motion: "rise",
    concept: "print",
    name: "Bhalu",
    category: "aqiqah",
    tagline: "A teddy floats in on balloons above a soft taupe arch, with hot-air balloons either side.",
    tags: ["aqiqah", "aqeeqah", "baby", "boy", "neutral", "taupe", "teddy", "balloons", "hot air balloon", "arch"],
    price: 1999,
    print: { art: "bhalu", ground: "#d9c3b3", countdown: "balloons", message: "card", eventStyle: "ticket", date: "list", panel: "arch", box: { top: 24, bottom: 9, x: 18, topW: 54 }, title: "#5E4636", caps: "#5E4A3C", body: "#4E3E33", titleFont: "serif", petals: ["#c9ab8f", "#e9dccb", "#b59378"], tap: "balloons" },
    theme: { bg: "#F7F1EA", bg2: "#D9C3B3", ink: "#4E3E33", accent: "#8C6A55", muted: "#6E5A4C", ornament: "none", headingFont: "serif" },
  },
  {
    id: "saadgi-engagement",
    opening: "settle",
    motion: "rise",
    concept: "print",
    name: "Saadgi",
    category: "engagement",
    tagline: "White and sage florals on a clean white card, with Bismillah in calligraphy.",
    tags: ["engagement", "mangni", "minimal", "white", "sage", "green", "floral", "bismillah", "elegant"],
    price: 2499,
    print: { art: "saadgi", ground: "#f7f8f3", countdown: "cells", message: "letter", eventStyle: "card", date: "bars", panel: "line", box: { top: 12, bottom: 17, x: 14 }, title: "#4A4A4A", caps: "#5A5A5A", body: "#4A4A4A", petals: ["#ffffff", "#a9b89b", "#e4dccd"], tap: "petals" },
    theme: { bg: "#FFFFFF", bg2: "#F6F7F3", ink: "#4A4A4A", accent: "#7D8F74", muted: "#6E6E6E", ornament: "none", headingFont: "script" },
  },
  {
    id: "zaitoon-engagement",
    opening: "doors",
    motion: "rise",
    concept: "print",
    name: "Zaitoon",
    category: "engagement",
    tagline: "An olive-green arch with ivory lettering and white blossoms over the top.",
    tags: ["engagement", "mangni", "olive", "green", "ivory", "arch", "floral", "rings", "bismillah"],
    price: 2499,
    print: { art: "zaitoon", ground: "#7d7a50", countdown: "flip", message: "letter", eventStyle: "ticket", date: "badge", panel: "arch", box: { top: 12, bottom: 8, x: 15 }, title: "#F3EBD8", caps: "#EFE6D0", body: "#E9DFC8", dark: true, petals: ["#f6f1e6", "#a8ad86", "#d9c58e"], tap: "petals" },
    theme: { bg: "#5C5A2E", bg2: "#4A4824", ink: "#F3EBD8", accent: "#D9C58E", muted: "#D8CDB0", ornament: "none", headingFont: "script" },
  },
  {
    id: "surkh-nikkah",
    opening: "curtain",
    motion: "rise",
    concept: "print",
    name: "Surkh",
    category: "nikkah",
    tagline: "Deep red roses on blush satin, with the bride and groom in silhouette.",
    tags: ["nikkah", "red", "roses", "blush", "maroon", "couple", "bismillah", "romantic", "floral"],
    price: 2999,
    print: { art: "surkh", ground: "#f1dcd5", countdown: "stamps", message: "letter", eventStyle: "ticket", date: "columns", panel: "ticket", box: { top: 8, bottom: 20, x: 12, bottomW: 47 }, title: "#6E1622", caps: "#5A2A2E", body: "#4E2A2E", petals: ["#a3192c", "#d2404f", "#5e0b16"], tap: "hearts" },
    theme: { bg: "#F7E7E2", bg2: "#F0D9D2", ink: "#4E2A2E", accent: "#8E1B2A", muted: "#7A5257", ornament: "none", headingFont: "script" },
  },
  // Kids' party designs: soft 3D toy artwork in code (KidsArt.tsx) that moves: balloons bob, candle flames flicker,
  // confetti falls, fireworks pop. The age the customer types shows as a big 3D number.
  {
    id: "jashn-birthday",
    mode: "stories",
    opening: "curtain",
    motion: "sparkle",
    concept: "print",
    name: "Jashn",
    category: "birthday",
    tagline: "A night-time party: glowing balloons, fireworks, a two-tier cake with flickering candles and a big 3D age.",
    tags: ["birthday", "kids", "boy", "girl", "3d", "cartoon", "party", "night", "fireworks", "balloons", "cake", "candles", "animated", "fun"],
    price: 1499,
    music: { src: "/audio/birthday-celebration.m4a", title: "Happy Birthday (celebration)" },
    print: { art: "jashn", ground: "#2a1b4f", fonts: "kids", coverAt: 9, countdown: "flip", message: "bubble", eventStyle: "ticket", date: "chips", namesFirst: true, panel: "bubble", box: { top: 4, bottom: 38, x: 8, bottomW: 74 }, title: "#ffd36e", caps: "#efe6ff", body: "#e6dcff", dark: true, number: "3d", sampleAge: "5", petals: ["#ffd36e", "#5ec8ff", "#ff6fb0"], tap: "stars" },
    theme: { bg: "#170f33", bg2: "#2a1b4f", ink: "#f3ecff", accent: "#ffd36e", muted: "#c9bce6", ornament: "none", headingFont: "script" },
  },
  {
    id: "khilona-birthday",
    opening: "float",
    motion: "sparkle",
    concept: "print",
    name: "Khilona",
    category: "birthday",
    tagline: "A sunny, funky party: bunting, bouncing candy balloons, falling confetti and a cake on a grassy hill.",
    tags: ["birthday", "kids", "boy", "girl", "3d", "cartoon", "funky", "colourful", "bright", "balloons", "confetti", "bunting", "animated", "fun"],
    price: 1499,
    music: { src: "/audio/birthday-celebration.m4a", title: "Happy Birthday (celebration)" },
    print: { art: "khilona", ground: "#5fd0ea", fonts: "kids", coverAt: 15, panelsAt: "top", polaroid: "/art/kids/khilona-boy.webp", countdown: "balloons", message: "bubble", eventStyle: "polaroid", date: "chips", namesFirst: true, titleDeco: "outline", panel: "sticker", box: { top: 9, bottom: 37, x: 8, bottomW: 70 }, title: "#5b2bb5", caps: "#163a5c", body: "#1d3350", number: "3d", sampleAge: "5", petals: ["#ff4d8d", "#ffd23f", "#7b5cff", "#43d17a"], tap: "balloons" },
    theme: { bg: "#c9f3e6", bg2: "#eafaf6", ink: "#1d3350", accent: "#7b5cff", muted: "#46607a", ornament: "none", headingFont: "script" },
  },
  {
    id: "pari-birthday",
    opening: "bloom",
    motion: "sparkle",
    concept: "print",
    name: "Pari",
    category: "birthday",
    tagline: "Soft pink and glowing: floating hearts, twinkling lights and a pink cake with one bright candle.",
    tags: ["birthday", "kids", "girl", "princess", "3d", "cartoon", "pink", "hearts", "cake", "candle", "animated", "cute"],
    price: 1499,
    music: { src: "/audio/birthday-musicbox.m4a", title: "Happy Birthday (music box)" },
    print: { art: "pari", ground: "#ffc6d8", fonts: "kids", coverAt: 50, panelsAt: "bottom", polaroid: "/art/kids/pari-scene.webp", countdown: "rings", message: "bubble", eventStyle: "polaroid", date: "stamp", panel: "rounded", box: { top: 34, topW: 64, bottom: 4, x: 8 }, title: "#c2185b", caps: "#7a2e4a", body: "#5e2a3e", number: "3d", sampleAge: "3", petals: ["#ff7aa8", "#ffb3cd", "#f5d08a"], tap: "hearts" },
    theme: { bg: "#ffd6e3", bg2: "#fff3f7", ink: "#5e2a3e", accent: "#d63c78", muted: "#8a4f66", ornament: "none", headingFont: "script" },
  },
  // Flowing-page designs after Webgency's "The Sacred Garden" and "Blossom Oud", redrawn as our own vector artwork
  // (FlowArt.tsx); the owner holds the licence (see CREDITS.md). Their songs come from the owner later.
  {
    id: "hadiqa-wedding",
    signature: 9,
    motion: "rise",
    flow: "hadiqa",
    name: "Hadiqa",
    category: "wedding",
    tagline: "An embossed envelope with your initials in wax opens on a rose garden arch, swans on the lake below.",
    tags: ["wedding", "garden", "roses", "swans", "cream", "sage", "maroon", "wax seal", "envelope", "illustrated", "timeline", "elegant"],
    price: 3999,
    theme: { bg: "#FBF4E8", bg2: "#F3E8D6", ink: "#5B4A36", accent: "#A8834F", muted: "#7E6B55", ornament: "none", headingFont: "script" },
  },
  {
    id: "ambar-nikkah",
    signature: 10,
    motion: "rise",
    flow: "ambar",
    name: "Ambar",
    category: "nikkah",
    tagline: "Ivory damask sealed with a gold Bismillah, a Moorish arch, a palace gate and a crystal chandelier.",
    tags: ["nikkah", "ivory", "gold", "olive", "damask", "bismillah", "wax seal", "envelope", "arch", "chandelier", "timeline", "elegant", "minimal"],
    price: 3999,
    theme: { bg: "#F7EEDF", bg2: "#F1E2CB", ink: "#5A4630", accent: "#B48A4A", muted: "#80694F", ornament: "none", headingFont: "script" },
  },
  // after Webgency's template 5 (webgency.tilda.ws/template5), redrawn as our own art (FirdausArt.tsx); the owner holds the licence (see CREDITS.md)
  {
    id: "firdaus-wedding",
    signature: 11,
    motion: "rise",
    flow: "firdaus",
    name: "Firdaus",
    category: "wedding",
    tagline: "A gold flower seal opens on a painted chateau courtyard: a fountain, doves and roses, then wine and ivory pages.",
    tags: ["wedding", "burgundy", "wine", "maroon", "ivory", "roses", "fountain", "doves", "palace", "wax seal", "envelope", "timeline", "elegant"],
    price: 3999,
    theme: { bg: "#6A0E22", bg2: "#FBF7F2", ink: "#3D2A2A", accent: "#6A0E22", muted: "#7A5A5A", ornament: "none", headingFont: "script" },
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
  aqeeqah: "aqiqah", aqeeqa: "aqiqah", aqiqa: "aqiqah", akika: "aqiqah", aqeqah: "aqiqah",
};
/** Every template has these, so they shouldn't narrow the results. */
const EVERY_TEMPLATE = new Set(["urdu", "english", "bismillah", "rsvp", "invitation", "invitations", "invite", "card", "cards", "digital", "whatsapp", "template", "templates", "video", "design", "designs", "online"]);

export function searchTemplates(q: string, category: CategoryId | "all") {
  const words = q.trim().toLowerCase().split(/[\s,]+/).filter((w) => w && !EVERY_TEMPLATE.has(w)).map((w) => ALIASES[w] ?? w);
  return ORDERED.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    if (!words.length) return true;
    const cat = CATEGORIES.find((c) => c.id === t.category);
    const hay = [t.name, t.tagline, cat?.label, cat?.urdu, t.signature ? "signature" : "", t.music ? "music song" : "", t.concept && t.concept !== "print" ? "photo photos cinematic" : "", t.print?.photo ? "photo" : "", ...t.tags]
      .join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}
