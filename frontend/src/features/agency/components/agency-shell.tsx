"use client";

import type { ReactNode } from "react";

import {
  BarChart3,
  Building2,
  CalendarCheck2,
  CheckSquare,
  Clock,
  CreditCard,
  FileText,
  FolderOpen,
  Kanban,
  LayoutDashboard,
  Map as MapIcon,
  MessageSquareText,
  Package,
  Plane,
  ReceiptText,
  UserRound,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";

import { AppShellHeader } from "@/components/shared/app-shell-header";
import { IconSidebar } from "@/components/shared/icon-sidebar";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";

export type AgencyTab =
  | "dashboard"
  | "inquiries"
  | "leads"
  | "packages"
  | "pipeline"
  | "followups"
  | "itineraries"
  | "quotations"
  | "bookings"
  | "invoices"
  | "suppliers"
  | "documents"
  | "tasks"
  | "staff"
  | "reports"
  | "billing"
  | "commission"
  | "departures"
  | "ledger"
  | "settings";
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
  { label: "Leads", key: "leads" as const, icon: Users, href: "/agency/leads" },
  { label: "Pipeline", key: "pipeline" as const, icon: Kanban, href: "/agency/pipeline" },
  { label: "Follow-ups", key: "followups" as const, icon: Clock, href: "/agency/followups" },
  { label: "Itineraries", key: "itineraries" as const, icon: MapIcon, href: "/agency/itineraries" },
  { label: "Quotations", key: "quotations" as const, icon: FileText, href: "/agency/quotations" },
  { label: "Bookings", key: "bookings" as const, icon: CalendarCheck2, href: "/agency/bookings" },
  { label: "Invoices", key: "invoices" as const, icon: ReceiptText, href: "/agency/invoices" },
  { label: "Ledger", key: "ledger" as const, icon: CreditCard, href: "/agency/payment-ledger" },
  { label: "Suppliers", key: "suppliers" as const, icon: Building2, href: "/agency/suppliers" },
  { label: "Documents", key: "documents" as const, icon: FolderOpen, href: "/agency/documents" },
  { label: "Tasks", key: "tasks" as const, icon: CheckSquare, href: "/agency/tasks" },
  { label: "Staff", key: "staff" as const, icon: UsersRound, href: "/agency/staff" },
  { label: "Reports", key: "reports" as const, icon: BarChart3, href: "/agency/reports" },
  { label: "Commission", key: "commission" as const, icon: Wallet, href: "/agency/commission" },
  { label: "Departures", key: "departures" as const, icon: CalendarCheck2, href: "/agency/departures" },
  { label: "Billing", key: "billing" as const, icon: CreditCard, href: "/agency/billing" },
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
    <div className="flex h-dvh overflow-hidden">
      <IconSidebar
        items={tabItems.map((item) => ({
          label: item.label,
          icon: item.icon,
          isActive: activeTab === item.key,
          href: item.href,
        }))}
        brandHref="/agency"
        brandLabel="Travora"
      />

      <div className="flex h-dvh min-w-0 flex-1 flex-col lg:ml-60">
        <AppShellHeader
          role="agency"
          greeting="Agency workspace"
          brandMark={<Plane className="size-5 text-primary lg:hidden" aria-hidden="true" />}
        />
        <main className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
          <PageContainer className="min-h-full pb-24 lg:pb-5">
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
