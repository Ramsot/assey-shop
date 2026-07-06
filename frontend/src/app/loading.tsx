export default function Loading(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-ink" />
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Loading
        </span>
      </div>
    </div>
  );
}
