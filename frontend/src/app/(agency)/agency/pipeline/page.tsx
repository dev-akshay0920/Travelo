"use client";

import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { LeadPipelineGrid } from "@/features/leads/components/lead-pipeline-grid";

export default function AgencyPipelinePage() {
  return (
    <AgencyModulePage
      tab="pipeline"
      title="Pipeline"
      description="Define the stages your inquiries move through and keep every deal moving."
    >
      <LeadPipelineGrid agencyId="" />
    </AgencyModulePage>
  );
}
