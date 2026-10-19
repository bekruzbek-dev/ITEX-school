export const STATUS_LABELS = {
  new: "Yangi",
  reviewing: "Ko‘rib chiqilmoqda",
  accepted: "Qabul qilindi",
  rejected: "Rad etildi",
} as const;

export function errMsg(e: unknown): string {
  const raw =
    typeof e === "string" ? e : e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : "";
  if (raw.includes("RATE_LIMIT")) return "Bu telefon raqamidan juda ko‘p ariza yuborilgan. Iltimos, keyinroq urinib ko‘ring.";
  if (raw.includes("DUPLICATE")) return "Bu raqam bilan ushbu yo‘nalishga ariza allaqachon yuborilgan.";
  if (raw.includes("Failed to fetch") || raw.includes("NetworkError")) return "Serverga ulanib bo‘lmadi. Internet aloqasini tekshirib, qayta urinib ko‘ring.";
  if (raw.includes("Invalid login credentials")) return "Email yoki parol noto‘g‘ri.";
  if (raw.includes("row-level security")) return "Bu amalni bajarishga ruxsat yo‘q.";
  return raw || "Noma’lum xatolik yuz berdi. Qayta urinib ko‘ring.";
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("uz-UZ", { day: "2-digit", month: "long", year: "numeric" }).format(d);
}

/** Turli ko'rinishdagi o'zbek raqamini +998XXXXXXXXX formatiga keltiradi. Noto'g'ri bo'lsa null. */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.length === 9) d = "998" + d;
  if (d.length === 12 && d.startsWith("998")) return "+" + d;
  return null;
}

export function splitList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function safeUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  try {
    const p = new URL(u);
    return p.protocol === "http:" || p.protocol === "https:" ? p.toString() : null;
  } catch {
    return null;
  }
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
