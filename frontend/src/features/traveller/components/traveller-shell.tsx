"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { Plane } from "lucide-react";
import { UserMenu } from "@/components/shared/user-menu";
import { travellerNavigation } from "@/config/role-navigation";
import { APP_NAME } from "@/lib/constants";
import type { RoleKey } from "@/config/routes";

type TravellerShellProps = {
  children: ReactNode;
};

export function TravellerShell({ children }: TravellerShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="sticky top-0 z-40 flex-shrink-0 glass-nav">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/traveller" className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="text-xl font-semibold tracking-tight text-foreground">{APP_NAME}</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {travellerNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-indigo-900/70 transition-colors hover:text-indigo-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <UserMenu role={"traveller" as RoleKey} />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</div>
      </main>
    </div>
  );
}
