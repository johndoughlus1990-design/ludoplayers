const dots = [
  "bg-ludo-red",
  "bg-ludo-green",
  "bg-ludo-yellow",
  "bg-ludo-blue",
] as const;

export function BrandLogo() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-card p-2.5 shadow-md">
        {dots.map((c) => (
          <span key={c} className={`size-4 rounded-sm ${c}`} />
        ))}
      </div>
      <h1 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-wider text-foreground">
        Real Ludo Player
      </h1>
      <p className="mt-1 text-sm font-medium tracking-wide text-muted-foreground">
        Play. Battle. Enjoy.
      </p>
    </div>
  );
}
