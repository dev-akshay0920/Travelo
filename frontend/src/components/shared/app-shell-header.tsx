import type { ReactNode } from "react";

import { UserMenu } from "@/components/shared/user-menu";
import type { RoleKey } from "@/config/routes";

interface AppShellHeaderProps {
  role: RoleKey;
  greeting?: string;
  brandMark?: ReactNode;
  brandName?: string;
}

export function AppShellHeader({
  role,
  greeting = "Welcome back",
  brandMark,
  brandName = "Travora",
}: AppShellHeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-14 shrink-0 border-b border-border bg-background">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground lg:hidden">
            {brandMark}
            {brandName}
          </span>
          <span className="hidden h-5 w-px bg-border lg:block" aria-hidden="true" />
          <p className="truncate text-body-sm text-muted-foreground">{greeting}</p>
        </div>
        <UserMenu role={role} />
      </div>
    </header>
  );
}
