"use client";

import { useState, useEffect } from "react";
import { LeadPipelineGrid } from "@/features/leads/components/lead-pipeline-grid";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function PipelinePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline Stages"
        description="Define your lead pipeline stages for tracking inquiries from new to won/lost."
        actions={
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground">Phase 1: Foundation</span>
          </div>
        }
      />

      <LeadPipelineGrid agencyId="1" />
    </div>
  );
}