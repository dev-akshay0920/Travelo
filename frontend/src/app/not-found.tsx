import Link from "next/link";

import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-[42rem] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          Page not found
        </h2>
      </div>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you are looking for does not exist or may have moved.
      </p>
      <Link
        href="/"
        className={cn(
          "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90",
        )}
      >
        Return home
      </Link>
    </div>
  );
}
