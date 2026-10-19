
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 3;
const hits = new Map<string, number[]>();

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(
    (time) => now - time < WINDOW_MS
  );

  if (recent.length >= MAX_HITS) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return json({ error: "Bu so‘rov usuli qo‘llab-quvvatlanmaydi." }, 405);
  }

  const ip =
    req.headers.get("x-nf-client-connection-ip") ?? "unknown";

  if (limited(ip)) {
    return json(
      { error: "Juda ko‘p urinish. 10 daqiqadan keyin qayta urinib ko‘ring." },
      429
    );
  }

  let body: {
    name?: unknown;
    contact?: unknown;
    message?: unknown;
    trap?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return json({ error: "So‘rov ma’lumotlari noto‘g‘ri." }, 400);
  }

  // Honeypot: botlar to‘ldirgan yashirin maydon
  if (typeof body.trap === "string" && body.trap.trim() !== "") {
    return json({ ok: true });
  }

  const name =
    typeof body.name === "string" ? body.name.trim() : "";
  const contact =
    typeof body.contact === "string" ? body.contact.trim() : "";
  const message =
    typeof body.message === "string" ? body.message.trim() : "";

  if (
    name.length < 2 ||
    name.length > 100 ||
    contact.length < 5 ||
    contact.length > 120 ||
    message.length < 5 ||
    message.length > 1500
  ) {
    return json(
      { error: "Ism, aloqa ma’lumoti va xabarni to‘g‘ri kiriting." },
      400
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("Contact function: Supabase environment variables missing.");
    return json(
      { error: "Server sozlamalari tugallanmagan. Keyinroq urinib ko‘ring." },
      503
    );
  }

  try {
    const baseUrl = supabaseUrl.replace(/\/+$/, "");

    const response = await fetch(
      `${baseUrl}/rest/v1/contact_messages`,
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ name, contact, message }),
      }
    );

    if (!response.ok) {
      console.error(
        "Contact insert failed:",
        response.status,
        await response.text()
      );

      return json(
        { error: "Xabarni saqlab bo‘lmadi. Keyinroq urinib ko‘ring." },
        502
      );
    }

    return json({ ok: true });
  } catch (error) {
    console.error("Contact function error:", error);
    return json(
      { error: "Server bilan bog‘lanib bo‘lmadi. Keyinroq urinib ko‘ring." },
      502
    );
  }
};
