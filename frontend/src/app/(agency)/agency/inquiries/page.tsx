"use client";

import { useCallback, useEffect, useState } from "react";

import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { InquiryInbox } from "@/features/leads/components/inquiry-inbox";
import { getMyAgencyApi } from "@/features/agencies/api/agency.api";

export default function AgencyInquiriesPage() {
  const [agencyId, setAgencyId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMyAgencyApi();
      setAgencyId(data.id);
    } catch {
      setAgencyId(undefined);
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
      tab="inquiries"
      title="Inquiries"
      description="Traveler inquiries across your leads."
    >
      <InquiryInbox agencyId={agencyId} isAgencyLoading={isLoading} />
    </AgencyModulePage>
  );
}
