import { useEffect, useState, type FormEvent } from "react";
import { useQuery } from "../../hooks/useQuery";
import { useToast } from "../../hooks/useToast";
import { assertConfigured } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import type { SiteSettings } from "../../types";
import { ErrorState, Spinner } from "../../components/ui";
import { errMsg, safeUrl } from "../../lib/utils";

export default function SettingsAdmin() {
  const toast = useToast();
  const q = useQuery(async () => {
    assertConfigured();
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return (data as SiteSettings | null) ?? null;
  });
  const [f, setF] = useState({ phone: "", email: "", telegram_url: "", address: "", map_embed_url: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const d = q.data;
    if (d) {
      setF({
        phone: d.phone ?? "",
        email: d.email ?? "",
        telegram_url: d.telegram_url ?? "",
        address: d.address ?? "",
        map_embed_url: d.map_embed_url ?? "",
      });
    }
  }, [q.data]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (f.telegram_url && !safeUrl(f.telegram_url)) return toast.error("Telegram havolasi https:// bilan boshlanishi kerak.");
    if (f.map_embed_url && !safeUrl(f.map_embed_url)) return toast.error("Xarita havolasi https:// bilan boshlanishi kerak.");
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) return toast.error("Email manzili noto‘g‘ri.");
    setBusy(true);
    const { error } = await supabase.from("site_settings").upsert({
      id: 1,
      phone: f.phone.trim() || null,
      email: f.email.trim() || null,
      telegram_url: f.telegram_url.trim() || null,
      address: f.address.trim() || "Andijon viloyati, Baliqchi tumani, Barkamol MFY",
      map_embed_url: f.map_embed_url.trim() || null,
    });
    setBusy(false);
    if (error) return toast.error(errMsg(error));
    toast.success("Sozlamalar saqlandi.");
    q.reload();
  }

  if (q.loading) return <Spinner />;
  if (q.error) return <ErrorState message={q.error} onRetry={q.reload} />;

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  return (
    <>
      <h1>Sayt sozlamalari</h1>
      <form className="form card" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="s-phone">Telefon</label>
          <input id="s-phone" value={f.phone} onChange={set("phone")} placeholder="+998 ..." />
        </div>
        <div className="field">
          <label htmlFor="s-email">Elektron pochta</label>
          <input id="s-email" type="email" value={f.email} onChange={set("email")} />
        </div>
        <div className="field">
          <label htmlFor="s-tg">Telegram havolasi</label>
          <input id="s-tg" value={f.telegram_url} onChange={set("telegram_url")} placeholder="https://t.me/..." />
        </div>
        <div className="field">
          <label htmlFor="s-addr">Manzil</label>
          <input id="s-addr" value={f.address} onChange={set("address")} />
        </div>
        <div className="field">
          <label htmlFor="s-map">Xarita (embed havolasi)</label>
          <input id="s-map" value={f.map_embed_url} onChange={set("map_embed_url")} placeholder="Google Maps > Ulashish > Xaritani joylashtirish > src havolasi" />
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
    </>
  );
}
