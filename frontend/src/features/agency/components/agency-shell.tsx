"use client";

import type { ReactNode } from "react";

import { Plane, LogOut, LayoutDashboard, Package, Settings } from "lucide-react";
import { UserMenu } from "@/components/shared/user-menu";
import type { RoleKey } from "@/config/routes";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type AgencyShellProps = {
  children: ReactNode;
  activeTab: "dashboard" | "packages" | "settings";
  onTabChange: (tab: "dashboard" | "packages" | "settings") => void;
  activeSettingsSubTab?: "templates" | "profile";
  onSettingsSubTabChange?: (subTab: "templates" | "profile") => void;
};

const sidebarNavItems = [
  { label: "Dashboard", key: "dashboard" as const, icon: LayoutDashboard },
  { label: "Packages", key: "packages" as const, icon: Package },
  { label: "Settings", key: "settings" as const, icon: Settings },
];

const generalNavItems = [
  { label: "Logout", href: "/signin", icon: LogOut },
];

function SidebarItem({ item, isActive, onClick }: { item: { label: string; href?: string; icon: React.ComponentType<{ className?: string }> }; isActive?: boolean; onClick?: () => void }) {
  const Icon = item.icon;
  const baseClassName = cn(
    "inline-flex items-center justify-center rounded-xl transition-all duration-200",
    "h-11 w-11",
    isActive
      ? "bg-primary text-primary-foreground shadow-lg shadow-indigo-500/20"
      : "text-indigo-900/70 hover:bg-indigo-50 hover:text-indigo-900"
  );

  const inner = (
    <span className={baseClassName}>
      <Icon className="h-5 w-5" />
    </span>
  );

  if (item.href) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onClick?.();
            }}
            className="block"
          >
            {inner}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" onClick={onClick} className="block">
          {inner}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{item.label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function AgencyShell({ children, activeTab, onTabChange, activeSettingsSubTab, onSettingsSubTabChange }: AgencyShellProps) {
  const showSettingsSubNav = activeTab === "settings" && !!onSettingsSubTabChange;

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="fixed top-4 bottom-4 left-2 z-30 hidden md:flex">
        <div className="flex h-full w-16 flex-col items-center rounded-[10px] border-[5px] border-indigo-200/60 bg-white/80 backdrop-blur-2xl shadow-[1px_0_0_rgba(224,231,255,0.6),6px_0_24px_rgba(79,70,229,0.08)]">
          <div className="flex h-16 w-full items-center justify-center border-b border-indigo-100/60">
            <Plane className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <nav className="flex flex-1 flex-col items-center gap-3 overflow-y-auto custom-scrollbar py-6">
            {sidebarNavItems.map((item) => (
              <SidebarItem
                key={item.key}
                item={item}
                isActive={activeTab === item.key}
                onClick={() => onTabChange(item.key)}
              />
            ))}
          </nav>
          <nav className="flex flex-col items-center gap-3 border-t border-indigo-100/60 py-6">
            {generalNavItems.map((item) => (
              <SidebarItem key={item.href} item={item} />
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex flex-1 flex-col md:ml-[72px] h-screen overflow-hidden">
        <header className="sticky top-4 z-40 h-16 flex-shrink-0 glass-nav mx-4 rounded-[10px]">
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Plane className="h-5 w-5 text-primary md:hidden" aria-hidden="true" />
              <p className="text-sm font-medium text-indigo-900/80">Welcome back</p>
            </div>
            <UserMenu role={"agency" as RoleKey} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="mx-auto h-full w-full max-w-7xl px-4 py-6 sm:px-6">
            {showSettingsSubNav && (
              <div className="mb-6 inline-flex items-center gap-1 rounded-md bg-muted p-1 text-muted-foreground">
                <button
                  type="button"
                  onClick={() => onSettingsSubTabChange?.("profile")}
                  data-state={activeSettingsSubTab === "profile" ? "active" : "inactive"}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-[5px] px-3 py-1.5 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => onSettingsSubTabChange?.("templates")}
                  data-state={activeSettingsSubTab === "templates" ? "active" : "inactive"}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-[5px] px-3 py-1.5 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Templates
                </button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
