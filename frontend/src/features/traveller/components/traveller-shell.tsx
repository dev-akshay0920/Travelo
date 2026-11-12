"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Compass, Heart, MessageSquareText, Plane, User } from "lucide-react";

import { AppShellHeader } from "@/components/shared/app-shell-header";
import { IconSidebar } from "@/components/shared/icon-sidebar";
import { PageContainer } from "@/components/shared/page-container";

type TravellerShellProps = {
  children: ReactNode;
};

const sidebarNavItems = [
  { label: "Explore", href: "/traveller/explore", icon: Compass },
  { label: "Watchlist", href: "/traveller/watchlist", icon: Heart },
  { label: "My inquiries", href: "/traveller/inquiries", icon: MessageSquareText },
  { label: "Profile", href: "/traveller/profile", icon: User },
];

export function TravellerShell({ children }: TravellerShellProps) {
  const pathname = usePathname();
  const items = sidebarNavItems.map((item) => ({
    ...item,
    isActive: pathname === item.href || pathname.startsWith(`${item.href}/`),
  }));

  return (
    <div className="flex h-dvh overflow-hidden">
      <IconSidebar
        items={items}
        brandHref="/traveller/explore"
        brandLabel="Travora"
        sectionLabel="Travel workspace"
      />

      <div className="flex h-dvh min-w-0 flex-1 flex-col md:ml-60">
        <AppShellHeader
          role="traveller"
          greeting="Travel workspace"
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
