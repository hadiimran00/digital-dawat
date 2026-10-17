import { supabaseEnv } from "./config";
import type { InviteContent } from "./contentSchema";
import type { Template } from "./templates";

/** Public Supabase bucket for customers' own songs (see 2026-10-18_invite_music.sql). Each customer writes only to their folder. */
export const MUSIC_BUCKET = "invite-music";
export const MAX_SONG_BYTES = 10 * 1024 * 1024;

const prefix = () => (supabaseEnv.url ? `${supabaseEnv.url}/storage/v1/object/public/${MUSIC_BUCKET}/` : "");
/** Only songs stored in our own bucket are accepted in invitation content. */
export const isOurSong = (url: string) => {
  const p = prefix();
  return p !== "" && url.startsWith(p) && /^[\w/-]+\.(mp3|m4a|aac)$/.test(url.slice(p.length));
};

/**
 * The song an invitation plays. content.music: "" = the design's own song (if it has one), "off" = no music,
 * or the customer's uploaded song (a URL in our bucket).
 */
export function musicOf(template: Template, content: Pick<InviteContent, "music">): { src: string; title: string } | undefined {
  const m = content.music ?? "";
  if (m === "off") return undefined;
  if (m && isOurSong(m)) return { src: m, title: "Your song" };
  return template.music;
}

const TYPES: Record<string, string> = { mp3: "audio/mpeg", m4a: "audio/mp4", aac: "audio/aac" };

/** Uploads one song (MP3, M4A or AAC, up to 10 MB) for the signed-in customer and returns its public URL. */
export async function uploadSong(file: File): Promise<{ url: string } | { signIn: true }> {
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (!TYPES[ext]) throw new Error("Please choose an MP3 or M4A song.");
  if (file.size > MAX_SONG_BYTES) throw new Error("That song is too large. Please choose one under 10 MB (about 8 minutes).");
  const { getSupabase } = await import("./supabase");
  const sb = getSupabase();
  if (!sb) throw new Error("Song upload is not available yet.");
  const { data } = await sb.auth.getSession();
  const user = data.session?.user;
  if (!user) return { signIn: true };
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from(MUSIC_BUCKET).upload(path, file, { contentType: TYPES[ext], cacheControl: "31536000", upsert: false });
  if (error) throw new Error(/mime|type/i.test(error.message) ? "This file type isn't accepted. Please choose an MP3 or M4A song." : error.message);
  return { url: sb.storage.from(MUSIC_BUCKET).getPublicUrl(path).data.publicUrl };
}
