import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, HelpCircle, ShieldCheck, User, LockKeyhole, LogOut } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, useProfile, useUser } from "@/lib/account";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useUser();
  const { data: profile, isLoading } = useProfile(user?.id);
  const { data: isAdmin } = useIsAdmin(user?.id);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [mpin, setMpin] = useState("");
  const [mpinSet, setMpinSet] = useState(() => !!localStorage.getItem("refwin_mpin_hash"));

  const won = profile?.battles_won ?? 0;
  const lost = profile?.battles_lost ?? 0;
  const total = won + lost;
  const winRate = total ? Math.round((won / total) * 100) : 0;

  async function hashMpin(value: string) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest)).map(x => x.toString(16).padStart(2, "0")).join("");
  }

  async function saveMpin() {
    if (!/^\d{4}$/.test(mpin)) { toast.error("MPIN must be exactly 4 digits."); return; }
    localStorage.setItem("refwin_mpin_hash", await hashMpin(mpin));
    setMpin("");
    setMpinSet(true);
    toast.success("MPIN saved for device quick unlock.");
  }

  function clearMpin() {
    localStorage.removeItem("refwin_mpin_hash");
    setMpinSet(false);
    toast.success("MPIN removed from this device.");
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message || "Logout failed.");
      return;
    }

    qc.clear();
    localStorage.removeItem("refwin_mpin_hash");
    toast.success("Logged out successfully.");
    await navigate({ to: "/auth" });
  }

  return (
    <AppShell>
      <div className="glow-gold rounded-2xl bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="gold-gradient grid h-16 w-16 place-items-center rounded-full text-primary-foreground">
            <User className="h-8 w-8" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-bold">
              {isLoading ? "Loading…" : (profile?.username ?? "Player")}
            </h1>
            <p className="truncate text-sm text-muted-foreground">{profile?.phone ?? "—"}</p>
            <Badge variant="secondary" className="mt-1 capitalize">
              KYC: {(profile?.kyc_status ?? "not_submitted").replace("_", " ")}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Won" value={won} />
        <Stat label="Lost" value={lost} />
        <Stat label="Win rate" value={`${winRate}%`} />
      </div>

      <div className="mt-5 grid gap-2">
        <Row to="/kyc" icon={<ShieldCheck className="h-5 w-5 text-primary" />} label="KYC verification" />
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-center gap-2"><LockKeyhole className="h-5 w-5 text-primary"/><p className="font-semibold">4-digit MPIN quick unlock</p></div>
          <p className="mt-1 text-xs text-muted-foreground">Optional device-local convenience. It does not replace your secure account authentication.</p>
          <div className="mt-3 flex gap-2">
            <input inputMode="numeric" maxLength={4} type="password" value={mpin} onChange={e=>setMpin(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder={mpinSet?"Enter new MPIN":"Set 4-digit MPIN"} className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm"/>
            <Button onClick={()=>void saveMpin()}>{mpinSet?"Change":"Set"}</Button>
            {mpinSet?<Button variant="outline" onClick={clearMpin}>Remove</Button>:null}
          </div>
        </div>
        <Row to="/rules" icon={<BookOpen className="h-5 w-5 text-primary" />} label="Rules & fair play" />
        <Row to="/support" icon={<HelpCircle className="h-5 w-5 text-primary" />} label="Help & support" />
        <Row to="/admin" icon={<ShieldCheck className="h-5 w-5 text-primary" />} label={isAdmin ? "Admin Panel" : "Admin Panel (admin only)"} />

        <Button
          type="button"
          variant="outline"
          onClick={() => void handleLogout()}
          className="mt-2 h-12 w-full border-destructive/40 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>

    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <p className="font-display text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Row({
  to,
  icon,
  label,
}: {
  to: "/kyc" | "/rules" | "/support" | "/admin";
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 text-sm">
      {icon}
      {label}
    </Link>
  );
}
