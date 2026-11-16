"use client";

import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { FollowUpReminderList } from "@/features/leads/components/follow-up-reminders";

export default function AgencyFollowUpsPage() {
  return (
    <AgencyModulePage
      tab="followups"
      title="Follow-ups"
      description="Stay on top of every reminder so no traveler is left waiting."
    >
      <FollowUpReminderList agencyId="" />
    </AgencyModulePage>
  );
}
