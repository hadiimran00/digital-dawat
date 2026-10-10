"use client";

import { useId, useState } from "react";
import { Phone } from "lucide-react";
import type { InviteContent } from "@/lib/content";

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;

/** The two families as tabs (or a single block), each with the people guests can call. */
export function Families({ content, ur, glass }: { content: InviteContent; ur: boolean; glass: boolean }) {
  const id = useId();
  const [active, setActive] = useState(0);
  const sides = [
    { label: content.side1Label || (ur ? "پہلا گھرانہ" : "Family"), family: content.family1, members: content.members1 },
    { label: content.side2Label || (ur ? "دوسرا گھرانہ" : "Family"), family: content.family2, members: content.members2 },
  ].filter((s) => s.family || s.members.length > 0);
  if (sides.length === 0) return null;
  const cur = sides[Math.min(active, sides.length - 1)];
  const panel = glass ? "border-white/15 bg-black/45 text-white backdrop-blur-md" : "border-line bg-card";

  const onKey = (e: React.KeyboardEvent) => {
    if (sides.length < 2) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = (active + (e.key === "ArrowRight" ? 1 : -1) + sides.length) % sides.length;
      setActive(next);
      document.getElementById(`${id}-tab-${next}`)?.focus();
    }
  };

  return (
    <section aria-label={ur ? "خاندان" : "Families"} className={`rounded-2xl border ${panel}`}>
      {sides.length > 1 && (
        <div role="tablist" aria-label={ur ? "خاندان" : "Families"} className="grid grid-cols-2 border-b border-inherit" onKeyDown={onKey}>
          {sides.map((s, i) => (
            <button
              key={i}
              id={`${id}-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={active === i}
              aria-controls={`${id}-panel`}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              className={`press min-h-11 px-3 text-sm font-semibold first:rounded-tl-2xl last:rounded-tr-2xl ${glass ? "font-mono uppercase tracking-wider" : ""} ${
                active === i ? (glass ? "bg-white/15" : "bg-brand text-brand-ink") : "opacity-75"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${Math.min(active, sides.length - 1)}`} className="p-5 text-center">
        {cur.family && <p className="font-display text-xl font-bold">{cur.family}</p>}
        {cur.members.length > 0 && (
          <ul className="mt-3 space-y-2 text-sm">
            {cur.members.map((m, i) => (
              <li key={i} className="flex items-center justify-between gap-3 text-start">
                <span>
                  <span className="font-medium">{m.name}</span>
                  {m.phone && <span className="block text-xs opacity-80">{m.phone}</span>}
                </span>
                {m.phone && (
                  <a className="btn btn-ghost min-h-11 shrink-0 text-sm" href={tel(m.phone)} aria-label={`${ur ? "کال کریں" : "Call"} ${m.name}`}>
                    <Phone className="size-4" aria-hidden />{ur ? "کال" : "Call"}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
