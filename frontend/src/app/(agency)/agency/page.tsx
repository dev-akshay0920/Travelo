"use client";

import { useCallback, useEffect, useState } from "react";

import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { AgencyOverview } from "@/features/leads/components/agency-overview";
import { getMyAgencyApi } from "@/features/agencies/api/agency.api";
import type { AgencyProfile } from "@/features/agencies/types/agency.types";

export default function AgencyPage() {
  const [agency, setAgency] = useState<AgencyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMyAgencyApi();
      setAgency(data);
    } catch {
      setAgency(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return (
    <AgencyModulePage
      tab="dashboard"
      title="Dashboard"
      description="Overview of your agency's leads, bookings and revenue."
    >
      <AgencyOverview agency={agency} isAgencyLoading={isLoading} />
    </AgencyModulePage>
  );
}
