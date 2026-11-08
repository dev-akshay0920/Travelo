"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getHomeRouteForRole } from "@/config/routes";

export default function UnauthorizedPage() {
  const homeRoute = getHomeRouteForRole("traveller");

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Access restricted</h1>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to access this area.
        </p>
        <Button asChild>
          <Link href={homeRoute}>Go to my dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
