import { useSeo } from "../hooks/useSeo";
import { useQuery } from "../hooks/useQuery";
import { list } from "../lib/api";
import type { Achievement } from "../types";
import { DataState, Img, PageHero, Section } from "../components/ui";
import { formatDate } from "../lib/utils";

export default function Achievements() {
  useSeo("Yutuqlar", "ITEX o‘quvchilarining tanlov, olimpiada va tadbirlardagi yutuqlari.");
  const q = useQuery(() => list<Achievement>("achievements", { published: true, order: "achievement_date" }));
  return (
    <>
      <PageHero title="Yutuqlar" text="Tanlovlar, olimpiadalar, sertifikatlar va tadbirlar." />
      <Section>
        <DataState {...q} onRetry={q.reload} emptyTitle="Yutuqlar hali kiritilmagan" emptyText="Natijalar e’lon qilinganda shu yerda ko‘rinadi.">
          {(items) => (
            <div className="grid grid-3">
              {items.map((a) => (
                <article key={a.id} className="card">
                  {a.image_url && <Img src={a.image_url} alt={a.title} className="card-img" />}
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
    </>
  );
}
