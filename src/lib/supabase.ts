import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { backendConfigured, supabaseEnv } from "./config";

export { backendConfigured, paymentInfo } from "./config";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!backendConfigured) return null;
  client ??= createClient(supabaseEnv.url!, supabaseEnv.anon!);
  return client;
}
