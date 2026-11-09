import type { ReactNode } from "react";

import { UserMenu } from "@/components/shared/user-menu";
import type { RoleKey } from "@/config/routes";

interface AppShellHeaderProps {
  role: RoleKey;
  greeting?: string;
  brandMark?: ReactNode;
}

export function AppShellHeader({
  role,
  greeting = "Welcome back",
  brandMark,
}: AppShellHeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-16 shrink-0 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {brandMark}
          <p className="truncate text-sm font-medium text-muted-foreground">
            {greeting}
          </p>
        </div>
        <UserMenu role={role} />
      </div>
    </header>
  );
}
