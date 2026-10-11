const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True once the owner has provided Supabase credentials (see .env.example). Safe to import anywhere (no SDK). */
export const backendConfigured = Boolean(url && anon);

export const supabaseEnv = { url, anon };

export const paymentInfo = {
  bank: process.env.NEXT_PUBLIC_PAY_BANK ?? "",
  jazzcash: process.env.NEXT_PUBLIC_PAY_JAZZCASH ?? "",
  easypaisa: process.env.NEXT_PUBLIC_PAY_EASYPAISA ?? "",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "",
};

/** Customer support on WhatsApp (the owner's number, digits only, e.g. 923001234567). Empty = links are hidden. */
export const supportWhatsapp = paymentInfo.whatsapp.replace(/\D/g, "");
export const supportLink = (topic = "I have a question about Digital Dawat") =>
  `https://wa.me/${supportWhatsapp}?text=${encodeURIComponent(`Assalam o Alaikum, ${topic}.`)}`;
