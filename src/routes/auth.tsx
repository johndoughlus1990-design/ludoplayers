import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/home" });
  },
  head: () => ({
    meta: [
      { title: "Sign In — REAL LUDO PLAYER" },
      { name: "description", content: "Sign in to REAL LUDO PLAYER to play and battle." },
      { property: "og:title", content: "Sign In — REAL LUDO PLAYER" },
      { property: "og:description", content: "Sign in to REAL LUDO PLAYER to play and battle." },
    ],
  }),
  component: AuthPage,
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12c-.2 2-1.5 5-4.4 7l6.7 5.2c4-3.7 6.8-9.1 6.8-15.8z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.9 0 10.9-1.9 14.3-5.3l-6.7-5.2c-1.8 1.3-4.3 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.1l-7 5.4C8 41.2 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.5 28.6A13.6 13.6 0 0 1 10.8 24c0-1.6.3-3.2.7-4.6l-7-5.4A22 22 0 0 0 2 24c0 3.5.8 6.9 2.5 10l7-5.4z"
      />
      <path
        fill="#EA4335"
        d="M24 10.2c4.1 0 6.9 1.8 8.5 3.3l6-5.8C34.8 4.3 29.9 2 24 2 15.4 2 8 6.8 4.5 14l7 5.4C13.3 14 18.2 10.2 24 10.2z"
      />
    </svg>
  );
}

type Mode = "login" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function handleGoogle() {
    if (busy) return;
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/home", replace: true });
  }

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
      toast.error(
        /invalid login credentials/i.test(error.message)
          ? "Incorrect email or password."
          : error.message,
      );
      return;
    }
    navigate({ to: "/home", replace: true });
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
      toast.error(
        /already registered|already exists/i.test(error.message)
          ? "An account already exists for this email. Please log in."
          : error.message,
      );
      return;
    }
    if (data.session) {
      navigate({ to: "/home", replace: true });
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
        <BrandLogo />

        <div className="mt-7 rounded-2xl border border-border bg-card p-5 shadow-lg">
          <Button
            variant="brand"
            className="w-full gap-2"
            disabled={busy}
            onClick={handleGoogle}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium tracking-widest text-muted-foreground">OR</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
            )}

            {mode === "login" ? (
              <>
                <Button className="w-full" disabled={busy} onClick={signIn}>
                  {busy ? "Please wait…" : "Login"}
                </Button>
                <Link
                  to="/forgot-password"
                  className="block text-center text-xs text-muted-foreground underline"
                >
                  Forgot Password?
                </Link>
                <p className="pt-1 text-center text-xs text-muted-foreground">
                  Don&apos;t have an account?
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={busy}
                  onClick={() => {
                    setMode("signup");
                    setConfirm("");
                  }}
                >
                  Create Account
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full" disabled={busy} onClick={signUp}>
                  {busy ? "Please wait…" : "Create Account"}
                </Button>
                <p className="pt-1 text-center text-xs text-muted-foreground">
                  Already have an account?
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={busy}
                  onClick={() => {
                    setMode("login");
                    setConfirm("");
                  }}
                >
                  Login
                </Button>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to play fair and follow the app rules.
        </p>
      </div>
    </main>
  );
}
