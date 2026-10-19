import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import { useQuery } from "../hooks/useQuery";
import { countRows, list } from "../lib/api";
import type { Achievement, Course, NewsItem, Project } from "../types";
import { DataState, Img, Section } from "../components/ui";
import { formatDate } from "../lib/utils";
import { CourseCard } from "./Courses";

const WHY = [
  { t: "Amaliyot birinchi o‘rinda", d: "Har bir mavzu real topshiriq va mini-loyiha bilan mustahkamlanadi." },
  { t: "Sinfingizga mos daraja", d: "Boshlang‘ich sinfdan yuqori sinfgacha — har bir o‘quvchi uchun yo‘nalish bor." },
  { t: "Loyihalaringiz ko‘rinadi", d: "Yaratgan ishlaringiz saytda namoyish etiladi va portfolioga aylanadi." },
  { t: "Xavfsiz raqamli muhit", d: "Internet va sun’iy intellektdan mas’uliyat bilan foydalanishni o‘rganasiz." },
];

const STEPS = [
  { t: "Ariza", d: "Saytda forma to‘ldirasiz va yo‘nalish tanlaysiz." },
  { t: "Aloqa", d: "Biz siz bilan telefon orqali bog‘lanamiz." },
  { t: "Mashg‘ulot", d: "Nazariya qisqa, amaliyot ko‘p: kompyuter oldida o‘rganasiz." },
  { t: "Loyiha", d: "O‘rganganingizni o‘z loyihangizda qo‘llaysiz va namoyish etasiz." },
];

const delay = (s: string) => ({ "--d": s }) as CSSProperties;

function Terminal() {
  return (
    <div className="terminal" aria-hidden="true">
      <div className="terminal-bar">
        <i />
        <i />
        <i />
        <span>itex.ts</span>
      </div>
      <pre>
        <span className="t-line" style={delay("0.3s")}>
          <b className="c-v">const</b> o‘quvchi = <b className="c-b">yangi</b>();
        </span>
        <span className="t-line" style={delay("1.1s")}>
          o‘quvchi.<b className="c-b">o‘rganadi</b>([<b className="c-g">"Web"</b>, <b className="c-g">"AI"</b>]);
        </span>
        <span className="t-line" style={delay("1.9s")}>
          <b className="c-v">await</b> o‘quvchi.<b className="c-b">loyihaYaratadi</b>();
        </span>
        <span className="t-line" style={delay("2.7s")}>
          <b className="c-m">// kelajak kaliti ✓</b>
        </span>
      </pre>
    </div>
  );
}

export default function Home() {
  useSeo("ITEX 🚀 — Raqamli bilim — kelajak kaliti!", "7-sonli maktab IT to‘garagi: dasturlash, sun’iy intellekt, grafik dizayn va kompyuter savodxonligi.");

  const courses = useQuery(() => list<Course>("courses", { published: true, order: "sort_order", asc: true, limit: 6 }));
  const news = useQuery(() => list<NewsItem>("news", { published: true, order: "published_at", limit: 3 }));
  const projects = useQuery(() => list<Project>("projects", { published: true, order: "created_at", limit: 3 }));
  const ach = useQuery(() => list<Achievement>("achievements", { published: true, order: "achievement_date", limit: 3 }));
  const stats = useQuery(async () => ({
    courses: await countRows("courses", { column: "is_published", value: true }),
    projects: await countRows("projects", { column: "is_published", value: true }),
    achievements: await countRows("achievements", { column: "is_published", value: true }),
  }));
  const s = stats.data;
  const statItems = s
    ? [
        { n: s.courses, l: "yo‘nalish" },
        { n: s.projects, l: "o‘quvchi loyihasi" },
        { n: s.achievements, l: "yutuq" },
      ].filter((x) => x.n > 0)
    : [];

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1 className="hero-title">ITEX 🚀</h1>
            <p className="hero-slogan">“Raqamli bilim — kelajak kaliti!”</p>
            <p className="lead">
              Kelajak kasblarini bugundan o‘rganing. Dasturlash, sun’iy intellekt va zamonaviy texnologiyalar orqali o‘z g‘oyalaringizni haqiqiy loyihalarga aylantiring.
            </p>
            <div className="btn-row">
              <Link to="/register" className="btn btn-primary">
                To‘garakka yozilish
              </Link>
              <Link to="/courses" className="btn btn-ghost">
                Yo‘nalishlarni ko‘rish
              </Link>
              <Link to="/projects" className="btn btn-ghost">
                Loyihalar bilan tanishish
              </Link>
            </div>
            {statItems.length > 0 && (
              <dl className="stats">
                {statItems.map((x) => (
                  <div key={x.l}>
                    <dt>{x.l}</dt>
                    <dd>{x.n}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <Terminal />
        </div>
      </section>

      <Section title="ITEX haqida" text="7-sonli umumiy o‘rta ta’lim maktabi huzuridagi IT to‘garagi." action={{ to: "/about", label: "Batafsil" }}>
        <p className="prose-narrow">
          ITEX — o‘quvchilarga zamonaviy IT bilimlarini o‘rgatish, ularni loyihalar yaratishga undash va raqamli ta’lim muhitini rivojlantirish uchun tashkil etilgan to‘garak. Biz Andijon viloyati, Baliqchi tumani, Barkamol MFYda joylashganmiz.
        </p>
      </Section>

      <Section title="Nima uchun ITEX?" tone="alt">
        <div className="grid grid-4">
          {WHY.map((w) => (
            <article key={w.t} className="card">
              <h3>{w.t}</h3>
              <p className="muted">{w.d}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="IT yo‘nalishlari" text="O‘zingizga mos yo‘nalishni tanlang." action={{ to: "/courses", label: "Barchasi" }}>
        <DataState {...courses} data={courses.data} onRetry={courses.reload} emptyTitle="Yo‘nalishlar hali qo‘shilmagan" emptyText="Tez orada bu yerda IT yo‘nalishlari paydo bo‘ladi.">
          {(items) => (
            <div className="grid grid-3">
              {items.map((c) => (
                <CourseCard key={c.id} course={c} compact />
              ))}
            </div>
          )}
        </DataState>
      </Section>

      <Section title="O‘quv jarayoni" text="Arizadan loyihagacha to‘rt qadam." tone="alt">
        <ol className="steps">
          {STEPS.map((x, i) => (
            <li key={x.t}>
              <span className="step-n">{i + 1}</span>
              <div>
                <h3>{x.t}</h3>
                <p className="muted">{x.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="So‘nggi yangiliklar" action={{ to: "/news", label: "Barcha yangiliklar" }}>
        <DataState {...news} onRetry={news.reload} emptyTitle="Hozircha yangiliklar yo‘q" emptyText="Birinchi yangilik e’lon qilinganda shu yerda ko‘rinadi.">
          {(items) => (
            <div className="grid grid-3">
              {items.map((n) => (
                <Link key={n.id} to={`/news/${n.id}`} className="card card-link">
                  <Img src={n.image_url} alt={n.title} className="card-img" />
                  <span className="badge">{n.category}</span>
                  <h3>{n.title}</h3>
                  <p className="muted">{n.summary}</p>
                  <time className="small muted">{formatDate(n.published_at)}</time>
                </Link>
              ))}
            </div>
          )}
        </DataState>
      </Section>

      <Section title="O‘quvchilar loyihalari" action={{ to: "/projects", label: "Barcha loyihalar" }} tone="alt">
        <DataState {...projects} onRetry={projects.reload} emptyTitle="Loyihalar hali qo‘shilmagan" emptyText="O‘quvchilar ishlari tez orada namoyish etiladi.">
          {(items) => (
            <div className="grid grid-3">
              {items.map((p) => (
                <article key={p.id} className="card">
                  <Img src={p.image_url} alt={p.title} className="card-img" />
                  <h3>{p.title}</h3>
                  <p className="muted small">{p.author}</p>
                  <p className="muted">{p.description}</p>
                </article>
              ))}
            </div>
          )}
        </DataState>
      </Section>

      <Section title="Yutuqlar va natijalar" action={{ to: "/achievements", label: "Barcha yutuqlar" }}>
        <DataState {...ach} onRetry={ach.reload} emptyTitle="Yutuqlar hali kiritilmagan" emptyText="Tanlov va olimpiada natijalari shu yerda e’lon qilinadi.">
          {(items) => (
            <div className="grid grid-3">
              {items.map((a) => (
                <article key={a.id} className="card">
                  <span className="badge">{a.category}</span>
                  <h3>{a.title}</h3>
                  <p className="muted">{a.description}</p>
                  <time className="small muted">{formatDate(a.achievement_date)}</time>
                </article>
              ))}
            </div>
          )}
        </DataState>
      </Section>

      <section className="cta">
        <div className="container">
          <h2>Kelajakni bugun boshlang</h2>
          <p className="lead">Ariza yuboring — biz siz bilan bog‘lanamiz.</p>
          <Link to="/register" className="btn btn-primary">
            To‘garakka yozilish
          </Link>
        </div>
      </section>
    </>
  );
}
