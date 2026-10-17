"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { CATEGORIES, TEMPLATES, formatPKR, searchTemplates, categoryLabel, type CategoryId } from "@/lib/templates";
import { HoverPreview } from "@/components/HoverPreview";
import { useCatalog } from "@/lib/catalog";

/** `titleAs` keeps the heading outline valid: h2 when the page has only an h1 above, h3 under a section h2. */
export function TemplateGallery({ limit, titleAs: Title = "h3" }: { limit?: number; titleAs?: "h2" | "h3" }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">("all");
  // designs switched off in the database (template_prices.visible = 'N') are left out
  const live = useCatalog();
  const all = TEMPLATES.filter(live.visible);
  const found = useMemo(() => searchTemplates(q, cat), [q, cat]);
  const results = found.filter(live.visible);
  const shown = limit ? results.slice(0, limit) : results;

  // the full gallery keeps its search and filter in the link (?c=nikkah&q=gold), so it can be shared and Back works
  useEffect(() => {
    if (limit) return;
    const u = new URLSearchParams(window.location.search);
    const c = u.get("c");
    /* eslint-disable react-hooks/set-state-in-effect -- read the link once after mount (static export) */
    if (c && CATEGORIES.some((x) => x.id === c)) setCat(c as CategoryId);
    if (u.get("q")) setQ(u.get("q")!.slice(0, 60));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [limit]);
  useEffect(() => {
    if (limit) return;
    const u = new URLSearchParams();
    if (cat !== "all") u.set("c", cat);
    if (q.trim()) u.set("q", q.trim());
    const next = `${window.location.pathname}${u.size ? `?${u}` : ""}`;
    if (next !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, "", next);
  }, [q, cat, limit]);
  const clear = () => { setQ(""); setCat("all"); };

  return (
    <div>
      {!limit && (
        <div className="mb-8 space-y-4">
          <label className="relative block max-w-md">
            <span className="sr-only">Search templates</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-foreground/70" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search: gold, nikkah, floral…"
              className="field pl-10"
            />
          </label>
          {/* phones: one row you swipe sideways, so the designs start near the top */}
          <div role="group" aria-label="Filter by category" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
            {/* only occasions that have designs: an empty filter would be a dead end */}
            {[{ id: "all" as const, label: "All" }, ...CATEGORIES.filter((x) => all.some((t) => t.category === x.id))].map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
                className={`press min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium ${
                  cat === c.id ? "border-brand bg-brand text-brand-ink" : "border-line bg-card hover:border-gold"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!limit && (
        <p aria-live="polite" className="mb-4 text-sm text-foreground/70">
          {shown.length === all.length ? `${shown.length} designs` : `${shown.length} of ${all.length} designs`}
          {(q || cat !== "all") && shown.length > 0 && <button type="button" onClick={clear} className="ml-3 min-h-11 font-semibold text-brand underline underline-offset-4">Show all</button>}
        </p>
      )}
      {shown.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-8 text-center">
          <p className="font-semibold">No designs match{q ? ` “${q}”` : ""}{cat !== "all" ? ` in ${CATEGORIES.find((c) => c.id === cat)?.label}` : ""}.</p>
          <p className="mt-1 text-sm text-foreground/70">Try an event or a colour:</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["Nikkah", "Birthday", "Gold", "Floral", "Envelope"].map((w) => (
              <button key={w} type="button" onClick={() => { setCat("all"); setQ(w); }} className="press min-h-11 rounded-full border border-line px-4 text-sm font-medium hover:border-gold">{w}</button>
            ))}
            <button type="button" onClick={clear} className="btn btn-primary">Show all designs</button>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((t) => (
            <li key={t.id} className="[contain-intrinsic-size:auto_480px] [content-visibility:auto]">
              <div className="overflow-hidden rounded-2xl border border-line shadow-sm transition-[box-shadow,translate] duration-200 ease-out [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:shadow-lg">
                <HoverPreview template={t}>
                  <Link href={`/templates/${t.id}`} tabIndex={-1} aria-hidden="true" className="block">
                    {/* Pre-rendered thumbnail (npm run previews). A plain img because the site is a static export. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/thumbs/${t.id}.webp`} width={360} height={640} loading="lazy" decoding="async" alt="" className="block h-auto w-full" style={{ background: t.theme.bg }} />
                  </Link>
                  {t.signature && (
                    <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#3a0c12] shadow" style={{ backgroundImage: "linear-gradient(180deg,#fff1c9,#e8c06a 55%,#b98a35)" }}>
                      Signature
                    </span>
                  )}
                </HoverPreview>
              </div>
              <Link href={`/templates/${t.id}`} className="block">
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div>
                    <Title className="font-semibold">{t.name}</Title>
                    <p className="text-sm text-foreground/70">{categoryLabel(t.category)}</p>
                  </div>
                  <p className="whitespace-nowrap text-sm font-semibold text-brand">{formatPKR(live.price(t))}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {limit && all.length > limit && (
        <div className="mt-8 text-center">
          <Link href="/templates" className="btn btn-ghost">Browse all {all.length} templates</Link>
        </div>
      )}
    </div>
  );
}
