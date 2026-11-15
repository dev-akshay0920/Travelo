"use client";

import { useState, useEffect } from "react";
import { FollowUpReminderList } from "@/features/leads/components/follow-up-reminders";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { FollowUpReminderListResponse } from "@/features/leads/types/lead.types";

export default function FollowupsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups"
        description="Reminders for leads that need your attention and upcoming deadlines."
        actions={
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground">Phase 1: Foundation</span>
          </div>
        }
      />

      <FollowUpReminderList agencyId="1" />
    </div>
  );
}