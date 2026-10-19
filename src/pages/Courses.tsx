import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import { useQuery } from "../hooks/useQuery";
import { list } from "../lib/api";
import type { Course } from "../types";
import { DataState, PageHero, Section } from "../components/ui";

export function CourseCard({ course: c, compact }: { course: Course; compact?: boolean }) {
  return (
    <article className="card course">
      <div className="course-icon" aria-hidden="true">
        {c.icon}
      </div>
      <h3>{c.title}</h3>
      <p className="muted">{c.description}</p>
      <p className="badge">{c.level}</p>
      {!compact && (
        <>
          {c.topics.length > 0 && (
            <>
              <h4>O‘rganiladigan mavzular</h4>
              <ul className="tag-list">
                {c.topics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </>
          )}
          {c.practice.length > 0 && (
            <>
              <h4>Amaliy mashg‘ulotlar</h4>
              <ul className="plain-list">
                {c.practice.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </>
          )}
          {(c.duration || c.schedule) && (
            <dl className="meta">
              {c.duration && (
                <div>
                  <dt>Davomiyligi</dt>
                  <dd>{c.duration}</dd>
                </div>
              )}
              {c.schedule && (
                <div>
                  <dt>Dars jadvali</dt>
                  <dd>{c.schedule}</dd>
                </div>
              )}
            </dl>
          )}
        </>
      )}
      <Link to={`/register?course=${c.id}`} className="btn btn-primary btn-sm">
        Ro‘yxatdan o‘tish
      </Link>
    </article>
  );
}

export default function Courses() {
  useSeo("IT yo‘nalishlari", "Web dasturlash, sun’iy intellekt, kompyuter savodxonligi, grafik dizayn va algoritmlar yo‘nalishlari.");
  const q = useQuery(() => list<Course>("courses", { published: true, order: "sort_order", asc: true }));
  return (
    <>
      <PageHero title="IT yo‘nalishlari" text="Qiziqishingizga mos yo‘nalishni tanlang va ariza yuboring." />
      <Section>
        <DataState {...q} onRetry={q.reload} emptyTitle="Yo‘nalishlar hali qo‘shilmagan" emptyText="Administrator yo‘nalishlarni qo‘shganda shu yerda ko‘rinadi.">
          {(items) => (
            <div className="grid grid-2">
              {items.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </DataState>
      </Section>
    </>
  );
}
