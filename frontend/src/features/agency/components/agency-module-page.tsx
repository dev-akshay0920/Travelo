"use client";

import type { ReactNode } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { PageStack } from "@/components/shared/page-container";

import { AgencyShell, type AgencyTab } from "./agency-shell";

export interface AgencyModulePageProps {
  tab: AgencyTab;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AgencyModulePage({
  tab,
  title,
  description,
  actions,
  children,
}: AgencyModulePageProps) {
  return (
    <AgencyShell activeTab={tab}>
      <PageStack>
        <PageHeader title={title} description={description} actions={actions} />
        {children}
      </PageStack>
    </AgencyShell>
  );
}
