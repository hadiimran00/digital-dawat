"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Plus, Trash2, Undo2, X } from "lucide-react";
import {
  defaultContent, newEvent, randomSlug, type InviteContent, type InviteEvent,
} from "@/lib/content";
import { ContentSchema, MAX_EVENTS, MAX_FAQ, MAX_MEMBERS, MAX_TIMELINE } from "@/lib/contentSchema";
import { TEMPLATES, formatPKR, getTemplate } from "@/lib/templates";
import { backendConfigured } from "@/lib/config";
import { InviteExperience } from "@/components/invite/InviteExperience";
import { VideoExport } from "@/components/VideoExport";
import { PhoneFrame } from "@/components/PhoneFrame";
import { PhotoField } from "@/components/PhotoField";
import { MusicField } from "@/components/MusicField";
import { PreviewWatermark } from "@/components/PreviewWatermark";
import { uploadShareImage } from "@/lib/shareImage";
import { SupportLink } from "@/components/SupportLink";
import { CUSTOM_DESIGN_PRICE } from "@/components/DoneForYou";
import { Unavailable } from "@/components/TemplateLive";
import { useCatalog, useSetting } from "@/lib/catalog";
import { supportWhatsapp } from "@/lib/config";

const draftKey = (id: string) => `dawat:draft:v2:${id}`;
const PHONE_W = 393;

/**
 * The real invitation, already open, scaled into whatever box it's given. `focus` scrolls it to the section being
 * edited, so a change made far down the form is visible straight away.
 */
function LivePreview({ template, content, focus, className }: { template: NonNullable<ReturnType<typeof getTemplate>>; content: InviteContent; focus?: string; className: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / PHONE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    // a visual mirror of the form (which is the accessible version); the full preview dialog is the interactive one
    <div ref={box} aria-hidden inert className={`relative overflow-hidden ${className}`} style={{ background: template.theme.bg }}>
      {scale > 0 && (
        <div className="origin-top-left" style={{ width: PHONE_W, height: `${100 / scale}%`, transform: `scale(${scale})` }}>
          <InviteExperience template={template} content={content} demo startOpen focus={focus} />
          <PreviewWatermark />
        </div>
      )}
    </div>
  );
}

export function Editor() {
  const router = useRouter();
  const id = useSearchParams().get("t") ?? "";
  const template = getTemplate(id);
  /** prices and which designs are switched on, from the database */
  const live = useCatalog();
  const customPrice = Number(useSetting("custom_design_price", String(CUSTOM_DESIGN_PRICE))) || 0;
  const [content, setContent] = useState<InviteContent | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [previewing, setPreviewing] = useState(false);
  /** the last removed item, so a mis-tap on Remove can be undone */
  const [removed, setRemoved] = useState<{ label: string; restore: () => void } | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  /** which part of the invitation the customer is editing, so the preview can show it */
  const [focus, setFocus] = useState("cover");

  // full preview: Escape closes it, focus starts on Close, and the page behind doesn't scroll
  useEffect(() => {
    if (!previewing) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPreviewing(false); };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = overflow; };
  }, [previewing]);

  useEffect(() => {
    if (!removed) return;
    const id = setTimeout(() => setRemoved(null), 7000);
    return () => clearTimeout(id);
  }, [removed]);

  useEffect(() => {
    if (!template) return;
    let saved: InviteContent | null = null;
    try {
      const raw = localStorage.getItem(draftKey(template.id));
      const parsed = raw ? ContentSchema.safeParse(JSON.parse(raw)) : null;
      saved = parsed?.success ? parsed.data : null;
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore the saved draft after hydration
    setContent(saved ?? defaultContent(template.category));
  }, [template]);

  useEffect(() => {
    if (!template || !content) return;
    try {
      localStorage.setItem(draftKey(template.id), JSON.stringify(content));
    } catch {}
  }, [template, content]);

  if (!template) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p>Choose a template to start.</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {TEMPLATES.filter(live.visible).map((t) => (
            <li key={t.id}><a className="btn btn-ghost" href={`/create?t=${t.id}`}>{t.name}</a></li>
          ))}
        </ul>
      </div>
    );
  }
  if (!live.visible(template)) {
    return <div className="mx-auto max-w-xl px-4 py-16"><Unavailable template={template}>{null}</Unavailable></div>;
  }
  if (!content) return <p className="p-8 text-center">Loading…</p>;

  const set = (patch: Partial<InviteContent>) => setContent({ ...content, ...patch });
  const setEvent = (i: number, patch: Partial<InviteEvent>) =>
    set({ events: content.events.map((e, j) => (j === i ? { ...e, ...patch } : e)) });
  const setFaq = (i: number, patch: Partial<{ q: string; a: string }>) =>
    set({ faq: content.faq.map((f, j) => (j === i ? { ...f, ...patch } : f)) });

  /** Swap the wording to the other language, but only for text the customer hasn't edited. */
  function switchLanguage(l: "en" | "ur") {
    if (!content || !template || l === content.language) return;
    const from = defaultContent(template.category, content.language);
    const to = defaultContent(template.category, l);
    const keep = <T,>(cur: T, a: T, b: T) => (JSON.stringify(cur) === JSON.stringify(a) ? b : cur);
    setContent({
      ...content,
      language: l,
      headline: keep(content.headline, from.headline, to.headline),
      message: keep(content.message, from.message, to.message),
      closing: keep(content.closing, from.closing, to.closing),
      family1: keep(content.family1, from.family1, to.family1),
      family2: keep(content.family2, from.family2, to.family2),
      side1Label: keep(content.side1Label, from.side1Label, to.side1Label),
      side2Label: keep(content.side2Label, from.side2Label, to.side2Label),
      members1: keep(content.members1, from.members1, to.members1),
      members2: keep(content.members2, from.members2, to.members2),
      faq: keep(content.faq, from.faq, to.faq),
      events: content.events.map((e, i) => {
        const a = from.events[i];
        const b = to.events[i];
        return a && b ? { ...e, title: keep(e.title, a.title, b.title), dressCode: keep(e.dressCode, a.dressCode, b.dressCode) } : e;
      }),
    });
  }

  async function order() {
    if (!content || !template) return;
    const parsed = ContentSchema.safeParse(content);
    if (!parsed.success) {
      const e: Record<string, string> = {};
      for (const i of parsed.error.issues) e[i.path.join(".")] = i.message;
      setErrors(e);
      const n = Object.keys(e).length;
      setMsg(`${n === 1 ? "One field needs" : `${n} fields need`} fixing. We've taken you to the first one.`);
      // take the customer to the first problem instead of leaving them at the bottom of a long form
      setTimeout(() => {
        const first = document.querySelector("#editor-form [role=alert]");
        first?.scrollIntoView({ block: "center", behavior: "smooth" });
        first?.parentElement?.querySelector<HTMLElement>("input:not([type=file]),textarea")?.focus({ preventScroll: true });
      }, 50);
      return;
    }
    setErrors({});
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    if (!sb) {
      setMsg("Ordering is not available yet: the site's backend has not been connected.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const { data: sess } = await sb.auth.getSession();
      const user = sess.session?.user;
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(`/create?t=${template.id}`)}`);
        return;
      }
      // the picture WhatsApp shows for their invitation link: their names and date over their design
      const shareImage = await uploadShareImage(template, parsed.data);
      const { data: inv, error: e1 } = await sb
        .from("invites")
        .insert({ owner_id: user.id, slug: randomSlug(), template_id: template.id, content: { ...parsed.data, shareImage } })
        .select("id")
        .single();
      if (e1) throw e1;
      const { data: ord, error: e2 } = await sb
        .from("orders")
        .insert({ owner_id: user.id, invite_id: inv.id, amount_pkr: live.price(template) })
        .select("id")
        .single();
      if (e2) throw e2;
      router.push(`/order?id=${ord.id}`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const here = `/create?t=${template.id}`;
  // designs whose background is the design itself: no cover photo or event photos
  const photoless = template.concept === "aurora" || template.concept === "monogram" || template.concept === "embossed" || template.concept === "garden"
    || (template.concept === "print" && !template.print?.photo) || !!template.flow;
  const forOne = template.category === "birthday" || template.category === "aqiqah" || template.category === "baby-shower";
  const hasTimeline = template.concept === "embossed" || template.concept === "royal" || template.concept === "ivory" || !!template.flow;
  /** remove an item from a list, keeping a one-tap undo */
  type ListKey = "events" | "faq" | "members1" | "members2" | "timeline";
  const removeWithUndo = (label: string, key: ListKey, i: number) => {
    const item = content[key][i];
    const splice = (c: InviteContent, insert: boolean) => {
      const list = [...c[key]] as unknown[];
      if (insert) list.splice(i, 0, item); else list.splice(i, 1);
      return { ...c, [key]: list } as InviteContent;
    };
    setContent((c) => c && splice(c, false));
    // undo puts back just this item, keeping any edits made since
    setRemoved({ label, restore: () => setContent((c) => c && splice(c, true)) });
  };
  const err = (k: string) => (errors[k] ? <p role="alert" className="mt-1 text-sm text-red-700">{errors[k]}</p> : null);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 pb-28 lg:grid-cols-[1fr_340px] lg:pb-8">
      <form id="editor-form" onSubmit={(e) => { e.preventDefault(); order(); }} className="order-2 space-y-6 lg:order-1" noValidate
        onFocus={(e) => { const s = (e.target as HTMLElement).closest<HTMLElement>("[data-preview]")?.dataset.preview; if (s) setFocus(s); }}>
        <div>
          <h1 className="font-display text-4xl font-bold text-brand">Customise {template.name}</h1>
          <p className="text-sm text-foreground/70">Your changes save automatically on this device.</p>
          {supportWhatsapp && customPrice > 0 && (
            <p className="mt-1 text-sm text-foreground/70">
              Want a design of your own choice? We&apos;ll design your card for {formatPKR(customPrice)} in total.{" "}
              <SupportLink topic={`I'd like an invitation card designed to my own choice (${formatPKR(customPrice)}). I was looking at the ${template.name} design`} className="text-brand">WhatsApp us</SupportLink>
            </p>
          )}
        </div>

        <fieldset data-preview="cover" className="grid gap-4 sm:grid-cols-2">
          <legend className="sr-only">Names and message</legend>
          <div className="flex gap-2 sm:col-span-2" role="group" aria-label="Card language">
            {(["en", "ur"] as const).map((l) => (
              <button key={l} type="button" aria-pressed={content.language === l} onClick={() => switchLanguage(l)}
                className={`btn ${content.language === l ? "btn-primary" : "btn-ghost"}`}>
                {l === "en" ? "English" : "اردو"}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 sm:col-span-2">
            <input type="checkbox" className="size-5" checked={content.bismillah} onChange={(e) => set({ bismillah: e.target.checked })} />
            Begin with Bismillah (بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ)
          </label>
          <label>First name / host
            <input className="field" value={content.host1} maxLength={40} onChange={(e) => set({ host1: e.target.value })} />
            {err("host1")}
          </label>
          <label>Second name (optional)
            <input className="field" value={content.host2} maxLength={40} onChange={(e) => set({ host2: e.target.value })} />
          </label>
          <label className="sm:col-span-2">Line above the names
            <input className="field" value={content.headline} maxLength={80} onChange={(e) => set({ headline: e.target.value })} />
          </label>
          <label className="sm:col-span-2">Message
            <textarea className="field" rows={3} maxLength={400} value={content.message} onChange={(e) => set({ message: e.target.value })} />
          </label>
          <label>Family 1 (optional)
            <input className="field" value={content.family1} maxLength={120} placeholder="Mr. & Mrs. … and family" onChange={(e) => set({ family1: e.target.value })} />
          </label>
          <label>Family 2 (optional)
            <input className="field" value={content.family2} maxLength={120} onChange={(e) => set({ family2: e.target.value })} />
          </label>
          {template.category === "birthday" && (
            <label>Age they are turning (optional)
              <input className="field" inputMode="numeric" value={content.age ?? ""} maxLength={3} placeholder="5"
                onChange={(e) => set({ age: e.target.value.replace(/\D/g, "").slice(0, 3) })} />
              <span className="mt-1 block text-sm text-foreground/70">Shown as a big number on the designs that have one.</span>
              {err("age")}
            </label>
          )}
        </fieldset>

        <section className="space-y-4" aria-label="Photos">
          <h2 className="font-display text-2xl font-bold">Photos <span className="text-base font-normal text-foreground/70">(optional)</span></h2>
          <p className="text-sm text-foreground/70">
            Photos are resized on your phone before upload. Anyone with the invitation link can see them. You need to sign in to upload.
          </p>
          <div className="space-y-4 rounded-2xl border border-line bg-card p-4">
            {/* Roshni (light) and Mohr (monogram) are designed without a cover photo */}
            {!photoless && <div data-preview="cover"><PhotoField label="Cover photo" next={here}
              hint={template.concept === "editorial" ? "Shown at the top of the opening page." : template.concept === "print" ? "Shown in the round frame on the card." : template.concept ? "Shown behind the whole invitation." : "Shown at the top of the card."}
              value={content.coverPhoto} fallback={template.backdrop?.src ?? template.art?.src} onChange={(url) => set({ coverPhoto: url })} /></div>}
            {err("coverPhoto")}
            <div data-preview="couple"><PhotoField label={forOne ? "Portrait photo" : "Couple photo"} next={here}
              hint={forOne ? "A portrait of the birthday star or your little one, shown on its own screen." : "A portrait of the two of you (or the host)."}
              value={content.couplePhoto} fallback={template.sample?.couple} onChange={(url) => set({ couplePhoto: url })} /></div>
            {err("couplePhoto")}
          </div>
        </section>

        <section className="space-y-4" aria-label="Music">
          <h2 className="font-display text-2xl font-bold">Music <span className="text-base font-normal text-foreground/70">(optional)</span></h2>
          <p className="text-sm text-foreground/70">
            {template.music ? "This design comes with its own song. Keep it, upload your own, or turn the music off." : "Add a song that plays when guests open the invitation, or keep it quiet."}
          </p>
          <div className="rounded-2xl border border-line bg-card p-4">
            <MusicField template={template} value={content.music ?? ""} next={here} onChange={(v) => set({ music: v })} />
            {err("music")}
          </div>
        </section>

        <section data-preview="families" className="space-y-4" aria-label="Family contacts">
          <h2 className="font-display text-2xl font-bold">Family contacts <span className="text-base font-normal text-foreground/70">(optional)</span></h2>
          <p className="text-sm text-foreground/70">Guests see each side on its own tab, with a Call button next to anyone who has a phone number.</p>
          {([1, 2] as const).map((side) => {
            const key = side === 1 ? "members1" : "members2";
            const labelKey = side === 1 ? "side1Label" : "side2Label";
            const list = content[key];
            const setList = (next: typeof list) => set({ [key]: next } as Partial<InviteContent>);
            return (
              <fieldset key={side} className="space-y-3 rounded-2xl border border-line bg-card p-4">
                <legend className="px-1 text-sm font-semibold">Side {side}</legend>
                <label className="block">Tab name
                  <input className="field" value={content[labelKey]} maxLength={30} placeholder={side === 1 ? "Groom's side" : "Bride's side"} onChange={(e) => set({ [labelKey]: e.target.value } as Partial<InviteContent>)} />
                </label>
                {list.map((m, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto] items-end gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <label className="block text-sm">Name
                      <input className="field" value={m.name} maxLength={60} onChange={(e) => setList(list.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                      {err(`${key}.${i}.name`)}
                    </label>
                    <label className="col-start-1 block text-sm sm:col-start-auto">Phone (optional)
                      <input className="field" inputMode="tel" value={m.phone} maxLength={20} placeholder="+92 300 0000000" onChange={(e) => setList(list.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)))} />
                      {err(`${key}.${i}.phone`)}
                    </label>
                    <button type="button" className="press col-start-2 row-start-1 grid size-11 place-items-center rounded-full text-red-700 sm:col-start-auto sm:row-start-auto" aria-label={`Remove ${m.name || "person"}`} onClick={() => removeWithUndo(m.name || "person", key, i)}>
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-ghost" disabled={list.length >= MAX_MEMBERS} onClick={() => setList([...list, { name: "", phone: "" }])}>
                  <Plus className="size-4" aria-hidden /> Add person
                </button>
              </fieldset>
            );
          })}
        </section>

        <section className="space-y-4" aria-label="Events">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Events <span className="text-base font-normal text-foreground/70">({content.events.length}/{MAX_EVENTS})</span></h2>
            <button type="button" className="btn btn-ghost" disabled={content.events.length >= MAX_EVENTS} onClick={() => set({ events: [...content.events, newEvent(content.language)] })}>
              <Plus className="size-4" aria-hidden /> Add event
            </button>
          </div>
          {err("events")}
          {content.events.map((ev, i) => (
            <fieldset key={i} data-preview={`event-${i}`} className="grid gap-4 rounded-2xl border border-line bg-card p-4 sm:grid-cols-2">
              <legend className="flex w-full items-center justify-between px-1 text-sm font-semibold">
                <span>Event {i + 1}</span>
                {content.events.length > 1 && (
                  <button type="button" className="inline-flex min-h-11 items-center gap-1 text-red-700" onClick={() => removeWithUndo(ev.title || `Event ${i + 1}`, "events", i)}>
                    <Trash2 className="size-4" aria-hidden /> Remove
                  </button>
                )}
              </legend>
              <label className="sm:col-span-2">Title
                <input className="field" value={ev.title} maxLength={60} onChange={(e) => setEvent(i, { title: e.target.value })} />
                {err(`events.${i}.title`)}
              </label>
              <label>Date
                <input type="date" className="field" value={ev.date} onChange={(e) => setEvent(i, { date: e.target.value })} />
                {err(`events.${i}.date`)}
              </label>
              <label>Time
                <input type="time" className="field" value={ev.time} onChange={(e) => setEvent(i, { time: e.target.value })} />
              </label>
              <label>Venue
                <input className="field" value={ev.venue} maxLength={120} onChange={(e) => setEvent(i, { venue: e.target.value })} />
              </label>
              <label>Address
                <input className="field" value={ev.address} maxLength={200} onChange={(e) => setEvent(i, { address: e.target.value })} />
              </label>
              <label>Dress code (optional)
                <input className="field" value={ev.dressCode} maxLength={80} onChange={(e) => setEvent(i, { dressCode: e.target.value })} />
              </label>
              <label>Google Maps link (optional)
                <input className="field" inputMode="url" value={ev.mapUrl} onChange={(e) => setEvent(i, { mapUrl: e.target.value })} placeholder="https://maps.app.goo.gl/…" />
                {err(`events.${i}.mapUrl`)}
              </label>
              {template.concept && template.concept !== "print" && !photoless && (
                <div className="sm:col-span-2">
                  <PhotoField label="Event photo (optional)" next={here} hint={template.concept === "editorial" ? "Shown above this event, like a magazine photo." : "Shown behind this event's screen."}
                    value={ev.photo} onChange={(url) => setEvent(i, { photo: url })} />
                  {err(`events.${i}.photo`)}
                </div>
              )}
            </fieldset>
          ))}
        </section>

        {hasTimeline && (
          <section data-preview="timeline" className="space-y-4" aria-label="Day timeline">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Day timeline <span className="text-base font-normal text-foreground/70">(optional)</span></h2>
              <button type="button" className="btn btn-ghost" disabled={content.timeline.length >= MAX_TIMELINE} onClick={() => set({ timeline: [...content.timeline, { time: "", title: "", note: "" }] })}>
                <Plus className="size-4" aria-hidden /> Add a moment
              </button>
            </div>
            <p className="text-sm text-foreground/70">What happens when on the day, for example 19:00 Nikkah, 20:30 Dinner, 22:00 Rukhsati.</p>
            {content.timeline.map((it, i) => (
              <fieldset key={i} className="grid grid-cols-[6.5rem_1fr] gap-3 rounded-2xl border border-line bg-card p-4">
                <legend className="flex w-full items-center justify-between px-1 text-sm font-semibold">
                  <span>Moment {i + 1}</span>
                  <button type="button" className="inline-flex min-h-11 items-center gap-1 text-red-700" onClick={() => removeWithUndo(it.title || `Moment ${i + 1}`, "timeline", i)}>
                    <Trash2 className="size-4" aria-hidden /> Remove
                  </button>
                </legend>
                <label className="block">Time
                  <input type="time" className="field" value={it.time} onChange={(e) => set({ timeline: content.timeline.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)) })} />
                </label>
                <label className="block">What happens
                  <input className="field" value={it.title} maxLength={40} onChange={(e) => set({ timeline: content.timeline.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
                  {err(`timeline.${i}.title`)}
                </label>
                <label className="col-span-2 block">Note (optional)
                  <input className="field" value={it.note} maxLength={120} onChange={(e) => set({ timeline: content.timeline.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)) })} />
                </label>
              </fieldset>
            ))}
          </section>
        )}

        <section data-preview="faq" className="space-y-4" aria-label="Questions">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Good to know <span className="text-base font-normal text-foreground/70">(optional)</span></h2>
            <button type="button" className="btn btn-ghost" disabled={content.faq.length >= MAX_FAQ} onClick={() => set({ faq: [...content.faq, { q: "", a: "" }] })}>
              <Plus className="size-4" aria-hidden /> Add question
            </button>
          </div>
          {content.faq.map((f, i) => (
            <fieldset key={i} className="space-y-3 rounded-2xl border border-line bg-card p-4">
              <legend className="flex w-full items-center justify-between px-1 text-sm font-semibold">
                <span>Question {i + 1}</span>
                <button type="button" className="inline-flex min-h-11 items-center gap-1 text-red-700" onClick={() => removeWithUndo(f.q || `Question ${i + 1}`, "faq", i)}>
                  <Trash2 className="size-4" aria-hidden /> Remove
                </button>
              </legend>
              <label className="block">Question
                <input className="field" value={f.q} maxLength={120} onChange={(e) => setFaq(i, { q: e.target.value })} />
                {err(`faq.${i}.q`)}
              </label>
              <label className="block">Answer
                <textarea className="field" rows={2} value={f.a} maxLength={400} onChange={(e) => setFaq(i, { a: e.target.value })} />
                {err(`faq.${i}.a`)}
              </label>
            </fieldset>
          ))}
        </section>

        <fieldset data-preview="closing" className="grid gap-4 sm:grid-cols-2">
          <legend className="sr-only">Closing and contact</legend>
          <label className="sm:col-span-2">Closing line
            <input className="field" value={content.closing} maxLength={120} onChange={(e) => set({ closing: e.target.value })} />
          </label>
          <label>WhatsApp number for guests (optional)
            <input className="field" inputMode="tel" value={content.contactPhone} maxLength={20} onChange={(e) => set({ contactPhone: e.target.value })} placeholder="923001234567" />
          </label>
          <label data-preview="rsvp" className="flex items-center gap-3 self-end">
            <input type="checkbox" className="size-5" checked={content.rsvpEnabled} onChange={(e) => set({ rsvpEnabled: e.target.checked })} />
            Collect RSVPs
          </label>
        </fieldset>

        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="font-semibold">{formatPKR(live.price(template))} <span className="font-normal text-foreground/70">· flat price, includes web invite, video and RSVP</span></p>
          <p className="mt-1 text-sm text-foreground/70">You pay by online bank transfer after reviewing, then upload your receipt. Your invite goes live once we confirm it.</p>
          {supportWhatsapp && <p className="mt-2 text-sm text-foreground/70">Need help? <SupportLink topic={`I have a question about the ${template.name} invitation`} className="text-brand" /></p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setPreviewing(true)}>Preview full invitation</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Continue to payment"}</button>
          </div>
          {!backendConfigured && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              Preview mode: ordering needs the backend connected (Supabase keys). Editing, preview and video export work now.
            </p>
          )}
          {msg && <p role="status" className="mt-3 text-sm text-red-700">{msg}</p>}
        </div>
      </form>

      <aside className="order-1 lg:sticky lg:top-20 lg:order-2 lg:self-start">
        {/* desktop: the real invitation, following the part of the form being edited */}
        <div className="hidden lg:block" data-live-preview>
          {/* an iPhone 15, like the template pages; a visual mirror of the form, so hidden from screen readers */}
          <div aria-hidden inert className="mx-auto w-fit">
            <PhoneFrame margin={200} maxWidth={340}>
              <div className="relative h-full w-full"><InviteExperience template={template} content={content} demo startOpen focus={focus} /><PreviewWatermark /></div>
            </PhoneFrame>
          </div>
          <p className="mt-3 text-center text-xs text-foreground/70">The preview follows what you edit.</p>
          <button type="button" className="btn btn-ghost mx-auto mt-2 flex" onClick={() => setPreviewing(true)}>Open the full invitation</button>
        </div>
        {/* phones: a small live thumbnail, so the form starts near the top; tap it for the full preview */}
        <button type="button" onClick={() => setPreviewing(true)} className="press flex w-full items-center gap-4 rounded-2xl border border-line bg-card p-3 text-left lg:hidden">
          <LivePreview template={template} content={content} className="pointer-events-none h-36 w-[4.75rem] shrink-0 rounded-xl" />
          <span className="text-sm"><span className="block font-semibold">Your invitation</span><span className="block text-foreground/70">It updates as you type. Tap to see all of it.</span></span>
        </button>
      </aside>
      <div className="order-3"><VideoExport template={template} content={content} watermark /></div>

      {/* phones: price, preview and continue always in reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-line bg-background/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur lg:hidden">
        <p className="mr-auto text-sm font-semibold">{formatPKR(live.price(template))}</p>
        <button type="button" className="btn btn-ghost" onClick={() => setPreviewing(true)}><Eye className="size-4" aria-hidden /> Preview</button>
        <button type="submit" form="editor-form" className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Continue"}</button>
      </div>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-40 z-50 flex justify-center px-4 lg:bottom-6">
        {removed && (
          <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-foreground px-5 py-2 text-sm text-background shadow-xl">
            <span className="max-w-[14rem] truncate">Removed {removed.label}</span>
            <button type="button" className="inline-flex min-h-11 items-center gap-1 font-semibold text-gold-light" onClick={() => { removed.restore(); setRemoved(null); }}>
              <Undo2 className="size-4" aria-hidden /> Undo
            </button>
          </div>
        )}
      </div>

      {previewing && (
        <div role="dialog" aria-modal="true" aria-label="Invitation preview" className="modal-overlay fixed inset-0 z-50 grid place-items-center bg-black/70 p-3">
          <div className="modal-panel relative">
            <PhoneFrame margin={32} plainClassName="h-[92dvh] w-[min(100vw-1.5rem,390px)] max-md:overflow-hidden max-md:rounded-[2rem] max-md:border-8 max-md:border-foreground/90">
              <div className="relative h-full w-full"><InviteExperience template={template} content={content} demo /><PreviewWatermark /></div>
            </PhoneFrame>
            <button ref={closeBtn} type="button" onClick={() => setPreviewing(false)} aria-label="Close preview"
              className="press absolute -right-3 -top-3 z-50 grid size-11 place-items-center rounded-full bg-black/70 text-white md:right-1 md:top-1">
              <X className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
