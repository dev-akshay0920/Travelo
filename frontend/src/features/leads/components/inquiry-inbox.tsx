"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MessageSquareText } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageStack } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDisplayDate } from "@/lib/date-format";
import { getAgencyLeadsApi, updateLeadApi } from "@/features/leads/api/leads.api";
import { LEAD_STATUS_LABELS } from "@/features/leads/types/lead.types";
import type { Lead, LeadListResponse, LeadStatus } from "@/features/leads/types/lead.types";
import { getPackagesApi } from "@/features/packages/api/package.api";
import type { TravelPackage } from "@/features/packages/types/package.types";

type InquiryInboxProps = {
  agencyId?: string;
  isAgencyLoading: boolean;
};

function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant={status === "new" ? "default" : status === "closed" ? "secondary" : "outline"}>
      {LEAD_STATUS_LABELS[status]}
    </Badge>
  );
}

export function InquiryInbox({ agencyId, isAgencyLoading }: InquiryInboxProps) {
  const [selected, setSelected] = useState<Lead | null>(null);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [draftStatus, setDraftStatus] = useState<LeadStatus>("new");
  const [draftNote, setDraftNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [packageResult, setPackageResult] = useState<{
    agencyId: string;
    packages?: TravelPackage[];
    error?: string;
  } | null>(null);
  const [listResult, setListResult] = useState<{
    key: string;
    data?: LeadListResponse;
    error?: string;
  } | null>(null);

  const queryKey = `${agencyId ?? ""}:${page}:${statusFilter}:${packageFilter}:${reloadKey}`;
  const currentListResult = listResult?.key === queryKey ? listResult : null;
  const items = currentListResult?.data?.items ?? [];
  const total = currentListResult?.data?.total ?? 0;
  const totalPages = currentListResult?.data?.totalPages ?? 0;
  const error = currentListResult?.error ?? "";
  const isLoading = Boolean(agencyId) && !isAgencyLoading && !currentListResult;
  const currentPackageResult = packageResult?.agencyId === agencyId ? packageResult : null;
  const packages = currentPackageResult?.packages ?? [];
  const packageLoadError = currentPackageResult?.error ?? "";

  useEffect(() => {
    if (!agencyId || isAgencyLoading) return;
    let cancelled = false;
    getPackagesApi({ agencyId, limit: 50 })
      .then((result) => {
        if (!cancelled) setPackageResult({ agencyId, packages: result.items });
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setPackageResult({
            agencyId,
            error: loadError instanceof Error && loadError.message
              ? loadError.message
              : "Could not load package filters.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [agencyId, isAgencyLoading]);

  useEffect(() => {
    if (!agencyId || isAgencyLoading) return;
    let cancelled = false;
    getAgencyLeadsApi({
      page,
      limit: 10,
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      ...(packageFilter !== "all" ? { packageId: packageFilter } : {}),
    })
      .then((result) => {
        if (cancelled) return;
        setListResult({ key: queryKey, data: result });
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setListResult({
            key: queryKey,
            error: loadError instanceof Error && loadError.message
              ? loadError.message
              : "Could not load inquiries.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [agencyId, isAgencyLoading, packageFilter, page, queryKey, statusFilter]);

  const openLead = (lead: Lead) => {
    setSelected(lead);
    setDraftStatus(lead.status);
    setDraftNote(lead.agencyNote);
    setSaveError("");
  };

  const saveLead = async () => {
    if (!selected) return;
    setIsSaving(true);
    setSaveError("");
    try {
      const updated = await updateLeadApi(selected.id, {
        status: draftStatus,
        agencyNote: draftNote,
      });
      setSelected(updated);
      setReloadKey((key) => key + 1);
      toast.success("Inquiry updated.");
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : "Could not update inquiry.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isAgencyLoading) return <LoadingState />;

  if (!agencyId) {
    return (
      <PageStack>
        <PageHeader title="Inquiries" description="Review and respond to traveler messages." />
        <EmptyState
          title="Create your agency profile first"
          description="Once your agency profile exists, inquiries will be organized here."
          icon={<MessageSquareText />}
          action={
            <Button asChild>
              <Link href="/agency/settings/profile">Create profile</Link>
            </Button>
          }
        />
      </PageStack>
    );
  }

  return (
    <PageStack>
      <PageHeader
        title="Inquiries"
        description={`${total} ${total === 1 ? "traveler message" : "traveler messages"} received by your agency.`}
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <Label htmlFor="inquiry-status-filter">Filter by status</Label>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as LeadStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger id="inquiry-status-filter" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All inquiries</SelectItem>
              {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="inquiry-package-filter">Filter by package</Label>
          <Select
            value={packageFilter}
            onValueChange={(value) => {
              setPackageFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger id="inquiry-package-filter" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All packages</SelectItem>
              {packages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
          Refresh
        </Button>
      </div>
      {packageLoadError && (
        <p role="alert" className="text-body-sm text-destructive">
          Package filter unavailable: {packageLoadError}
        </p>
      )}

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState
          title="Could not load inquiries"
          description={error}
          action={<Button variant="outline" onClick={() => setReloadKey((key) => key + 1)}>Try again</Button>}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={statusFilter === "all" ? "No inquiries yet" : `No ${LEAD_STATUS_LABELS[statusFilter]} inquiries`}
          description="New traveler messages will appear here. Keep your public packages up to date to help travelers decide."
          icon={<MessageSquareText />}
          action={
            <Button asChild variant="outline">
              <Link href="/agency/packages">Review packages</Link>
            </Button>
          }
        />
      ) : (
        <>
          <Card className="hidden overflow-hidden gap-0 p-0 shadow-none md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Traveler</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.travelerName}</TableCell>
                    <TableCell>{lead.packageName ?? "Agency inquiry"}</TableCell>
                    <TableCell>{formatDisplayDate(lead.createdAt, "Date unavailable")}</TableCell>
                    <TableCell><LeadStatusBadge status={lead.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button type="button" variant="outline" size="sm" onClick={() => openLead(lead)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="space-y-3 md:hidden">
            {items.map((lead) => (
              <Card key={lead.id} size="sm">
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-body font-medium text-foreground">{lead.travelerName}</p>
                      <p className="text-body-sm text-muted-foreground">{lead.packageName ?? "Agency inquiry"}</p>
                    </div>
                    <LeadStatusBadge status={lead.status} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-caption text-muted-foreground">
                      {formatDisplayDate(lead.createdAt, "Date unavailable")}
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={() => openLead(lead)}>
                      View inquiry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent aria-describedby="inquiry-detail-description">
          {selected && (
            <>
              <SheetHeader>
                <div className="min-w-0">
                  <SheetTitle>Traveler inquiry</SheetTitle>
                  <SheetDescription id="inquiry-detail-description">
                    Received {formatDisplayDate(selected.createdAt, "Date unavailable")}
                  </SheetDescription>
                </div>
                <LeadStatusBadge status={selected.status} />
              </SheetHeader>
              <SheetBody className="space-y-5 p-5">
                <section className="space-y-1">
                  <h3 className="text-body-sm font-semibold">Traveler</h3>
                  <p className="text-body-sm">{selected.travelerName}</p>
                  <a
                    className="inline-flex items-center gap-2 text-body-sm text-primary hover:underline"
                    href={`mailto:${selected.travelerEmail}`}
                  >
                    <Mail aria-hidden="true" className="size-4" />
                    {selected.travelerEmail}
                  </a>
                </section>
                <section className="space-y-1">
                  <h3 className="text-body-sm font-semibold">Interested in</h3>
                  <p className="text-body-sm">{selected.packageName ?? "Agency profile"}</p>
                </section>
                <section className="space-y-1">
                  <h3 className="text-body-sm font-semibold">Message</h3>
                  <p className="whitespace-pre-wrap break-words rounded-lg bg-muted p-3 text-body-sm">
                    {selected.message}
                  </p>
                </section>
                {(selected.requestedStartDate || selected.travelerCount) && (
                  <section className="space-y-1">
                    <h3 className="text-body-sm font-semibold">Trip details</h3>
                    {selected.requestedStartDate && (
                      <p className="text-body-sm">
                        Preferred date: {formatDisplayDate(selected.requestedStartDate, "Date unavailable")}
                      </p>
                    )}
                    {selected.travelerCount && (
                      <p className="text-body-sm">Travelers: {selected.travelerCount}</p>
                    )}
                  </section>
                )}
                <div className="space-y-2">
                  <Label htmlFor="inquiry-status">Update status</Label>
                  <Select
                    value={draftStatus}
                    onValueChange={(value) => setDraftStatus(value as LeadStatus)}
                  >
                    <SelectTrigger id="inquiry-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {draftStatus === "won" && (
                    <p className="text-caption text-muted-foreground">
                      This is an agency-reported outcome, not a confirmed Travora booking.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inquiry-note">Private agency note</Label>
                  <Textarea
                    id="inquiry-note"
                    value={draftNote}
                    onChange={(event) => setDraftNote(event.target.value)}
                    maxLength={2000}
                    placeholder="Notes for your team. Travelers cannot see this."
                  />
                </div>
                {saveError && <p role="alert" className="text-body-sm text-destructive">{saveError}</p>}
              </SheetBody>
              <SheetFooter>
                <Button
                  type="button"
                  className="w-full"
                  disabled={isSaving}
                  onClick={saveLead}
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageStack>
  );
}
