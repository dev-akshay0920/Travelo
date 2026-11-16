"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { PageStack } from "@/components/shared/page-container";

import { AgencyShell, type AgencyTab } from "./agency-shell";

export interface AgencyModulePageProps {
  tab: AgencyTab;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  settingsSubTab?: "profile" | "templates";
  onSettingsSubTabChange?: (subTab: "profile" | "templates") => void;
}

export function AgencyModulePage({
  tab,
  title,
  description,
  actions,
  children,
  settingsSubTab,
  onSettingsSubTabChange,
}: AgencyModulePageProps) {
  const [subTab, setSubTab] = useState<"profile" | "templates">("profile");
  const activeSubTab = settingsSubTab ?? subTab;
  const handleSettingsSubTabChange = useCallback(
    (next: "profile" | "templates") => {
      setSubTab(next);
      onSettingsSubTabChange?.(next);
    },
    [onSettingsSubTabChange],
  );

  return (
    <AgencyShell
      activeTab={tab}
      activeSettingsSubTab={activeSubTab}
      onSettingsSubTabChange={handleSettingsSubTabChange}
    >
      <PageStack>
        <PageHeader title={title} description={description} actions={actions} />
        {children}
      </PageStack>
    </AgencyShell>
  );
}
