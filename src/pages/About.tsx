import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import { PageHero, Section } from "../components/ui";

const GOALS = [
  "O‘quvchilarda dasturlash va raqamli ko‘nikmalarni shakllantirish",
  "Mantiqiy va tanqidiy fikrlashni rivojlantirish",
  "G‘oyalarni haqiqiy loyihalarga aylantirishga o‘rgatish",
  "Internet va sun’iy intellektdan xavfsiz hamda mas’uliyatli foydalanish madaniyatini berish",
  "Tanlov va olimpiadalarga tayyorlash",
];

const PRINCIPLES = [
  { t: "Amaliyot orqali o‘rganish", d: "Har bir dars kompyuter oldidagi aniq topshiriq bilan yakunlanadi." },
  { t: "Har bir o‘quvchi uchun yondashuv", d: "Bilim darajasi turlicha o‘quvchilar o‘z tezligida oldinga boradi." },
  { t: "Hamkorlik", d: "Jamoada ishlash va bir-biriga yordam berish rag‘batlantiriladi." },
  { t: "Halollik va xavfsizlik", d: "Akademik halollik, shaxsiy ma’lumotlar xavfsizligi va axloqiy foydalanish." },
];

export default function About() {
  useSeo("ITEX haqida", "ITEX IT to‘garagining maqsadi, vazifalari, ta’lim tamoyillari va kelajak rejalari.");
  return (
    <>
      <PageHero title="ITEX haqida" text="7-sonli umumiy o‘rta ta’lim maktabi IT to‘garagi — raqamli bilim va amaliy loyihalar maskani." />
      <Section title="Maqsadimiz">
        <p className="prose-narrow">
          O‘quvchilarga IT bilimlarini o‘rgatish, ularni to‘garakka jalb qilish, ishlarini namoyish etish va maktabda raqamli ta’lim muhitini yaratish. Auditoriyamiz: o‘quvchilar, ota-onalar, o‘qituvchilar va maktab rahbariyati.
        </p>
        <ul className="check-list">
          {GOALS.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </Section>
      <Section title="Ta’lim tamoyillari" tone="alt">
        <div className="grid grid-4">
          {PRINCIPLES.map((p) => (
            <article key={p.t} className="card">
              <h3>{p.t}</h3>
              <p className="muted">{p.d}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section title="Sizga beriladigan imkoniyatlar">
        <ul className="check-list">
          <li>Zamonaviy kasblar asoslarini maktabdayoq o‘rganish</li>
          <li>O‘z loyihangizni yaratib, saytda namoyish etish</li>
          <li>Tanlov va olimpiadalarda ishtirok etish</li>
          <li>Bir xil qiziqishdagi do‘stlar bilan jamoada ishlash</li>
        </ul>
      </Section>
      <Section title="Kelajak rejalari" tone="alt">
        <p className="prose-narrow">
          Yo‘nalishlarni kengaytirish, o‘quvchilar loyihalari ko‘rgazmasini o‘tkazish, tanlovlarda ishtirokni oshirish va ota-onalar uchun ochiq darslar tashkil etish.
        </p>
        <Link to="/register" className="btn btn-primary">
          To‘garakka yozilish
        </Link>
      </Section>
    </>
  );
}
