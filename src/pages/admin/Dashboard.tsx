import { Link } from "react-router-dom";
import { useQuery } from "../../hooks/useQuery";
import { countRows } from "../../lib/api";
import { ErrorState, Spinner } from "../../components/ui";

export default function Dashboard() {
  const q = useQuery(async () => {
    const [total, fresh, courses, news, projects, achievements] = await Promise.all([
      countRows("applications"),
      countRows("applications", { column: "status", value: "new" }),
      countRows("courses"),
      countRows("news"),
      countRows("projects"),
      countRows("achievements"),
    ]);
    return { total, fresh, courses, news, projects, achievements };
  });

  if (q.loading) return <Spinner />;
  if (q.error || !q.data) return <ErrorState message={q.error ?? "Noma’lum xatolik"} onRetry={q.reload} />;
  const d = q.data;
  const cards = [
    { l: "Jami arizalar", n: d.total, to: "/admin/applications" },
    { l: "Yangi arizalar", n: d.fresh, to: "/admin/applications", hot: d.fresh > 0 },
    { l: "Yo‘nalishlar", n: d.courses, to: "/admin/courses" },
    { l: "Yangiliklar", n: d.news, to: "/admin/news" },
    { l: "Loyihalar", n: d.projects, to: "/admin/projects" },
    { l: "Yutuqlar", n: d.achievements, to: "/admin/achievements" },
  ];
  return (
    <>
      <h1>Dashboard</h1>
      <div className="grid grid-3">
        {cards.map((c) => (
          <Link key={c.l} to={c.to} className={c.hot ? "card card-link stat hot" : "card card-link stat"}>
            <span className="muted">{c.l}</span>
            <strong>{c.n}</strong>
          </Link>
        ))}
      </div>
    </>
  );
}
