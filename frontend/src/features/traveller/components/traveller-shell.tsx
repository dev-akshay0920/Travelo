"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Compass, Heart, LogOut, Plane, User } from "lucide-react";

import { AppShellHeader } from "@/components/shared/app-shell-header";
import { IconSidebar } from "@/components/shared/icon-sidebar";
import { PageContainer } from "@/components/shared/page-container";

type TravellerShellProps = {
  children: ReactNode;
};

const sidebarNavItems = [
  { label: "Explore", href: "/traveller/explore", icon: Compass },
  { label: "Watchlist", href: "/traveller/watchlist", icon: Heart },
  { label: "Profile", href: "/traveller/profile", icon: User },
];

export function TravellerShell({ children }: TravellerShellProps) {
  const pathname = usePathname();
  const items = sidebarNavItems.map((item) => ({
    ...item,
    isActive: pathname === item.href || pathname.startsWith(`${item.href}/`),
  }));

  return (
    <div className="flex min-h-screen overflow-hidden">
      <IconSidebar
        items={items}
        footerItems={[{ label: "Sign out", href: "/signin", icon: LogOut }]}
        brandHref="/traveller/explore"
        brandLabel="Traveller explore"
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:ml-16">
        <AppShellHeader
          role="traveller"
          brandMark={<Plane className="size-5 text-primary md:hidden" aria-hidden="true" />}
        />
        <main className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
          <PageContainer className="min-h-full pb-24 md:pb-5">
            {children}
          </PageContainer>
        </main>
      </div>
    </div>
  );
}
