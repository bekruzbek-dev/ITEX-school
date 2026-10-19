import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSeo } from "../../hooks/useSeo";
import { assertConfigured } from "../../lib/api";
import { errMsg } from "../../lib/utils";
import { Spinner } from "../../components/ui";

export default function AdminLogin() {
  useSeo("Administrator kirishi", "ITEX boshqaruv paneliga kirish");
  const { session, isAdmin, loading, signIn } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <Spinner />;
  if (session && isAdmin) return <Navigate to="/admin" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      assertConfigured();
      await signIn(email.trim(), password);
      const from = (loc.state as { from?: string } | null)?.from;
      nav(from && from.startsWith("/admin") ? from : "/admin", { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-center">
      <form className="card form login" onSubmit={onSubmit}>
        <h1>ITEX 🚀 boshqaruv</h1>
        <p className="muted">Administrator hisobi bilan kiring.</p>
        <div className="field">
          <label htmlFor="a-email">Email</label>
          <input id="a-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="a-pass">Parol</label>
          <input id="a-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Kirilmoqda..." : "Kirish"}
        </button>
      </form>
    </div>
  );
}
