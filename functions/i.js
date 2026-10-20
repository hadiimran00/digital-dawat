// Link previews for invitation links (/i?s=<slug>). WhatsApp, Facebook and iMessage read a page's og: tags without
// running its JavaScript, so on its own the static /i page would show the site's general preview. This Cloudflare Pages
// Function looks the published invitation up and rewrites the tags: the couple's names as the title, a personal line
// for guest links, and the invitation's own picture (src/lib/shareImage.ts), else its design's "You're invited" picture.
// The three values below are filled in by scripts/deploy.mjs (the same public values the site already uses).
const SUPABASE_URL = "__SUPABASE_URL__";
const SUPABASE_ANON_KEY = "__SUPABASE_ANON_KEY__";
const SITE_URL = "__SITE_URL__";

const fmtDate = (d) => {
  const x = new Date(`${d}T00:00:00Z`);
  return Number.isNaN(x.getTime()) ? "" : x.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

export async function onRequestGet({ request, next }) {
  const res = await next();
  const url = new URL(request.url);
  const slug = url.searchParams.get("s") || "";
  if (!/^[a-z0-9]{6,16}$/.test(slug) || !(res.headers.get("content-type") || "").includes("text/html")) return res;

  let row = null;
  try {
    // only published invitations are readable without signing in (row-level security), so drafts never leak here
    const r = await fetch(`${SUPABASE_URL}/rest/v1/invites?slug=eq.${slug}&status=eq.published&select=template_id,content`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (r.ok) row = (await r.json())[0] || null;
  } catch {
    row = null;
  }
  if (!row) return res;

  const c = row.content || {};
  const ur = c.language === "ur";
  const names = c.host2 ? `${c.host1} ${ur ? "اور" : "&"} ${c.host2}` : c.host1 || "";
  const events = (c.events || []).filter((e) => e && e.title);
  const occasion = events.length > 1 ? (ur ? "شادی" : "Wedding") : events[0]?.title || (ur ? "دعوت" : "Invitation");
  const first = events.map((e) => e.date).filter(Boolean).sort()[0];
  const guest = (url.searchParams.get("g") || "").slice(0, 60);
  const title = `${names} · ${occasion}`.slice(0, 120);
  const when = first ? fmtDate(first) : "";
  const description = (guest
    ? `Dear ${guest}, you're invited${when ? `, ${when}` : ""}. Tap to open your invitation.`
    : `You're invited${when ? `, ${when}` : ""}. Tap to open the invitation.`).slice(0, 200);
  const own = typeof c.shareImage === "string" && c.shareImage.startsWith(`${SUPABASE_URL}/storage/v1/object/public/`);
  const image = own ? c.shareImage : `${SITE_URL}/share/${row.template_id}.jpg`;
  const pageUrl = `${SITE_URL}/i?s=${slug}`;

  const set = (value) => ({ element(el) { el.setAttribute("content", value); } });
  return new HTMLRewriter()
    .on("title", { element(el) { el.setInnerContent(`${title} | Kabootar Post`); } })
    .on('meta[name="description"]', set(description))
    .on('meta[property="og:title"]', set(title))
    .on('meta[property="og:description"]', set(description))
    .on('meta[property="og:image"]', set(image))
    .on('meta[property="og:image:alt"]', set(`${title} invitation`))
    .on('meta[property="og:url"]', set(pageUrl))
    .on('meta[property="og:type"]', set("website"))
    .on('meta[name="twitter:title"]', set(title))
    .on('meta[name="twitter:description"]', set(description))
    .on('meta[name="twitter:image"]', set(image))
    .on('meta[name="twitter:image:alt"]', set(`${title} invitation`))
    .transform(res);
}
