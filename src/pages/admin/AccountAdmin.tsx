import { useState, type FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { supabase } from "../../lib/supabase";
import { errMsg } from "../../lib/utils";

export default function AccountAdmin() {
  const { session, signOut } = useAuth();
  const toast = useToast();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pw.length < 10) return toast.error("Parol kamida 10 ta belgidan iborat bo‘lishi kerak.");
    if (pw !== pw2) return toast.error("Parollar bir xil emas.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(errMsg(error));
    toast.success("Parol yangilandi.");
    setPw("");
    setPw2("");
  }

  return (
    <>
      <h1>Administrator hisobi</h1>
      <div className="card form">
        <p>
          <span className="muted">Email: </span>
          {session?.user.email}
        </p>
        <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>
          Hisobdan chiqish
        </button>
      </div>
      <form className="card form" onSubmit={onSubmit} style={{ marginTop: "1.25rem" }}>
        <h2>Parolni o‘zgartirish</h2>
        <div className="field">
          <label htmlFor="p1">Yangi parol</label>
          <input id="p1" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="p2">Yangi parolni takrorlang</label>
          <input id="p2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Saqlanmoqda..." : "Parolni yangilash"}
        </button>
      </form>
    </>
  );
}
