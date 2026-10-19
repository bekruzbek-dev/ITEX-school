import { useState } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "../components/ui";
import { isConfigured } from "../lib/supabase";

const ITEMS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/applications", label: "Arizalar" },
  { to: "/admin/courses", label: "IT yo‘nalishlari" },
  { to: "/admin/news", label: "Yangiliklar" },
  { to: "/admin/projects", label: "Loyihalar" },
  { to: "/admin/achievements", label: "Yutuqlar" },
  { to: "/admin/settings", label: "Sayt sozlamalari" },
  { to: "/admin/account", label: "Administrator hisobi" },
];

export default function AdminLayout() {
  const { session, isAdmin, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  if (!isConfigured) {
    return (
      <div className="admin-center">
        <div className="card">
          <h1>Supabase sozlanmagan</h1>
          <p className="muted">.env faylida VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY ni kiriting.</p>
        </div>
      </div>
    );
  }
  if (loading) return <Spinner label="Tekshirilmoqda..." />;
  if (!session || !isAdmin) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;

  return (
    <div className="admin">
      <aside className={open ? "admin-side open" : "admin-side"}>
        <div className="admin-brand">ITEX 🚀 <span className="muted small">boshqaruv</span></div>
        <nav aria-label="Admin menyusi">
          {ITEMS.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.end} onClick={() => setOpen(false)}>
              {i.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-side-foot">
          <p className="small muted" title={session.user.email ?? ""}>
            {session.user.email}
          </p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void signOut()}>
            Chiqish
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-top">
          <button type="button" className="burger admin-burger" aria-label="Menyu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <span />
            <span />
            <span />
          </button>
          <a className="link-more" href="/" target="_blank" rel="noopener noreferrer">
            Saytni ochish
          </a>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
