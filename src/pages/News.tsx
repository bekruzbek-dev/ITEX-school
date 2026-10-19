import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import { useQuery } from "../hooks/useQuery";
import { list } from "../lib/api";
import type { NewsItem } from "../types";
import { DataState, EmptyState, Img, PageHero, Section } from "../components/ui";
import { formatDate } from "../lib/utils";

export default function News() {
  useSeo("Yangiliklar", "ITEX IT to‘garagi yangiliklari va e’lonlari.");
  const q = useQuery(() => list<NewsItem>("news", { published: true, order: "published_at" }));
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");

  const cats = useMemo(() => Array.from(new Set((q.data ?? []).map((n) => n.category))).sort(), [q.data]);
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (q.data ?? []).filter(
      (n) => (!cat || n.category === cat) && (!s || n.title.toLowerCase().includes(s) || n.summary.toLowerCase().includes(s))
    );
  }, [q.data, search, cat]);

  return (
    <>
      <PageHero title="Yangiliklar" text="To‘garak hayotidan so‘nggi xabarlar." />
      <Section>
        <div className="toolbar">
          <input type="search" placeholder="Yangilik qidirish..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Qidirish" />
          <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Kategoriya">
            <option value="">Barcha kategoriyalar</option>
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <DataState {...q} data={q.data} onRetry={q.reload} emptyTitle="Hozircha yangiliklar yo‘q" emptyText="Yangiliklar e’lon qilinganda shu yerda paydo bo‘ladi.">
          {() =>
            filtered.length === 0 ? (
              <EmptyState title="Hech narsa topilmadi" text="Qidiruv so‘zini yoki kategoriyani o‘zgartirib ko‘ring." />
            ) : (
              <div className="grid grid-3">
                {filtered.map((n) => (
                  <Link key={n.id} to={`/news/${n.id}`} className="card card-link">
                    <Img src={n.image_url} alt={n.title} className="card-img" />
                    <span className="badge">{n.category}</span>
                    <h3>{n.title}</h3>
                    <p className="muted">{n.summary}</p>
                    <time className="small muted">{formatDate(n.published_at)}</time>
                  </Link>
                ))}
              </div>
            )
          }
        </DataState>
      </Section>
    </>
  );
}
