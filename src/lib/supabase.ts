import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && anon);

// Muhit o'zgaruvchilari yo'q bo'lsa ham ilova ochiladi; so'rovlar tushunarli xato bilan to'xtaydi.
export const supabase = createClient(url || "http://localhost:54321", anon || "public-anon-key-missing", {
  auth: { persistSession: true, autoRefreshToken: true },
});

export const MEDIA_BUCKET = "itex-media";
