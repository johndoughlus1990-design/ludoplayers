import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Sign In — REAL LUDO PLAYER" },
      { name: "description", content: "Sign in or create an account to play REAL LUDO PLAYER." },
    ],
  }),
  component: AuthPage,
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Mode = "login" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");


  function validate(withConfirm: boolean) {
    if (!emailPattern.test(email.trim())) {
      toast.error("Enter a valid email address.");
      return false;
    }
    if (!password) {
      toast.error("Password is required.");
      return false;
    }
    if (withConfirm) {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return false;
      }
      if (password !== confirm) {
        toast.error("Passwords do not match.");
        return false;
      }
    }
    return true;
  }

  async function signIn() {
    if (busy || !validate(false)) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      toast.error(/invalid login credentials/i.test(error.message) ? "Incorrect email or password." : error.message);
      return;
    }
    navigate({ to: "/", replace: true });
  }

  async function signUp() {
    if (busy || !validate(true)) return;
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) {
      toast.error(/already registered|already exists/i.test(error.message)
        ? "An account already exists for this email. Please log in."
        : error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/", replace: true });
      return;
    }
    toast.success("Account created. Check your email to confirm your address.");
    setMode("login");
    setPassword("");
    setConfirm("");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 gold-gradient flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-primary-foreground">म</div>
          <h1 className="font-display text-2xl font-bold">REAL LUDO PLAYER</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mode === "login" ? "Sign in to continue" : "Create your account"}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
          <div className="mb-5 rounded-lg border border-border/60 bg-secondary/30 px-3 py-2 text-center text-xs text-muted-foreground">
            Sign in or create your account using email and password.
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input id="confirm" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
            )}

            {mode === "login" ? (
              <>
                <Button className="w-full" disabled={busy} onClick={signIn}>{busy ? "Please wait…" : "Login"}</Button>
                <p className="pt-1 text-center text-xs text-muted-foreground">Don't have an account?</p>
                <Button variant="outline" className="w-full" disabled={busy} onClick={() => { setMode("signup"); setConfirm(""); }}>Create Account</Button>
              </>
            ) : (
              <>
                <Button className="w-full" disabled={busy} onClick={signUp}>{busy ? "Please wait…" : "Create Account"}</Button>
                <p className="pt-1 text-center text-xs text-muted-foreground">Already have an account?</p>
                <Button variant="outline" className="w-full" disabled={busy} onClick={() => { setMode("login"); setConfirm(""); }}>Login</Button>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">By continuing you agree to play fair and follow the app rules.</p>
      </div>
    </main>
  );
}
