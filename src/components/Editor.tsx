"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, X } from "lucide-react";
import {
  defaultContent, newEvent, randomSlug, type InviteContent, type InviteEvent,
} from "@/lib/content";
import { ContentSchema, MAX_EVENTS, MAX_FAQ, MAX_MEMBERS } from "@/lib/contentSchema";
import { TEMPLATES, formatPKR, getTemplate } from "@/lib/templates";
import { backendConfigured } from "@/lib/config";
import { InviteCard } from "@/components/invite/InviteCard";
import { InviteExperience } from "@/components/invite/InviteExperience";
import { VideoExport } from "@/components/VideoExport";
import { PhoneFrame } from "@/components/PhoneFrame";
import { PhotoField } from "@/components/PhotoField";

const draftKey = (id: string) => `dawat:draft:v2:${id}`;

export function Editor() {
  const router = useRouter();
  const id = useSearchParams().get("t") ?? "";
  const template = getTemplate(id);
  const [content, setContent] = useState<InviteContent | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [previewing, setPreviewing] = useState(false);

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
          {TEMPLATES.map((t) => (
            <li key={t.id}><a className="btn btn-ghost" href={`/create?t=${t.id}`}>{t.name}</a></li>
          ))}
        </ul>
      </div>
    );
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
      setMsg("Please fix the highlighted fields.");
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
      const { data: inv, error: e1 } = await sb
        .from("invites")
        .insert({ owner_id: user.id, slug: randomSlug(), template_id: template.id, content: parsed.data })
        .select("id")
        .single();
      if (e1) throw e1;
      const { data: ord, error: e2 } = await sb
        .from("orders")
        .insert({ owner_id: user.id, invite_id: inv.id, amount_pkr: template.price })
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
  const err = (k: string) => (errors[k] ? <p role="alert" className="mt-1 text-sm text-red-700">{errors[k]}</p> : null);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_340px]">
      <form onSubmit={(e) => { e.preventDefault(); order(); }} className="order-2 space-y-6 lg:order-1" noValidate>
        <div>
          <h1 className="font-display text-4xl font-bold text-brand">Customise {template.name}</h1>
          <p className="text-sm text-foreground/70">Your changes save automatically on this device.</p>
        </div>

        <fieldset className="grid gap-4 sm:grid-cols-2">
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
        </fieldset>

        <section className="space-y-4" aria-label="Photos">
          <h2 className="font-display text-2xl font-bold">Photos <span className="text-base font-normal text-foreground/70">(optional)</span></h2>
          <p className="text-sm text-foreground/70">
            Photos are resized on your phone before upload. Anyone with the invitation link can see them. You need to sign in to upload.
          </p>
          <div className="space-y-4 rounded-2xl border border-line bg-card p-4">
            <PhotoField label="Cover photo" next={here}
              hint={template.concept ? "Shown behind the whole invitation." : "Shown at the top of the card."}
              value={content.coverPhoto} fallback={template.backdrop?.src ?? template.art?.src} onChange={(url) => set({ coverPhoto: url })} />
            {err("coverPhoto")}
            <PhotoField label="Couple photo" next={here} hint="A portrait of the two of you (or the host)."
              value={content.couplePhoto} fallback={template.sample?.couple} onChange={(url) => set({ couplePhoto: url })} />
            {err("couplePhoto")}
          </div>
        </section>

        <section className="space-y-4" aria-label="Family contacts">
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
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                    <label className="block text-sm">Name
                      <input className="field" value={m.name} maxLength={60} onChange={(e) => setList(list.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                      {err(`${key}.${i}.name`)}
                    </label>
                    <label className="block text-sm">Phone (optional)
                      <input className="field" inputMode="tel" value={m.phone} maxLength={20} placeholder="+92 300 0000000" onChange={(e) => setList(list.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)))} />
                      {err(`${key}.${i}.phone`)}
                    </label>
                    <button type="button" className="press grid size-11 place-items-center rounded-full text-red-700" aria-label={`Remove ${m.name || "person"}`} onClick={() => setList(list.filter((_, j) => j !== i))}>
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
            <fieldset key={i} className="grid gap-4 rounded-2xl border border-line bg-card p-4 sm:grid-cols-2">
              <legend className="flex w-full items-center justify-between px-1 text-sm font-semibold">
                <span>Event {i + 1}</span>
                {content.events.length > 1 && (
                  <button type="button" className="inline-flex min-h-11 items-center gap-1 text-red-700" onClick={() => set({ events: content.events.filter((_, j) => j !== i) })}>
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
              {template.concept && (
                <div className="sm:col-span-2">
                  <PhotoField label="Event photo (optional)" next={here} hint="Shown behind this event's screen."
                    value={ev.photo} onChange={(url) => setEvent(i, { photo: url })} />
                  {err(`events.${i}.photo`)}
                </div>
              )}
            </fieldset>
          ))}
        </section>

        <section className="space-y-4" aria-label="Questions">
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
                <button type="button" className="inline-flex min-h-11 items-center gap-1 text-red-700" onClick={() => set({ faq: content.faq.filter((_, j) => j !== i) })}>
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

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="sr-only">Closing and contact</legend>
          <label className="sm:col-span-2">Closing line
            <input className="field" value={content.closing} maxLength={120} onChange={(e) => set({ closing: e.target.value })} />
          </label>
          <label>WhatsApp number for guests (optional)
            <input className="field" inputMode="tel" value={content.contactPhone} maxLength={20} onChange={(e) => set({ contactPhone: e.target.value })} placeholder="923001234567" />
          </label>
          <label className="flex items-center gap-3 self-end">
            <input type="checkbox" className="size-5" checked={content.rsvpEnabled} onChange={(e) => set({ rsvpEnabled: e.target.checked })} />
            Collect RSVPs
          </label>
        </fieldset>

        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="font-semibold">{formatPKR(template.price)} <span className="font-normal text-foreground/70">· flat price, includes web invite, video and RSVP</span></p>
          <p className="mt-1 text-sm text-foreground/70">You pay by online bank transfer after reviewing, then upload your receipt. Your invite goes live once we confirm it.</p>
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
        <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl border border-line shadow-xl">
          <InviteCard template={template} content={content} />
        </div>
        <VideoExport template={template} content={content} />
      </aside>

      {previewing && (
        <div role="dialog" aria-modal="true" aria-label="Invitation preview" className="modal-overlay fixed inset-0 z-50 grid place-items-center bg-black/70 p-3">
          <div className="modal-panel relative">
            <PhoneFrame margin={32} plainClassName="h-[92dvh] w-[min(100vw-1.5rem,390px)] max-md:overflow-hidden max-md:rounded-[2rem] max-md:border-8 max-md:border-foreground/90">
              <InviteExperience template={template} content={content} demo />
            </PhoneFrame>
            <button type="button" onClick={() => setPreviewing(false)} aria-label="Close preview"
              className="press absolute -right-3 -top-3 z-50 grid size-11 place-items-center rounded-full bg-black/70 text-white md:right-1 md:top-1">
              <X className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
