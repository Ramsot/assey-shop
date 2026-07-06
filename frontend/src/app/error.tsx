"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="font-serif text-4xl font-medium text-ink">Something went wrong</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        We encountered an unexpected error. Please try again or return home.
      </p>
      <div className="mt-8 flex gap-4">
        <Button onClick={reset}>Try again</Button>
        <Button variant="ghost" asChild>
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
