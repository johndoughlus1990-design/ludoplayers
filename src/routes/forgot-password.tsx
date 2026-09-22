import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — REAL LUDO PLAYER" },
      { name: "description", content: "Request a password reset link for your account." },
      { property: "og:title", content: "Reset Password — REAL LUDO PLAYER" },
      { property: "og:description", content: "Request a password reset link for your account." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <BrandLogo />
        <div className="mt-7 rounded-2xl border border-border bg-card p-5 shadow-lg">
          <h2 className="text-base font-semibold text-foreground">Forgot Password</h2>
          {sent ? (
            <p className="mt-3 text-sm text-muted-foreground">
              If an account exists for that email, a password reset link has been sent.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
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
              <Button className="w-full" disabled={busy} onClick={submit}>
                Send Reset Link
              </Button>
            </div>
          )}
          <Link to="/auth" className="mt-5 block text-center text-xs text-muted-foreground underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
