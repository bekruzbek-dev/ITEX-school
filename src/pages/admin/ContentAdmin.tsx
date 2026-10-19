import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "../../hooks/useQuery";
import { useToast } from "../../hooks/useToast";
import { list, uploadImage } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { ConfirmDialog, DataState, EmptyState, Img, Modal } from "../../components/ui";
import { errMsg, formatDate, safeUrl, splitList } from "../../lib/utils";

type FieldType = "text" | "textarea" | "number" | "date" | "datetime" | "checkbox" | "list" | "image" | "url";
interface Field {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  nullable?: boolean;
  help?: string;
}
interface Config {
  table: string;
  title: string;
  singular: string;
  folder: string;
  order: string;
  asc: boolean;
  fields: Field[];
  titleKey: string;
  columns: Array<{ key: string; label: string; kind?: "date" | "bool" }>;
  defaults: Record<string, string | boolean>;
}
type Row = Record<string, unknown> & { id: string };
type FormState = Record<string, string | boolean>;

const CONFIGS: Record<"courses" | "news" | "projects" | "achievements", Config> = {
  courses: {
    table: "courses",
    title: "IT yo‘nalishlari",
    singular: "yo‘nalish",
    folder: "courses",
    order: "sort_order",
    asc: true,
    titleKey: "title",
    columns: [
      { key: "icon", label: "" },
      { key: "title", label: "Nomi" },
      { key: "level", label: "Daraja" },
      { key: "is_published", label: "E’lon", kind: "bool" },
    ],
    defaults: { icon: "💻", level: "Barcha sinflar", sort_order: "0", is_published: true },
    fields: [
      { key: "title", label: "Nomi", type: "text", required: true },
      { key: "icon", label: "Belgi (emoji)", type: "text" },
      { key: "description", label: "Tavsif", type: "textarea" },
      { key: "level", label: "Mos o‘quvchilar darajasi", type: "text" },
      { key: "topics", label: "O‘rganiladigan mavzular", type: "list", help: "Har birini yangi qatorga yoki vergul bilan yozing" },
      { key: "practice", label: "Amaliy mashg‘ulotlar", type: "list", help: "Har birini yangi qatorga yoki vergul bilan yozing" },
      { key: "duration", label: "Davomiyligi", type: "text", nullable: true },
      { key: "schedule", label: "Dars jadvali", type: "text", nullable: true },
      { key: "sort_order", label: "Tartib raqami", type: "number" },
      { key: "is_published", label: "Saytda ko‘rsatish", type: "checkbox" },
    ],
  },
  news: {
    table: "news",
    title: "Yangiliklar",
    singular: "yangilik",
    folder: "news",
    order: "published_at",
    asc: false,
    titleKey: "title",
    columns: [
      { key: "title", label: "Sarlavha" },
      { key: "category", label: "Kategoriya" },
      { key: "published_at", label: "Sana", kind: "date" },
      { key: "is_published", label: "E’lon", kind: "bool" },
    ],
    defaults: { category: "Yangilik", is_published: true, published_at: "" },
    fields: [
      { key: "title", label: "Sarlavha", type: "text", required: true },
      { key: "category", label: "Kategoriya", type: "text", required: true },
      { key: "summary", label: "Qisqa tavsif", type: "textarea" },
      { key: "content", label: "To‘liq matn", type: "textarea", help: "Abzatslar orasiga bo‘sh qator qoldiring" },
      { key: "image_url", label: "Rasm", type: "image", nullable: true },
      { key: "published_at", label: "E’lon sanasi", type: "datetime" },
      { key: "is_published", label: "Saytda ko‘rsatish", type: "checkbox" },
    ],
  },
  projects: {
    table: "projects",
    title: "O‘quvchilar loyihalari",
    singular: "loyiha",
    folder: "projects",
    order: "created_at",
    asc: false,
    titleKey: "title",
    columns: [
      { key: "title", label: "Nomi" },
      { key: "author", label: "Muallif" },
      { key: "project_date", label: "Sana", kind: "date" },
      { key: "is_published", label: "E’lon", kind: "bool" },
    ],
    defaults: { is_published: true },
    fields: [
      { key: "title", label: "Loyiha nomi", type: "text", required: true },
      { key: "author", label: "Muallif yoki jamoa", type: "text", required: true },
      { key: "description", label: "Tavsif", type: "textarea" },
      { key: "image_url", label: "Rasm", type: "image", nullable: true },
      { key: "technologies", label: "Texnologiyalar", type: "list", help: "Vergul bilan ajrating" },
      { key: "project_date", label: "Yaratilgan sana", type: "date", nullable: true },
      { key: "demo_url", label: "Demo havolasi", type: "url", nullable: true },
      { key: "github_url", label: "GitHub havolasi", type: "url", nullable: true },
      { key: "is_published", label: "Saytda ko‘rsatish", type: "checkbox" },
    ],
  },
  achievements: {
    table: "achievements",
    title: "Yutuqlar",
    singular: "yutuq",
    folder: "achievements",
    order: "achievement_date",
    asc: false,
    titleKey: "title",
    columns: [
      { key: "title", label: "Nomi" },
      { key: "category", label: "Turi" },
      { key: "achievement_date", label: "Sana", kind: "date" },
      { key: "is_published", label: "E’lon", kind: "bool" },
    ],
    defaults: { category: "Tanlov", is_published: true },
    fields: [
      { key: "title", label: "Nomi", type: "text", required: true },
      { key: "category", label: "Turi (tanlov, olimpiada, sertifikat...)", type: "text", required: true },
      { key: "description", label: "Tavsif", type: "textarea" },
      { key: "image_url", label: "Rasm", type: "image", nullable: true },
      { key: "achievement_date", label: "Sana", type: "date", nullable: true },
      { key: "is_published", label: "Saytda ko‘rsatish", type: "checkbox" },
    ],
  },
};

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function rowToForm(cfg: Config, row: Row | null): FormState {
  const out: FormState = {};
  for (const f of cfg.fields) {
    const raw = row ? row[f.key] : cfg.defaults[f.key];
    if (f.type === "checkbox") out[f.key] = raw === undefined ? true : Boolean(raw);
    else if (f.type === "list") out[f.key] = Array.isArray(raw) ? (raw as string[]).join("\n") : "";
    else if (f.type === "date") out[f.key] = typeof raw === "string" ? raw.slice(0, 10) : "";
    else if (f.type === "datetime") out[f.key] = typeof raw === "string" && raw ? toLocalInput(raw) : row ? "" : toLocalInput(new Date().toISOString());
    else out[f.key] = raw === null || raw === undefined ? "" : String(raw);
  }
  return out;
}

function formToPayload(cfg: Config, form: FormState): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of cfg.fields) {
    const v = form[f.key];
    switch (f.type) {
      case "checkbox":
        out[f.key] = Boolean(v);
        break;
      case "list":
        out[f.key] = splitList(String(v));
        break;
      case "number":
        out[f.key] = Number(v) || 0;
        break;
      case "datetime":
        out[f.key] = v ? new Date(String(v)).toISOString() : new Date().toISOString();
        break;
      default: {
        const s = String(v).trim();
        out[f.key] = s === "" && f.nullable ? null : s;
      }
    }
  }
  return out;
}

export default function ContentAdmin({ kind }: { kind: keyof typeof CONFIGS }) {
  const cfg = CONFIGS[kind];
  // kind o'zgarganda holatni tozalash uchun key ishlatiladi
  return <Manager key={kind} cfg={cfg} />;
}

function Manager({ cfg }: { cfg: Config }) {
  const toast = useToast();
  const q = useQuery(() => list<Row>(cfg.table, { order: cfg.order, asc: cfg.asc }), [cfg.table]);
  const [search, setSearch] = useState("");
  const [edit, setEdit] = useState<{ row: Row | null } | null>(null);
  const [del, setDel] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (q.data ?? []).filter((r) => !s || String(r[cfg.titleKey] ?? "").toLowerCase().includes(s) || JSON.stringify(r).toLowerCase().includes(s));
  }, [q.data, search, cfg.titleKey]);

  async function remove() {
    if (!del) return;
    setBusy(true);
    const { error } = await supabase.from(cfg.table).delete().eq("id", del.id);
    setBusy(false);
    if (error) return toast.error(errMsg(error));
    toast.success("O‘chirildi.");
    setDel(null);
    q.reload();
  }

  return (
    <>
      <div className="page-title-row">
        <h1>{cfg.title}</h1>
        <button type="button" className="btn btn-primary" onClick={() => setEdit({ row: null })}>
          + Qo‘shish
        </button>
      </div>
      <div className="toolbar">
        <input type="search" placeholder="Qidirish..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Qidirish" />
      </div>

      <DataState {...q} onRetry={q.reload} emptyTitle={`Hozircha ${cfg.singular} yo‘q`} emptyText="“Qo‘shish” tugmasi orqali birinchisini yarating.">
        {() =>
          rows.length === 0 ? (
            <EmptyState title="Hech narsa topilmadi" text="Boshqa so‘z bilan qidirib ko‘ring." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    {cfg.columns.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      {cfg.columns.map((c) => (
                        <td key={c.key} data-label={c.label}>
                          {c.kind === "bool" ? (
                            <span className={r[c.key] ? "pill ok" : "pill"}>{r[c.key] ? "Ha" : "Qoralama"}</span>
                          ) : c.kind === "date" ? (
                            formatDate(r[c.key] as string | null)
                          ) : (
                            String(r[c.key] ?? "—")
                          )}
                        </td>
                      ))}
                      <td className="actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdit({ row: r })}>
                          Tahrirlash
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => setDel(r)}>
                          O‘chirish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </DataState>

      {edit && (
        <EditModal
          cfg={cfg}
          row={edit.row}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            q.reload();
          }}
        />
      )}

      {del && (
        <ConfirmDialog
          title={`${cfg.singular[0].toUpperCase()}${cfg.singular.slice(1)}ni o‘chirish`}
          text={`“${String(del[cfg.titleKey] ?? "")}” butunlay o‘chiriladi. Bu amalni qaytarib bo‘lmaydi.`}
          busy={busy}
          onConfirm={() => void remove()}
          onCancel={() => setDel(null)}
        />
      )}
    </>
  );
}

function EditModal({ cfg, row, onClose, onSaved }: { cfg: Config; row: Row | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() => rowToForm(cfg, row));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string | boolean) => setForm((s) => ({ ...s, [k]: v }));

  async function onFile(key: string, file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      set(key, await uploadImage(file, cfg.folder));
      toast.success("Rasm yuklandi.");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    for (const f of cfg.fields) {
      if (f.required && !String(form[f.key]).trim()) return setError(`“${f.label}” maydonini to‘ldiring.`);
      if (f.type === "url" && String(form[f.key]).trim() && !safeUrl(String(form[f.key]))) {
        return setError(`“${f.label}” to‘g‘ri havola emas (https:// bilan boshlang).`);
      }
    }
    setBusy(true);
    const payload = formToPayload(cfg, form);
    const res = row
      ? await supabase.from(cfg.table).update(payload).eq("id", row.id)
      : await supabase.from(cfg.table).insert(payload);
    setBusy(false);
    if (res.error) return setError(errMsg(res.error));
    toast.success("Saqlandi.");
    onSaved();
  }

  return (
    <Modal title={row ? `Tahrirlash: ${cfg.singular}` : `Yangi ${cfg.singular}`} onClose={onClose} wide>
      <form className="form" onSubmit={onSubmit} noValidate>
        {cfg.fields.map((f) => {
          const id = `f-${f.key}`;
          const val = form[f.key];
          return (
            <div className="field" key={f.key}>
              {f.type === "checkbox" ? (
                <label className="check">
                  <input type="checkbox" checked={Boolean(val)} onChange={(e) => set(f.key, e.target.checked)} />
                  <span>{f.label}</span>
                </label>
              ) : (
                <>
                  <label htmlFor={id}>
                    {f.label}
                    {f.required && " *"}
                  </label>
                  {f.type === "textarea" || f.type === "list" ? (
                    <textarea id={id} rows={f.key === "content" ? 8 : 3} value={String(val)} onChange={(e) => set(f.key, e.target.value)} />
                  ) : f.type === "image" ? (
                    <div className="img-field">
                      {typeof val === "string" && val && <Img src={val} alt="Tanlangan rasm" className="img-preview" />}
                      <input id={id} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => void onFile(f.key, e.target.files?.[0])} disabled={uploading} />
                      {uploading && <span className="muted small">Yuklanmoqda...</span>}
                      {typeof val === "string" && val && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => set(f.key, "")}>
                          Rasmni olib tashlash
                        </button>
                      )}
                    </div>
                  ) : (
                    <input
                      id={id}
                      type={f.type === "datetime" ? "datetime-local" : f.type === "url" ? "url" : f.type}
                      value={String(val)}
                      onChange={(e) => set(f.key, e.target.value)}
                    />
                  )}
                  {f.help && <p className="muted small">{f.help}</p>}
                </>
              )}
            </div>
          );
        })}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Bekor qilish
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy || uploading}>
            {busy ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
