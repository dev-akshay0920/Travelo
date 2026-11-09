"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { Plane } from "lucide-react";
import { UserMenu } from "@/components/shared/user-menu";
import { PageContainer } from "@/components/shared/page-container";
import { adminNavigation } from "@/config/role-navigation";
import { APP_NAME } from "@/lib/constants";
import type { RoleKey } from "@/config/routes";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="sticky top-0 z-40 flex-shrink-0 glass-nav">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="text-xl font-semibold tracking-tight text-foreground">{APP_NAME}</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {adminNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <UserMenu role={"admin" as RoleKey} />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <PageContainer>{children}</PageContainer>
      </main>
    </div>
  );
}
