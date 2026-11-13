"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  MessageSquareText,
  PackageCheck,
  UserRoundCheck,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageStack } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDisplayDate } from "@/lib/date-format";
import { getAgencyDashboardApi } from "@/features/leads/api/leads.api";
import { LEAD_STATUS_LABELS } from "@/features/leads/types/lead.types";
import type { LeadDashboard } from "@/features/leads/types/lead.types";
import type { AgencyProfile } from "@/features/agencies/types/agency.types";

type AgencyOverviewProps = {
  agency: AgencyProfile | null;
  isAgencyLoading: boolean;
};

const agencyStatusCopy: Record<string, string> = {
  draft: "Complete your agency profile and submit it for review before it can be listed.",
  pending: "Your profile is being reviewed. You can prepare packages while you wait.",
  approved: "Your agency is approved and can be shown to travelers.",
  rejected: "Your agency was not approved. Review your profile and contact support for next steps.",
  suspended: "Your agency is not currently visible to travelers. Contact support for next steps.",
};

function getProfileChecklist(agency: AgencyProfile) {
  return [
    { label: "Agency name", complete: Boolean(agency.name.trim()) },
    { label: "About description", complete: Boolean(agency.about?.trim()) },
    { label: "Agency logo", complete: Boolean(agency.logo?.url) },
    {
      label: "Business location",
      complete: Boolean(agency.location?.city && agency.location?.country),
    },
    {
      label: "Public contact details",
      complete: Boolean(agency.contact?.phone && agency.contact?.email),
    },
    { label: "Services", complete: Boolean(agency.services?.length) },
  ];
}

export function AgencyOverview({ agency, isAgencyLoading }: AgencyOverviewProps) {
  const [dashboardResult, setDashboardResult] = useState<{
    agencyId: string;
    dashboard?: LeadDashboard;
    error?: string;
  } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!agency?.id) return;
    let cancelled = false;
    getAgencyDashboardApi()
      .then((dashboard) => {
        if (!cancelled) setDashboardResult({ agencyId: agency.id, dashboard });
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setDashboardResult({
            agencyId: agency.id,
            error: loadError instanceof Error && loadError.message
              ? loadError.message
              : "Could not load agency overview.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [agency?.id, reloadKey]);

  if (isAgencyLoading) return <LoadingState />;

  if (!agency?.id) {
    return (
      <PageStack>
        <PageHeader
          title="Agency overview"
          description="Set up your agency to manage packages and respond to traveler inquiries."
        />
        <EmptyState
          title="Create your agency profile"
          description="Your profile is the starting point for getting approved and receiving traveler inquiries."
          icon={<UserRoundCheck />}
          action={
            <Button asChild>
              <Link href="/agency/settings/profile">Create profile</Link>
            </Button>
          }
        />
      </PageStack>
    );
  }

  const currentResult = dashboardResult?.agencyId === agency.id ? dashboardResult : null;
  const dashboard = currentResult?.dashboard ?? null;
  const error = currentResult?.error ?? "";
  const isLoading = !dashboard && !error;
  const retry = () => {
    setDashboardResult(null);
    setReloadKey((key) => key + 1);
  };

  if (isLoading && !dashboard) return <LoadingState />;
  if (error && !dashboard) {
    return (
      <PageStack>
        <PageHeader title="Agency overview" description="Your current activity and next steps." />
        <ErrorState
          title="Overview unavailable"
          description={error}
          action={
            <Button type="button" variant="outline" onClick={retry}>
              Try again
            </Button>
          }
        />
      </PageStack>
    );
  }

  const profileChecklist = getProfileChecklist(agency);
  const completedItems = profileChecklist.filter((item) => item.complete).length;
  const statusMessage = agencyStatusCopy[agency.status] ?? "Review your profile to see what to do next.";

  return (
    <PageStack>
      <PageHeader
        title={`Welcome, ${agency.name}`}
        description="A clear view of your agency setup, packages, and traveler inquiries."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/agency/inquiries">
                Open inquiries <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/agency/packages">Manage packages</Link>
            </Button>
          </div>
        }
      />

      <Card size="sm">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>Agency status</CardTitle>
              <CardDescription>{statusMessage}</CardDescription>
            </div>
            <Badge variant={agency.status === "approved" ? "default" : "secondary"}>
              {agency.status.replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase())}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-body-sm text-muted-foreground">
            Profile readiness: {completedItems} of {profileChecklist.length} essentials complete
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/agency/settings/profile">Review profile</Link>
          </Button>
        </CardContent>
      </Card>

      {error && (
        <p role="status" className="text-body-sm text-destructive">
          Latest overview refresh failed: {error}
        </p>
      )}

      <section aria-label="Agency activity" className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader className="flex-row items-center justify-between">
            <div className="space-y-1">
              <CardDescription>Active packages</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {dashboard?.packages.activePublic ?? 0}
              </CardTitle>
            </div>
            <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <PackageCheck aria-hidden="true" className="size-4" />
            </span>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader className="flex-row items-center justify-between">
            <div className="space-y-1">
              <CardDescription>New inquiries</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {dashboard?.leads.byStatus.new ?? 0}
              </CardTitle>
            </div>
            <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <MessageSquareText aria-hidden="true" className="size-4" />
            </span>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader className="flex-row items-center justify-between">
            <div className="space-y-1">
              <CardDescription>In progress</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {(dashboard?.leads.byStatus.contacted ?? 0) +
                  (dashboard?.leads.byStatus.qualified ?? 0)}
              </CardTitle>
            </div>
            <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <UserRoundCheck aria-hidden="true" className="size-4" />
            </span>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Recent inquiries</CardTitle>
            <CardDescription>Latest messages from travelers.</CardDescription>
          </div>
          <ClipboardList aria-hidden="true" className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {dashboard?.leads.latest.length ? (
            <ul className="divide-y divide-border">
              {dashboard.leads.latest.map((lead) => (
                <li key={lead.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-body-sm font-medium text-foreground">{lead.travelerName}</p>
                    <p className="text-caption text-muted-foreground">
                      {lead.packageName ?? "Agency inquiry"} · {formatDisplayDate(lead.createdAt, "Date unavailable")}
                    </p>
                  </div>
                  <Badge variant={lead.status === "new" ? "default" : "secondary"}>
                    {LEAD_STATUS_LABELS[lead.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No inquiries yet"
              description="When a traveler contacts you about your agency or a package, it will appear here."
              icon={<PackageCheck />}
              action={
                <Button asChild variant="outline" size="sm">
                  <Link href="/agency/packages">Review your packages</Link>
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </PageStack>
  );
}
