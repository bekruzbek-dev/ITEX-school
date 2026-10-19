/** Telegram'ga xabar yuboradi. Token va chat ID faqat serverda (Netlify env) saqlanadi. */
export function telegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .slice(0, 800);
}

export async function sendTelegram(html: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: html, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    if (!res.ok) {
      // Tokenni logga yozmaymiz
      console.error("Telegram javobi muvaffaqiyatsiz:", res.status);
      return false;
    }
    return true;
  } catch {
    console.error("Telegram'ga ulanishda xatolik");
    return false;
  }
}
