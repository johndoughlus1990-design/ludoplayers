import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/_authenticated/set-password")({
  head: () => ({
    meta: [
      { title: "Create Your Password — REAL LUDO PLAYER" },
      {
        name: "description",
        content: "Add an email and password login to your REAL LUDO PLAYER account.",
      },
      { property: "og:title", content: "Create Your Password — REAL LUDO PLAYER" },
      {
        property: "og:description",
        content: "Add an email and password login to your REAL LUDO PLAYER account.",
      },
    ],
  }),
  component: SetPassword,
});

function SetPassword() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({
      password,
      data: { password_set: true },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password created. You can now sign in with your email.");
    navigate({ to: "/home", replace: true });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <BrandLogo />
        <div className="mt-7 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-lg">
          <h2 className="text-base font-semibold text-foreground">Create your login password</h2>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <Button className="w-full" disabled={busy} onClick={submit}>
            {busy ? "Please wait…" : "Create Password"}
          </Button>
          <p className="text-xs text-muted-foreground">
            You can use this password to sign in with your email next time.
          </p>
        </div>
      </div>
    </main>
  );
}
