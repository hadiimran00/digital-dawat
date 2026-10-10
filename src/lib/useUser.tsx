"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { backendConfigured, getSupabase } from "./supabase";

/** `undefined` = still loading, `null` = signed out. */
export function useUser() {
  const [user, setUser] = useState<User | null | undefined>(backendConfigured ? undefined : null);
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
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
