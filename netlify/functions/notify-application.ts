import { esc, sendTelegram, telegramConfigured } from "../lib/telegram";

/**
 * Supabase Database Webhook (applications jadvali, INSERT) shu manzilga POST yuboradi:
 *   https://SAYT.netlify.app/.netlify/functions/notify-application
 * Header: x-webhook-secret: <WEBHOOK_SECRET>
 * Telegram ishlamasa ham ariza bazada saqlanib bo'lgan bo'ladi — bu funksiya faqat xabar yuboradi.
 */
interface WebhookBody {
  type?: string;
  record?: Record<string, unknown>;
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const secret = process.env.WEBHOOK_SECRET;
  if (!secret || req.headers.get("x-webhook-secret") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!telegramConfigured()) {
    return Response.json({ ok: true, skipped: "telegram_not_configured" });
  }

  let body: WebhookBody;
  try {
    body = (await req.json()) as WebhookBody;
  } catch {
    return new Response("Bad Request", { status: 400 });
  }
  if (body.type !== "INSERT" || !body.record) return Response.json({ ok: true, skipped: "not_insert" });

  const r = body.record;
  const text =
    `🚀 <b>Yangi ariza (ITEX)</b>\n` +
    `👤 ${esc(r.full_name)}\n` +
    `🏫 Sinf: ${esc(r.grade)}\n` +
    `📞 ${esc(r.phone)}\n` +
    (r.parent_phone ? `👪 Ota-ona: ${esc(r.parent_phone)}\n` : "") +
    `💻 Yo‘nalish: ${esc(r.course_title)}\n` +
    `📊 Daraja: ${esc(r.computer_level)}` +
    (r.comment ? `\n💬 ${esc(r.comment)}` : "");

  const sent = await sendTelegram(text);
  return Response.json({ ok: true, sent });
};
