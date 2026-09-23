import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({ component: Auth });

function Auth() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const continueWithGoogle = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
  };

  const continueWithEmail = async () => {
    setError("");
    const value = email.trim();
    if (!value) { setError("Enter your Gmail address."); return; }
    const { error } = await supabase.auth.signInWithOtp({
      email: value,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold">REAL LUDO PLAYER</h1>
          <p className="mt-2 text-sm text-muted-foreground">Continue to play</p>
        </div>

        <button onClick={continueWithGoogle} className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 font-semibold transition-colors hover:bg-muted">
          <Mail className="h-5 w-5" />
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /><span>OR</span><div className="h-px flex-1 bg-border" />
        </div>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="your@gmail.com"
          className="mb-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <button onClick={continueWithEmail} className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground">
          {sent ? "Magic link sent" : "Continue with Gmail"}
        </button>

        {sent && <p className="mt-3 text-center text-xs text-muted-foreground">Check your email and open the sign-in link.</p>}
        {error && <p className="mt-3 text-center text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
