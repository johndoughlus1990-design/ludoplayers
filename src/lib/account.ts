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
      if (!userId) return false;

      // Use the database SECURITY DEFINER helper instead of querying
      // user_roles directly. This avoids RLS/policy/cache issues.
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });

      if (error) throw error;
      return data === true;
    },
  });
}

export function walletTotal(w?: { deposit_cash: number | string; winning_cash: number | string; bonus_cash: number | string } | null) {
  if (!w) return 0;
  return Number(w.deposit_cash) + Number(w.winning_cash) + Number(w.bonus_cash);
}

export const phoneToEmail = (phone: string) => `p${phone}@funbattle.app`;
