import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { hasPasswordLogin } from "@/lib/password-identity";

export const Route = createFileRoute("/_authenticated/home")({
  beforeLoad: ({ context }) => {
    // Social-only accounts get a one-time screen to add an email + password login.
    if (!hasPasswordLogin(context.user)) throw redirect({ to: "/set-password" });
  },
  head: () => ({
    meta: [
      { title: "Home — REAL LUDO PLAYER" },
      { name: "description", content: "Your REAL LUDO PLAYER home screen." },
      { property: "og:title", content: "Home — REAL LUDO PLAYER" },
      { property: "og:description", content: "Your REAL LUDO PLAYER home screen." },
    ],
  }),
  component: Home,
});

function Home() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm text-center">
        <BrandLogo />
        <div className="mt-7 rounded-2xl border border-border bg-card p-5 shadow-lg">
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="mt-1 truncate text-sm font-semibold text-foreground">
            {user?.email ?? user?.phone ?? "Player"}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Your game features will appear here.
          </p>
          <Button variant="outline" className="mt-5 w-full" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </main>
  );
}
