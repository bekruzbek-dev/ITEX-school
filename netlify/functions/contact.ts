import { esc, sendTelegram, telegramConfigured } from "../lib/telegram";

/** Aloqa formasi: xabarni Telegram'ga yuboradi. Telegram sozlanmagan bo'lsa, foydalanuvchiga tushunarli xato qaytaradi. */
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 3;

function limited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  return list.length > MAX_HITS;
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const ip = req.headers.get("x-nf-client-connection-ip") ?? "unknown";
  if (limited(ip)) return Response.json({ error: "Juda ko‘p urinish. Birozdan keyin qayta urinib ko‘ring." }, { status: 429 });

  let b: { name?: unknown; contact?: unknown; message?: unknown };
  try {
    b = (await req.json()) as typeof b;
  } catch {
    return Response.json({ error: "So‘rov noto‘g‘ri." }, { status: 400 });
  }
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const contact = typeof b.contact === "string" ? b.contact.trim() : "";
  const message = typeof b.message === "string" ? b.message.trim() : "";
  if (name.length < 2 || name.length > 100 || contact.length < 5 || contact.length > 120 || message.length < 5 || message.length > 1500) {
    return Response.json({ error: "Maydonlarni to‘g‘ri to‘ldiring." }, { status: 400 });
  }
  if (!telegramConfigured()) {
    return Response.json({ error: "Aloqa formasi hozircha sozlanmagan. Iltimos, telefon yoki Telegram orqali bog‘laning." }, { status: 503 });
  }

  const ok = await sendTelegram(`✉️ <b>ITEX saytidan xabar</b>\n👤 ${esc(name)}\n📞 ${esc(contact)}\n\n${esc(message)}`);
  if (!ok) return Response.json({ error: "Xabarni yuborib bo‘lmadi. Keyinroq urinib ko‘ring." }, { status: 502 });
  return Response.json({ ok: true });
};
