import { Link, useParams } from "react-router-dom";
import { useQuery } from "../hooks/useQuery";
import { useSeo } from "../hooks/useSeo";
import { getById } from "../lib/api";
import type { NewsItem } from "../types";
import { ErrorState, Img, Section, Spinner } from "../components/ui";
import { formatDate } from "../lib/utils";

export default function NewsDetail() {
  const { id = "" } = useParams();
  const q = useQuery(() => getById<NewsItem>("news", id), [id]);
  useSeo(q.data?.title ?? "Yangilik", q.data?.summary || "ITEX yangiligi", q.data?.image_url);

  return (
    <Section>
      <Link to="/news" className="link-more">
        ← Barcha yangiliklar
      </Link>
      {q.loading && <Spinner />}
      {q.error && <ErrorState message={q.error} onRetry={q.reload} />}
      {!q.loading && !q.error && !q.data && (
        <div className="state state-empty">
          <h3>Yangilik topilmadi</h3>
          <p>U o‘chirilgan yoki hali e’lon qilinmagan bo‘lishi mumkin.</p>
        </div>
      )}
      {q.data && (
        <article className="article">
          <span className="badge">{q.data.category}</span>
          <h1>{q.data.title}</h1>
          <time className="muted">{formatDate(q.data.published_at)}</time>
          {q.data.image_url && <Img src={q.data.image_url} alt={q.data.title} className="article-img" />}
          {q.data.summary && <p className="lead">{q.data.summary}</p>}
          {q.data.content.split(/\n{2,}/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
      )}
    </Section>
  );
}
