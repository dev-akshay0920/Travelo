"use client";

import Link from "next/link";
import { Plane } from "lucide-react";

import { siteConfig } from "@/config/site.config";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="text-xl font-semibold tracking-tight text-foreground">
            {siteConfig.name}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
