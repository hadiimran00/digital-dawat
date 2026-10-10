import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True once the owner has provided Supabase credentials (see .env.example). */
export const backendConfigured = Boolean(url && anon);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!backendConfigured) return null;
  client ??= createClient(url!, anon!);
  return client;
}

export const paymentInfo = {
  bank: process.env.NEXT_PUBLIC_PAY_BANK ?? "",
  jazzcash: process.env.NEXT_PUBLIC_PAY_JAZZCASH ?? "",
  easypaisa: process.env.NEXT_PUBLIC_PAY_EASYPAISA ?? "",
  sadapay: process.env.NEXT_PUBLIC_PAY_SADAPAY ?? "",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "",
};
