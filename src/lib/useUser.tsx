"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { backendConfigured, getSupabase } from "./supabase";

/**
 * Sessions end after 7 days without using the site, or 30 days after signing in, whichever comes first.
 * Supabase keeps sessions alive indefinitely on the free plan, so the site enforces this itself.
 */
export const IDLE_LIMIT_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const SIGNED_IN_AT = "dawat:auth:signedInAt";
const LAST_ACTIVE = "dawat:auth:lastActive";
export const EXPIRED_FLAG = "dawat:auth:expired";

const read = (k: string) => { try { return Number(localStorage.getItem(k)) || 0; } catch { return 0; } };
const write = (k: string, v: string | null) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch {} };

/** Start the clock for a fresh sign-in (called by the sign-in page and on Supabase's SIGNED_IN event). */
export function markSignedIn() {
  const now = String(Date.now());
  write(SIGNED_IN_AT, now);
  write(LAST_ACTIVE, now);
  write(EXPIRED_FLAG, null);
}

/** Signs the user out if their session is too old or idle; otherwise records this visit. Returns true if it expired. */
async function enforceLimits(sb: SupabaseClient, signedIn: boolean): Promise<boolean> {
  if (!signedIn) return false;
  const now = Date.now();
  const since = read(SIGNED_IN_AT);
  const last = read(LAST_ACTIVE);
  if (!since) { markSignedIn(); return false; } // a session from before this rule: start its clock now
  if (now - (last || since) > IDLE_LIMIT_MS || now - since > MAX_SESSION_MS) {
    await sb.auth.signOut({ scope: "local" }); // only this device: an idle laptop shouldn't sign out the host's phone
    write(SIGNED_IN_AT, null);
    write(LAST_ACTIVE, null);
    write(EXPIRED_FLAG, "1");
    return true;
  }
  write(LAST_ACTIVE, String(now));
  return false;
}

/** `undefined` = still loading, `null` = signed out. */
export function useUser() {
  const [user, setUser] = useState<User | null | undefined>(backendConfigured ? undefined : null);
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    const check = () => sb.auth.getSession().then(async ({ data }) => {
      const expired = await enforceLimits(sb, Boolean(data.session));
      setUser(expired ? null : data.session?.user ?? null);
    });
    check();
    // a tab left open for days is checked again when the host comes back to it
    const onVisible = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVisible);
    const { data } = sb.auth.onAuthStateChange((event, s) => {
      if (event === "INITIAL_SESSION") return; // the stored session is only trusted after check() has applied the limits
      if (event === "SIGNED_IN" && !read(SIGNED_IN_AT)) markSignedIn(); // e.g. arriving from an email sign-in link
      if (event === "SIGNED_OUT") { write(SIGNED_IN_AT, null); write(LAST_ACTIVE, null); }
      setUser(s?.user ?? null);
    });
    return () => { data.subscription.unsubscribe(); document.removeEventListener("visibilitychange", onVisible); };
  }, []);
  return user;
}

export function NotConfigured() {
  return (
    <p className="mx-auto my-16 max-w-md rounded-xl border border-amber-300 bg-amber-50 p-6 text-center text-amber-900">
      This part of the site needs its backend connected (Supabase keys not set). Browsing, editing and video export still work.
    </p>
  );
}
