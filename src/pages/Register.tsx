import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import { useQuery } from "../hooks/useQuery";
import { assertConfigured, list } from "../lib/api";
import { supabase } from "../lib/supabase";
import type { ComputerLevel, Course } from "../types";
import { EmptyState, ErrorState, PageHero, Section, Spinner } from "../components/ui";
import { errMsg, normalizePhone } from "../lib/utils";

const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
const LEVELS: Array<{ v: ComputerLevel; l: string }> = [
  { v: "boshlang'ich", l: "Boshlang‘ich — kompyuterni endi o‘rganyapman" },
  { v: "o'rta", l: "O‘rta — asosiy dasturlar bilan ishlay olaman" },
  { v: "yuqori", l: "Yuqori — dasturlash bilan tanishman" },
];
const LS_KEY = "itex_last_application";
const COOLDOWN_MS = 60_000;

type Errors = Partial<Record<"full_name" | "grade" | "phone" | "parent_phone" | "course_id" | "consent", string>>;

export default function Register() {
  useSeo("To‘garakka yozilish", "ITEX IT to‘garagiga ariza yuboring: yo‘nalishni tanlang va ma’lumotlaringizni qoldiring.");
  const [params] = useSearchParams();
  const courses = useQuery(() => list<Course>("courses", { published: true, order: "sort_order", asc: true }));

  const [full_name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [school_name, setSchool] = useState("7-sonli maktab");
  const [phone, setPhone] = useState("");
  const [parent_phone, setParent] = useState("");
  const [course_id, setCourse] = useState(params.get("course") ?? "");
  const [level, setLevel] = useState<ComputerLevel>("boshlang'ich");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState(""); // honeypot
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const firstErr = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (done) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [done]);

  function validate(): { ok: boolean; phone?: string; parent?: string | null } {
    const e: Errors = {};
    if (full_name.trim().length < 3) e.full_name = "Ism-familiyani to‘liq kiriting.";
    if (!grade) e.grade = "Sinfni tanlang.";
    const p = normalizePhone(phone);
    if (!p) e.phone = "Telefon raqami noto‘g‘ri. Masalan: +998 90 123 45 67";
    let pp: string | null = null;
    if (parent_phone.trim()) {
      pp = normalizePhone(parent_phone);
      if (!pp) e.parent_phone = "Ota-ona telefon raqami noto‘g‘ri.";
    }
    if (!course_id) e.course_id = "Yo‘nalishni tanlang.";
    if (!consent) e.consent = "Davom etish uchun rozilik bildiring.";
    setErrors(e);
    if (Object.keys(e).length) {
      window.setTimeout(() => firstErr.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
    }
    return { ok: Object.keys(e).length === 0, phone: p ?? undefined, parent: pp };
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setFormError(null);
    if (trap) {
      setDone(true); // botlarga muvaffaqiyat ko'rsatamiz, lekin hech narsa yubormaymiz
      return;
    }
    const last = Number(localStorage.getItem(LS_KEY) ?? 0);
    if (Date.now() - last < COOLDOWN_MS) {
      setFormError("Ariza yaqinda yuborilgan. Iltimos, bir daqiqadan keyin qayta urinib ko‘ring.");
      return;
    }
    const v = validate();
    if (!v.ok || !v.phone) return;

    setBusy(true);
    try {
      assertConfigured();
      const { error } = await supabase.from("applications").insert({
        full_name: full_name.trim(),
        grade,
        school_name: school_name.trim() || null,
        phone: v.phone,
        parent_phone: v.parent ?? null,
        course_id,
        computer_level: level,
        comment: comment.trim() || null,
        consent: true,
      });
      if (error) throw error;
      localStorage.setItem(LS_KEY, String(Date.now()));
      setDone(true);
    } catch (e) {
      setFormError(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <>
        <PageHero title="Ariza yuborildi" />
        <Section>
          <div className="state state-success" role="status">
            <div className="state-icon" aria-hidden="true">
              ✓
            </div>
            <h3>Rahmat! Arizangiz qabul qilindi.</h3>
            <p>Tez orada siz bilan telefon orqali bog‘lanamiz.</p>
            <Link to="/" className="btn btn-primary">
              Bosh sahifaga qaytish
            </Link>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHero title="To‘garakka yozilish" text="Formani to‘ldiring. * belgisi majburiy maydonlarni bildiradi." />
      <Section>
        {courses.loading && <Spinner />}
        {courses.error && <ErrorState message={courses.error} onRetry={courses.reload} />}
        {!courses.loading && !courses.error && (courses.data?.length ?? 0) === 0 && (
          <EmptyState title="Hozircha qabul ochilmagan" text="Yo‘nalishlar qo‘shilgandan so‘ng ariza yuborish mumkin bo‘ladi." />
        )}
        {courses.data && courses.data.length > 0 && (
          <form className="form card" onSubmit={onSubmit} noValidate ref={firstErr}>
            <div className="field">
              <label htmlFor="full_name">O‘quvchining ism-familiyasi *</label>
              <input id="full_name" value={full_name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={120} aria-invalid={!!errors.full_name} aria-describedby="e-name" />
              {errors.full_name && <p className="field-error" id="e-name">{errors.full_name}</p>}
            </div>

            <div className="row-2">
              <div className="field">
                <label htmlFor="grade">Sinfi *</label>
                <select id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} aria-invalid={!!errors.grade}>
                  <option value="">Tanlang</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}-sinf
                    </option>
                  ))}
                </select>
                {errors.grade && <p className="field-error">{errors.grade}</p>}
              </div>
              <div className="field">
                <label htmlFor="school">Maktab nomi</label>
                <input id="school" value={school_name} onChange={(e) => setSchool(e.target.value)} maxLength={160} />
              </div>
            </div>

            <div className="row-2">
              <div className="field">
                <label htmlFor="phone">Telefon raqami *</label>
                <input id="phone" type="tel" inputMode="tel" placeholder="+998 90 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" aria-invalid={!!errors.phone} />
                {errors.phone && <p className="field-error">{errors.phone}</p>}
              </div>
              <div className="field">
                <label htmlFor="parent_phone">Ota-ona yoki vakil telefoni</label>
                <input id="parent_phone" type="tel" inputMode="tel" placeholder="+998 90 123 45 67" value={parent_phone} onChange={(e) => setParent(e.target.value)} aria-invalid={!!errors.parent_phone} />
                {errors.parent_phone && <p className="field-error">{errors.parent_phone}</p>}
              </div>
            </div>

            <div className="field">
              <label htmlFor="course">IT yo‘nalishi *</label>
              <select id="course" value={course_id} onChange={(e) => setCourse(e.target.value)} aria-invalid={!!errors.course_id}>
                <option value="">Tanlang</option>
                {courses.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              {errors.course_id && <p className="field-error">{errors.course_id}</p>}
            </div>

            <fieldset className="field">
              <legend>Kompyuter bilimlari darajasi *</legend>
              {LEVELS.map((l) => (
                <label key={l.v} className="radio">
                  <input type="radio" name="level" checked={level === l.v} onChange={() => setLevel(l.v)} />
                  <span>{l.l}</span>
                </label>
              ))}
            </fieldset>

            <div className="field">
              <label htmlFor="comment">Qo‘shimcha izoh</label>
              <textarea id="comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} />
            </div>

            {/* Honeypot: odamlar ko'rmaydi */}
            <div className="hp" aria-hidden="true">
              <label>
                Veb-sayt
                <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
              </label>
            </div>

            <div className="field">
              <label className="check">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={!!errors.consent} />
                <span>Shaxsiy ma’lumotlarim to‘garakka qabul qilish maqsadida qayta ishlanishiga roziman. *</span>
              </label>
              {errors.consent && <p className="field-error">{errors.consent}</p>}
            </div>

            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Yuborilmoqda..." : "Ariza yuborish"}
            </button>
          </form>
        )}
      </Section>
    </>
  );
}
