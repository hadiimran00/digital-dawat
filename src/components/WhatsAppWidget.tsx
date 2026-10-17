"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { supportLink, supportWhatsapp } from "@/lib/config";

const TOPICS = [
  { label: "Help choosing a design", topic: "I need help choosing an invitation design" },
  { label: "A question about payment", topic: "I have a question about payment" },
  { label: "I'm paying from outside Pakistan", topic: "I'm outside Pakistan and want to pay for an invitation" },
  { label: "Something else", topic: "I have a question about Kabootar Post" },
];

/**
 * Floating "chat with us on WhatsApp" button for customers. Hidden on the guest-facing invitation (guests contact the
 * couple, not us) and the admin page, and lifted above the bottom action bars on phones.
 */
export function WhatsAppWidget() {
  const path = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); button.current?.focus(); } };
    const onDown = (e: PointerEvent) => {
      if (!panel.current?.contains(e.target as Node) && !button.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [open]);

  if (!supportWhatsapp || /^\/(i|admin)\/?$/.test(path)) return null;
  // a template page on a phone is the full-screen demo invitation: the button would sit on top of it (the page has its
  // own "Questions? WhatsApp us" link), so it only shows there from the desktop layout up
  const demo = /^\/templates\/[^/]+\/?$/.test(path);
  // pages with a fixed action bar at the bottom on phones: sit above it
  const lifted = demo || /^\/create\/?$/.test(path);
  const where = path === "/" ? "the home page" : `the page ${path}`;

  return (
    <div className={`fixed right-4 z-40 flex-col items-end gap-3 ${demo ? "hidden lg:flex" : "flex"} ${lifted ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-6" : "bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"}`}>
      {open && (
        <div ref={panel} role="dialog" aria-label="Chat with us on WhatsApp"
          className="modal-panel w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-card shadow-2xl">
          <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
            <WhatsAppIcon className="size-7 shrink-0" />
            <div>
            <p className="font-semibold">Questions? Chat with us</p>
            <p className="text-sm text-white/80">We reply on WhatsApp, usually the same day.</p>
            </div>
          </div>
          <ul className="divide-y divide-line">
            {TOPICS.map((t) => (
              <li key={t.label}>
                <a href={supportLink(`${t.topic} (from ${where})`)} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center justify-between gap-3 px-4 text-sm font-medium hover:bg-background">
                  {t.label}<ChevronRight className="size-4 shrink-0 text-foreground/50" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button ref={button} type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        aria-label={open ? "Close chat options" : "Chat with us on WhatsApp"}
        className="press grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg ring-1 ring-black/5 transition-transform duration-200 ease-out [@media(hover:hover)]:hover:scale-105">
        {open ? <X className="size-6" aria-hidden /> : <WhatsAppIcon className="size-8" />}
      </button>
    </div>
  );
}
