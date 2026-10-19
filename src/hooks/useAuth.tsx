import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { isConfigured, supabase } from "../lib/supabase";

interface AuthValue {
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

async function checkAdmin(session: Session | null): Promise<boolean> {
  if (!session) return false;
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", session.user.id)
    .maybeSingle();
  return !error && Boolean(data);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(isConfigured);

  useEffect(() => {
    if (!isConfigured) return;
    let alive = true;
    const apply = async (s: Session | null) => {
      const ok = await checkAdmin(s);
      if (!alive) return;
      setSession(s);
      setIsAdmin(ok);
      setLoading(false);
    };
    void supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      // Supabase ichki lock'ini bloklamaslik uchun keyingi tickda
      setTimeout(() => void apply(s), 0);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!(await checkAdmin(data.session))) {
      await supabase.auth.signOut();
      throw new Error("Bu hisobga administrator huquqi berilmagan.");
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(() => ({ session, isAdmin, loading, signIn, signOut }), [session, isAdmin, loading, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth faqat AuthProvider ichida ishlaydi");
  return ctx;
}
