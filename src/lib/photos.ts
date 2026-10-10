import { supabaseEnv } from "./config";

/** Public Supabase bucket for customer photos. Guests view them by URL; each customer can only write to their own folder. */
export const PHOTO_BUCKET = "invite-photos";

/** Only photos stored in our own bucket are accepted in invitation content. */
export const photoPrefix = () => (supabaseEnv.url ? `${supabaseEnv.url}/storage/v1/object/public/${PHOTO_BUCKET}/` : "");
export const isOurPhoto = (url: string) => {
  const prefix = photoPrefix();
  return prefix !== "" && url.startsWith(prefix) && /^[\w/-]+\.(webp|jpg)$/.test(url.slice(prefix.length));
};

const MAX_SIDE = 1600;
const MAX_INPUT_BYTES = 25 * 1024 * 1024;

/** Downscale in the browser so phone photos upload fast and pages stay light. WebP where the browser can encode it, JPEG otherwise. */
async function shrink(file: File): Promise<{ blob: Blob; ext: "webp" | "jpg"; type: string }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("This photo format can't be opened here. Please choose a JPEG or PNG photo.");
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const encode = (type: string) => new Promise<Blob | null>((res) => canvas.toBlob(res, type, 0.82));
  const webp = await encode("image/webp");
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp", type: "image/webp" };
  const jpg = await encode("image/jpeg");
  if (!jpg) throw new Error("Could not prepare this photo. Please try another one.");
  return { blob: jpg, ext: "jpg", type: "image/jpeg" };
}

export type UploadResult = { url: string } | { signIn: true };

/** Shrinks and uploads one photo for the signed-in customer and returns its public URL. */
export async function uploadPhoto(file: File): Promise<UploadResult> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a photo.");
  if (file.size > MAX_INPUT_BYTES) throw new Error("That photo is too large (over 25 MB).");
  const { getSupabase } = await import("./supabase");
  const sb = getSupabase();
  if (!sb) throw new Error("Photo upload is not available yet.");
  const { data } = await sb.auth.getSession();
  const user = data.session?.user;
  if (!user) return { signIn: true };
  const { blob, ext, type } = await shrink(file);
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  return { url: sb.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl };
}
