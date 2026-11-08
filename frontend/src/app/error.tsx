"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-2xl font-semibold text-foreground">
        Something went wrong
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        A problem occurred while loading this page. You can try again or
        return home.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => reset()}
          className={cn(
            "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90",
          )}
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className={cn(
            "rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted",
          )}
        >
          Go home
        </button>
      </div>
    </div>
  );
}