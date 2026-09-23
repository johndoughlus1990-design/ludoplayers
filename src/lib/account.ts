import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      if (active) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  return { user, loading };
}

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useWallet(userId?: string) {
  return useQuery({
    queryKey: ["wallet", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("wallets").select("*").eq("user_id", userId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useIsAdmin(userId?: string) {
  return useQuery({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    queryFn: async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) return false;

      const sessionUser = authData.user;
      // Never trust a caller-supplied id; always use the authenticated session user.
      if (userId && sessionUser.id !== userId) return false;

      const { data, error } = await supabase.rpc("has_role", {
        _user_id: sessionUser.id,
        _role: "admin",
      });

      if (!error && data === true) return true;

      // Fallback for the explicitly configured owner-admin account. The backend
      // RPCs still enforce the real database role, so this only prevents the UI
      // from incorrectly hiding the admin panel while auth/role caches settle.
      const email = (sessionUser.email ?? "").toLowerCase().trim();
      return email === "hiteshkumarsharma631@gmail.com";
    },
  });
}

export function walletTotal(w?: { deposit_cash: number | string; winning_cash: number | string; bonus_cash: number | string } | null) {
  if (!w) return 0;
  return Number(w.deposit_cash) + Number(w.winning_cash) + Number(w.bonus_cash);
}

export const phoneToEmail = (phone: string) => `p${phone}@funbattle.app`;
