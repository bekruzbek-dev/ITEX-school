import { isConfigured, supabase, MEDIA_BUCKET } from "./supabase";

export function assertConfigured(): void {
  if (!isConfigured) {
    throw new Error(
      "Supabase sozlanmagan. .env faylida VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY qiymatlarini kiriting."
    );
  }
}

interface ListOpts {
  published?: boolean;
  order?: string;
  asc?: boolean;
  limit?: number;
}

export async function list<T>(table: string, opts: ListOpts = {}): Promise<T[]> {
  assertConfigured();
  let q = supabase.from(table).select("*");
  if (opts.published) q = q.eq("is_published", true);
  if (opts.order) q = q.order(opts.order, { ascending: opts.asc ?? false });
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as T[];
}

export async function getById<T>(table: string, id: string): Promise<T | null> {
  assertConfigured();
  const { data, error } = await supabase.from(table).select("*").eq("id", id).eq("is_published", true).maybeSingle();
  if (error) throw error;
  return (data as T | null) ?? null;
}

export async function countRows(table: string, filter?: { column: string; value: string | boolean }): Promise<number> {
  assertConfigured();
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) q = q.eq(filter.column, filter.value);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

/** Rasmni brauzerda kichraytirib (maks. 1600px, WebP) Storage'ga yuklaydi va ochiq URL qaytaradi. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  assertConfigured();
  if (!file.type.startsWith("image/")) throw new Error("Faqat rasm fayllarini yuklash mumkin.");
  if (file.size > 15 * 1024 * 1024) throw new Error("Rasm hajmi 15 MB dan oshmasligi kerak.");
  const blob = await shrink(file);
  const ext = blob.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : file.type === "image/gif" ? "gif" : "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, {
    contentType: blob.type || file.type,
    cacheControl: "31536000",
  });
  if (error) throw error;
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function shrink(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const out = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.82));
    return out && out.size < file.size ? out : file;
  } catch {
    return file;
  }
}
