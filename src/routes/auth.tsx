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

type Mode = "phone" | "email";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("phone");
  const [busy, setBusy] = useState(false);

  // phone state
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  // email state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const e164 = () => `+91${phone.replace(/\D/g, "").slice(-10)}`;

  async function handleGoogle() {
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
    navigate({ to: "/home" });
  }

  async function sendOtp() {
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: e164() });
    setBusy(false);
    if (error) {
      toast.error(
        /provider|not enabled|unsupported|sms/i.test(error.message)
          ? "Mobile OTP sign-in is not available yet. Please continue with Email or Google."
          : error.message,
      );
      return;
    }
    setOtpSent(true);
    toast.success("OTP sent to your mobile number.");
  }

  async function verifyOtp() {
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: e164(),
      token: otp.trim(),
      type: "sms",
    });
    setBusy(false);
    if (error) {
      toast.error("Invalid or expired OTP.");
      return;
    }
    navigate({ to: "/home" });
  }

  async function signIn() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/home" });
  }

  async function signUp() {
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/home" });
      return;
    }
    toast.success("Account created. Check your email to confirm your address.");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <BrandLogo />

        <div className="mt-7 rounded-2xl border border-border bg-card p-5 shadow-lg">
          <Button variant="brand" className="w-full" disabled={busy} onClick={handleGoogle}>
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium tracking-widest text-muted-foreground">OR</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {mode === "phone" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
                    +91
                  </span>
                  <Input
                    id="phone"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={otpSent}
                  />
                </div>
              </div>

              {!otpSent ? (
                <Button className="w-full" disabled={busy} onClick={sendOtp}>
                  Send OTP
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="••••••"
                      className="text-center text-lg tracking-[0.5em]"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" disabled={busy} onClick={verifyOtp}>
                    Verify OTP
                  </Button>
                  <button
                    type="button"
                    className="w-full text-xs text-muted-foreground underline"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                  >
                    Change number
                  </button>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={() => setMode("email")}>
                Continue with Email
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" disabled={busy} onClick={signIn}>
                Sign In
              </Button>
              <Button variant="outline" className="w-full" disabled={busy} onClick={signUp}>
                Create Account
              </Button>
              <div className="flex items-center justify-between text-xs">
                <Link to="/forgot-password" className="text-muted-foreground underline">
                  Forgot Password
                </Link>
                <button
                  type="button"
                  className="text-muted-foreground underline"
                  onClick={() => setMode("phone")}
                >
                  Use mobile number
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to play fair and follow the app rules.
        </p>
      </div>
    </main>
  );
}
