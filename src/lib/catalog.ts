"use client";

import { useEffect, useState } from "react";
import type { Template } from "@/lib/templates";

/*
 * The live catalogue: each design's price and visibility, and site settings, read from the database so the owner can
 * change them in Supabase without a new deploy. The values in templates.ts are only the fallback until it loads (or when
 * the database can't be reached).
 *   public.template_prices (template_id, price_pkr, visible 'Y' | 'N')
 *   public.settings (key, value)
 */

type Entry = { price: number; visible: boolean };
let catalog: Promise<Map<string, Entry> | null> | null = null;
let settings: Promise<Map<string, string> | null> | null = null;

function loadCatalog() {
  catalog ??= (async () => {
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    if (!sb) return null;
    // "*" so it works before and after the visible column is added (2026-10-18_catalogue_controls.sql)
    const res = await sb.from("template_prices").select("*");
    if (res.error || !res.data) return null;
    const rows = res.data as { template_id: string; price_pkr: number; visible?: string }[];
    return new Map(rows.map((r) => [r.template_id, { price: r.price_pkr, visible: r.visible !== "N" }]));
  })().catch(() => null);
  return catalog;
}

function loadSettings() {
  settings ??= (async () => {
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    if (!sb) return null;
    const { data, error } = await sb.from("settings").select("key, value");
    if (error || !data) return null;
    return new Map((data as { key: string; value: string }[]).map((r) => [r.key, r.value]));
  })().catch(() => null);
  return settings;
}

/** Prices and visibility from the database. Until it loads, everything is visible at its templates.ts price. */
export function useCatalog() {
  const [map, setMap] = useState<Map<string, Entry> | null>(null);
  useEffect(() => {
    let live = true;
    loadCatalog().then((m) => { if (live) setMap(m); });
    return () => { live = false; };
  }, []);
  return {
    ready: map !== null,
    price: (t: Template) => map?.get(t.id)?.price ?? t.price,
    /** false only when the database says visible = 'N' */
    visible: (t: Template) => map?.get(t.id)?.visible ?? true,
  };
}

/** One value from public.settings; `fallback` until it loads, or when the key is missing. */
export function useSetting(key: string, fallback: string) {
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    loadSettings().then((m) => { if (live) setValue(m?.get(key) ?? null); });
    return () => { live = false; };
  }, [key]);
  return value ?? fallback;
}
