import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { type ReactNode } from "react";
import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="gold-text text-7xl font-bold">404</h1><h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2><p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try again or head back home.</p><Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Go home</Link></div></div>;
}
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const message = error?.message || String(error || "Unknown error");
  const stack = error?.stack || "";
  return <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8"><div className="w-full max-w-2xl rounded-xl border border-destructive/30 bg-card p-6 shadow-lg"><h1 className="text-xl font-semibold tracking-tight text-foreground">App Error</h1><p className="mt-2 text-sm text-muted-foreground">The application hit a runtime error. The details below are shown so the exact problem can be fixed.</p><pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted p-4 text-xs text-foreground">{message}</pre>{stack && <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted p-4 text-[10px] text-muted-foreground">{stack}</pre>}<div className="mt-5 flex gap-3"><button onClick={reset} className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Try again</button><Link to="/" className="inline-flex rounded-md border px-4 py-2 text-sm font-medium">Home</Link></div></div></div>;
}
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({ meta: [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    { title: "REAL LUDO PLAYER" },
    { name: "description", content: "Play. Battle. Enjoy." },
    { property: "og:title", content: "REAL LUDO PLAYER" },
    { property: "og:description", content: "Play. Battle. Enjoy." },
    { property: "og:type", content: "website" },
    { name: "theme-color", content: "#141b2e" },
  ], links: [
    { rel: "stylesheet", href: appCss },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&display=swap" },
    { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
  ]}),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
function RootShell({ children }: { children: ReactNode }) {
  return <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>;
}
function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return <QueryClientProvider client={queryClient}><Outlet /><Toaster position="top-center" richColors /></QueryClientProvider>;
}
