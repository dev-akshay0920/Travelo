"use client";

import { useCallback, useEffect, useState } from "react";

import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { PackagesTab } from "@/features/agency/components/packages-tab";
import { getMyAgencyApi } from "@/features/agencies/api/agency.api";

export default function AgencyPackagesPage() {
  const [agencyId, setAgencyId] = useState<string | undefined>();

  const load = useCallback(async () => {
    try {
      const data = await getMyAgencyApi();
      setAgencyId(data.id);
    } catch {
      setAgencyId(undefined);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return (
    <AgencyModulePage tab="packages" title="Packages" description="Your travel packages and their availability.">
      <PackagesTab agencyId={agencyId} />
    </AgencyModulePage>
  );
}
