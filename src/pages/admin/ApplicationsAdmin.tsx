import { useMemo, useState } from "react";
import { useQuery } from "../../hooks/useQuery";
import { useToast } from "../../hooks/useToast";
import { list } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import type { Application, ApplicationStatus } from "../../types";
import { ConfirmDialog, DataState, EmptyState, Modal } from "../../components/ui";
import { STATUS_LABELS, errMsg, formatDate } from "../../lib/utils";

export default function ApplicationsAdmin() {
  const q = useQuery(() => list<Application>("applications", { order: "created_at" }));
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | ApplicationStatus>("");
  const [view, setView] = useState<Application | null>(null);
  const [del, setDel] = useState<Application | null>(null);
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (q.data ?? []).filter(
      (a) =>
        (!status || a.status === status) &&
        (!s || a.full_name.toLowerCase().includes(s) || a.phone.includes(s) || (a.course_title ?? "").toLowerCase().includes(s))
    );
  }, [q.data, search, status]);

  async function setSt(a: Application, next: ApplicationStatus) {
    const { error } = await supabase.from("applications").update({ status: next }).eq("id", a.id);
    if (error) return toast.error(errMsg(error));
    toast.success("Ariza holati yangilandi.");
    setView((v) => (v && v.id === a.id ? { ...v, status: next } : v));
    q.reload();
  }

  async function remove() {
    if (!del) return;
    setBusy(true);
    const { error } = await supabase.from("applications").delete().eq("id", del.id);
    setBusy(false);
    if (error) return toast.error(errMsg(error));
    toast.success("Ariza o‘chirildi.");
    setDel(null);
    q.reload();
  }

  return (
    <>
      <h1>Arizalar</h1>
      <div className="toolbar">
        <input type="search" placeholder="Ism, telefon yoki yo‘nalish..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Qidirish" />
        <select value={status} onChange={(e) => setStatus(e.target.value as "" | ApplicationStatus)} aria-label="Holat bo‘yicha filtr">
          <option value="">Barcha holatlar</option>
          {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((k) => (
            <option key={k} value={k}>
              {STATUS_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      <DataState {...q} onRetry={q.reload} emptyTitle="Hozircha arizalar yo‘q" emptyText="Saytdan ariza kelganda shu yerda ko‘rinadi.">
        {() =>
          rows.length === 0 ? (
            <EmptyState title="Hech narsa topilmadi" text="Qidiruv yoki filtrni o‘zgartiring." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>O‘quvchi</th>
                    <th>Sinf</th>
                    <th>Telefon</th>
                    <th>Yo‘nalish</th>
                    <th>Sana</th>
                    <th>Holat</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => (
                    <tr key={a.id}>
                      <td data-label="O‘quvchi">{a.full_name}</td>
                      <td data-label="Sinf">{a.grade}</td>
                      <td data-label="Telefon">
                        <a href={`tel:${a.phone}`}>{a.phone}</a>
                      </td>
                      <td data-label="Yo‘nalish">{a.course_title ?? "—"}</td>
                      <td data-label="Sana">{formatDate(a.created_at)}</td>
                      <td data-label="Holat">
                        <select className={`status st-${a.status}`} value={a.status} onChange={(e) => void setSt(a, e.target.value as ApplicationStatus)} aria-label={`${a.full_name} holati`}>
                          {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((k) => (
                            <option key={k} value={k}>
                              {STATUS_LABELS[k]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setView(a)}>
                          Ko‘rish
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => setDel(a)}>
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

      {view && (
        <Modal title="Ariza ma’lumotlari" onClose={() => setView(null)}>
          <dl className="contact-list">
            <div><dt>Ism-familiya</dt><dd>{view.full_name}</dd></div>
            <div><dt>Sinf</dt><dd>{view.grade}-sinf</dd></div>
            <div><dt>Maktab</dt><dd>{view.school_name ?? "—"}</dd></div>
            <div><dt>Telefon</dt><dd>{view.phone}</dd></div>
            <div><dt>Ota-ona telefoni</dt><dd>{view.parent_phone ?? "—"}</dd></div>
            <div><dt>Yo‘nalish</dt><dd>{view.course_title ?? "—"}</dd></div>
            <div><dt>Kompyuter darajasi</dt><dd>{view.computer_level}</dd></div>
            <div><dt>Izoh</dt><dd>{view.comment ?? "—"}</dd></div>
            <div><dt>Yuborilgan</dt><dd>{formatDate(view.created_at)}</dd></div>
          </dl>
          <div className="field">
            <label htmlFor="v-status">Holat</label>
            <select id="v-status" value={view.status} onChange={(e) => void setSt(view, e.target.value as ApplicationStatus)}>
              {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((k) => (
                <option key={k} value={k}>
                  {STATUS_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
        </Modal>
      )}

      {del && (
        <ConfirmDialog
          title="Arizani o‘chirish"
          text={`“${del.full_name}” arizasi butunlay o‘chiriladi. Bu amalni qaytarib bo‘lmaydi.`}
          busy={busy}
          onConfirm={() => void remove()}
          onCancel={() => setDel(null)}
        />
      )}
    </>
  );
}
