"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, X } from "lucide-react";
import {
  ContentSchema, MAX_EVENTS, MAX_FAQ, defaultContent, newEvent, randomSlug, type InviteContent, type InviteEvent,
} from "@/lib/content";
import { TEMPLATES, formatPKR, getTemplate } from "@/lib/templates";
import { backendConfigured, getSupabase } from "@/lib/supabase";
import { InviteCard } from "@/components/invite/InviteCard";
import { InviteExperience } from "@/components/invite/InviteExperience";
import { VideoExport } from "@/components/VideoExport";

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

  const err = (k: string) => (errors[k] ? <p role="alert" className="mt-1 text-sm text-red-700">{errors[k]}</p> : null);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_340px]">
      <form onSubmit={(e) => { e.preventDefault(); order(); }} className="order-2 space-y-6 lg:order-1" noValidate>
        <div>
          <h1 className="font-display text-4xl font-bold text-brand">Customise {template.name}</h1>
          <p className="text-sm text-foreground/60">Your changes save automatically on this device.</p>
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

        <section className="space-y-4" aria-label="Events">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Events <span className="text-base font-normal text-foreground/60">({content.events.length}/{MAX_EVENTS})</span></h2>
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
            </fieldset>
          ))}
        </section>

        <section className="space-y-4" aria-label="Questions">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Good to know <span className="text-base font-normal text-foreground/60">(optional)</span></h2>
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
          <p className="font-semibold">{formatPKR(template.price)} <span className="font-normal text-foreground/60">· flat price, includes web invite, video and RSVP</span></p>
          <p className="mt-1 text-sm text-foreground/60">You pay by SadaPay after reviewing, then upload your receipt. Your invite goes live once we confirm it.</p>
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
        <div role="dialog" aria-modal="true" aria-label="Invitation preview" className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-3">
          <div className="relative h-[min(780px,92dvh)] w-full max-w-[390px] overflow-hidden rounded-[2rem] border-8 border-foreground/90 bg-background shadow-2xl">
            <InviteExperience template={template} content={content} demo />
            <button type="button" onClick={() => setPreviewing(false)} aria-label="Close preview"
              className="absolute right-3 top-3 z-30 grid size-11 place-items-center rounded-full bg-black/60 text-white">
              <X className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
