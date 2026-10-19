import { useMemo, useState } from "react";
import { useSeo } from "../hooks/useSeo";
import { useQuery } from "../hooks/useQuery";
import { list } from "../lib/api";
import type { Project } from "../types";
import { DataState, EmptyState, Img, PageHero, Section } from "../components/ui";
import { formatDate, safeUrl } from "../lib/utils";

export default function Projects() {
  useSeo("Loyihalar", "ITEX o‘quvchilarining amaliy IT loyihalari.");
  const q = useQuery(() => list<Project>("projects", { published: true, order: "created_at" }));
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (q.data ?? []).filter(
      (p) => !s || p.title.toLowerCase().includes(s) || p.author.toLowerCase().includes(s) || p.technologies.some((t) => t.toLowerCase().includes(s))
    );
  }, [q.data, search]);

  return (
    <>
      <PageHero title="O‘quvchilar loyihalari" text="To‘garak o‘quvchilari yaratgan amaliy ishlar." />
      <Section>
        <div className="toolbar">
          <input type="search" placeholder="Nomi, muallif yoki texnologiya..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Qidirish" />
        </div>
        <DataState {...q} onRetry={q.reload} emptyTitle="Loyihalar hali qo‘shilmagan" emptyText="O‘quvchilar ishlari tez orada shu yerda namoyish etiladi.">
          {() =>
            filtered.length === 0 ? (
              <EmptyState title="Hech narsa topilmadi" text="Boshqa so‘z bilan qidirib ko‘ring." />
            ) : (
              <div className="grid grid-3">
                {filtered.map((p) => {
                  const demo = safeUrl(p.demo_url);
                  const gh = safeUrl(p.github_url);
                  return (
                    <article key={p.id} className="card">
                      <Img src={p.image_url} alt={p.title} className="card-img" />
                      <h3>{p.title}</h3>
                      <p className="muted small">
                        {p.author}
                        {p.project_date ? `, ${formatDate(p.project_date)}` : ""}
                      </p>
                      <p className="muted">{p.description}</p>
                      {p.technologies.length > 0 && (
                        <ul className="tag-list">
                          {p.technologies.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      )}
                      {(demo || gh) && (
                        <div className="btn-row">
                          {demo && (
                            <a className="btn btn-primary btn-sm" href={demo} target="_blank" rel="noopener noreferrer">
                              Demo
                            </a>
                          )}
                          {gh && (
                            <a className="btn btn-ghost btn-sm" href={gh} target="_blank" rel="noopener noreferrer">
                              GitHub
                            </a>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )
          }
        </DataState>
      </Section>
    </>
  );
}
