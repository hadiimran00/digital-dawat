"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { CATEGORIES, TEMPLATES, formatPKR, searchTemplates, categoryLabel, type CategoryId } from "@/lib/templates";
import { HoverPreview } from "@/components/HoverPreview";

/** `titleAs` keeps the heading outline valid: h2 when the page has only an h1 above, h3 under a section h2. */
export function TemplateGallery({ limit, titleAs: Title = "h3" }: { limit?: number; titleAs?: "h2" | "h3" }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const results = useMemo(() => searchTemplates(q, cat), [q, cat]);
  const shown = limit ? results.slice(0, limit) : results;

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
              placeholder="Search: emerald, mehndi, minimal…"
              className="field pl-10"
            />
          </label>
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
            {[{ id: "all" as const, label: "All" }, ...CATEGORIES].map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
                className={`press min-h-11 rounded-full border px-4 text-sm font-medium ${
                  cat === c.id ? "border-brand bg-brand text-brand-ink" : "border-line bg-card hover:border-gold"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {shown.length === 0 ? (
        <p className="rounded-xl border border-line bg-card p-8 text-center text-foreground/70">
          No templates match “{q}”. Try a colour or an event name.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((t) => (
            <li key={t.id} className="[contain-intrinsic-size:auto_480px] [content-visibility:auto]">
              <div className="overflow-hidden rounded-2xl border border-line shadow-sm transition-shadow duration-200 ease-out hover:shadow-lg">
                <HoverPreview template={t}>
                  <Link href={`/templates/${t.id}`} tabIndex={-1} aria-hidden="true" className="block">
                    {/* Pre-rendered thumbnail (npm run previews). A plain img because the site is a static export. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/thumbs/${t.id}.webp`} width={360} height={640} loading="lazy" decoding="async" alt="" className="block h-auto w-full" style={{ background: t.theme.bg }} />
                  </Link>
                </HoverPreview>
              </div>
              <Link href={`/templates/${t.id}`} className="block">
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div>
                    <Title className="font-semibold">{t.name}</Title>
                    <p className="text-sm text-foreground/70">{categoryLabel(t.category)}</p>
                  </div>
                  <p className="whitespace-nowrap text-sm font-semibold text-brand">{formatPKR(t.price)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {limit && TEMPLATES.length > limit && (
        <div className="mt-8 text-center">
          <Link href="/templates" className="btn btn-ghost">Browse all {TEMPLATES.length} templates</Link>
        </div>
      )}
    </div>
  );
}
