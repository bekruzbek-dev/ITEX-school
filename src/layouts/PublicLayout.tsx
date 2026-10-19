import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { isConfigured, supabase } from "../lib/supabase";
import type { SiteSettings } from "../types";
import { safeUrl } from "../lib/utils";

const LINKS = [
  { to: "/", label: "Bosh sahifa", end: true },
  { to: "/about", label: "ITEX haqida" },
  { to: "/courses", label: "Yo‘nalishlar" },
  { to: "/news", label: "Yangiliklar" },
  { to: "/projects", label: "Loyihalar" },
  { to: "/achievements", label: "Yutuqlar" },
  { to: "/contact", label: "Aloqa" },
];

function Logo() {
  return (
    <Link to="/" className="logo" aria-label="ITEX — bosh sahifa">
      <span className="logo-mark" aria-hidden="true">
        {"</>"}
      </span>
      <span>ITEX 🚀</span>
    </Link>
  );
}

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    if (!isConfigured) return;
    void supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => setSettings((data as SiteSettings | null) ?? null));
  }, []);

  const tg = safeUrl(settings?.telegram_url);

  return (
    <>
      <a href="#main" className="skip-link">
        Asosiy mazmunga o‘tish
      </a>
      <header className="nav">
        <div className="container nav-inner">
          <Logo />
          <button
            type="button"
            className="burger"
            aria-expanded={open}
            aria-controls="main-menu"
            aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav id="main-menu" className={open ? "nav-links open" : "nav-links"} aria-label="Asosiy menyu">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}>
                {l.label}
              </NavLink>
            ))}
            <Link to="/register" className="btn btn-primary btn-sm">
              Yozilish
            </Link>
          </nav>
        </div>
      </header>

      <main id="main">
        <Outlet context={settings} />
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Logo />
            <p className="muted">Raqamli bilim — kelajak kaliti!</p>
            <p className="muted small">7-sonli umumiy o‘rta ta’lim maktabi IT to‘garagi</p>
          </div>
          <div>
            <h4>Sahifalar</h4>
            <ul>
              {LINKS.slice(1, 6).map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/register">To‘garakka yozilish</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Aloqa</h4>
            <ul>
              <li>{settings?.address ?? "Andijon viloyati, Baliqchi tumani, Barkamol MFY"}</li>
              {settings?.phone && (
                <li>
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a>
                </li>
              )}
              {settings?.email && (
                <li>
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </li>
              )}
              {tg && (
                <li>
                  <a href={tg} target="_blank" rel="noopener noreferrer">
                    Telegram
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} ITEX 🚀. Barcha huquqlar himoyalangan.</span>
        </div>
      </footer>
    </>
  );
}
