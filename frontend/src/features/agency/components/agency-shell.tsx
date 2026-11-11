"use client";

import type { ReactNode } from "react";

import {
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Package,
  Plane,
  UserRound,
} from "lucide-react";

import { AppShellHeader } from "@/components/shared/app-shell-header";
import { IconSidebar } from "@/components/shared/icon-sidebar";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";

type AgencyTab = "dashboard" | "inquiries" | "packages" | "settings";
type SettingsSubTab = "templates" | "profile";

type AgencyShellProps = {
  children: ReactNode;
  activeTab: AgencyTab;
  activeSettingsSubTab?: SettingsSubTab;
  onSettingsSubTabChange?: (subTab: SettingsSubTab) => void;
};

const tabItems = [
  { label: "Overview", key: "dashboard" as const, icon: LayoutDashboard, href: "/agency" },
  { label: "Inquiries", key: "inquiries" as const, icon: MessageSquareText, href: "/agency/inquiries" },
  { label: "Packages", key: "packages" as const, icon: Package, href: "/agency/packages" },
  { label: "Profile", key: "settings" as const, icon: UserRound, href: "/agency/settings/profile" },
];

export function AgencyShell({
  children,
  activeTab,
  activeSettingsSubTab,
  onSettingsSubTabChange,
}: AgencyShellProps) {
  const showSettingsSubNav = activeTab === "settings" && !!onSettingsSubTabChange;

  return (
    <div className="flex min-h-screen overflow-hidden">
      <IconSidebar
        items={tabItems.map((item) => ({
          label: item.label,
          icon: item.icon,
          isActive: activeTab === item.key,
          href: item.href,
        }))}
        footerItems={[{ label: "Sign out", href: "/signin", icon: LogOut }]}
        brandHref="/agency"
        brandLabel="Agency dashboard"
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:ml-16">
        <AppShellHeader
          role="agency"
          brandMark={<Plane className="size-5 text-primary md:hidden" aria-hidden="true" />}
        />
        <main className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
          <PageContainer className="min-h-full pb-24 md:pb-5">
            {showSettingsSubNav && (
              <div
                aria-label="Profile and settings sections"
                className="mb-5 inline-flex items-center gap-1 rounded-md bg-muted p-1"
              >
                <Button
                  type="button"
                  variant={activeSettingsSubTab === "profile" ? "secondary" : "ghost"}
                  size="sm"
                  aria-pressed={activeSettingsSubTab === "profile"}
                  onClick={() => onSettingsSubTabChange?.("profile")}
                >
                  Profile
                </Button>
                <Button
                  type="button"
                  variant={activeSettingsSubTab === "templates" ? "secondary" : "ghost"}
                  size="sm"
                  aria-pressed={activeSettingsSubTab === "templates"}
                  onClick={() => onSettingsSubTabChange?.("templates")}
                >
                  Policy templates
                </Button>
              </div>
            )}
            {children}
          </PageContainer>
        </main>
      </div>
    </div>
  );
}
