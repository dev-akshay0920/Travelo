"use client";

import type { ReactNode } from "react";

import { AppShellHeader } from "@/components/shared/app-shell-header";
import { IconSidebar } from "@/components/shared/icon-sidebar";
import { PageContainer } from "@/components/shared/page-container";
import { adminNavigation } from "@/config/role-navigation";
import { usePathname } from "next/navigation";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const items = adminNavigation.map((item) => ({
    label: item.label,
    href: item.href,
    icon: item.icon,
    isActive: pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)),
  }));

  return (
    <div className="flex h-dvh overflow-hidden">
      <IconSidebar
        items={items}
        brandHref="/admin"
        brandLabel="Travora"
        sectionLabel="Administration"
      />
      <div className="flex h-dvh min-w-0 flex-1 flex-col lg:ml-60">
        <AppShellHeader role="admin" greeting="Administration" />
        <main className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
          <PageContainer className="min-h-full pb-24 lg:pb-5">{children}</PageContainer>
        </main>
      </div>
    </div>
  );
}
