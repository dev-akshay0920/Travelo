"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MessageSquareText } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageStack } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDisplayDate } from "@/lib/date-format";
import { getMyInquiryApi, getMyInquiriesApi } from "@/features/leads/api/leads.api";
import { LEAD_STATUS_LABELS } from "@/features/leads/types/lead.types";
import type { LeadStatus, TravelerInquiry, TravelerInquiryListResponse } from "@/features/leads/types/lead.types";

const statusDescriptions: Record<LeadStatus, string> = {
  new: "Your message was submitted. The agency has not marked it as contacted yet.",
  contacted: "The agency marked that it has contacted you. This is not a booking confirmation.",
  qualified: "The agency marked this inquiry as qualified. Trip details are not confirmed.",
  won: "The agency reported a conversion. This is not a Travora booking confirmation.",
  closed: "The agency marked this inquiry as closed.",
};

function InquiryStatus({ status }: { status: LeadStatus }) {
  return (
    <Badge variant={status === "new" ? "default" : status === "closed" ? "secondary" : "outline"}>
      {LEAD_STATUS_LABELS[status]}
    </Badge>
  );
}

export function TravelerInquiryHistory() {
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [listResult, setListResult] = useState<{
    key: string;
    data?: TravelerInquiryListResponse;
    error?: string;
  } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    id: string;
    inquiry?: TravelerInquiry;
    error?: string;
    loading: boolean;
  } | null>(null);
  const detailRequestId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    getMyInquiriesApi({ page, limit: 10 })
      .then((data) => {
        if (!cancelled) setListResult({ key: `${page}:${reloadKey}`, data });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setListResult({
            key: `${page}:${reloadKey}`,
            error: error instanceof Error && error.message
              ? error.message
              : "Could not load your inquiries.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [page, reloadKey]);

  const queryKey = `${page}:${reloadKey}`;
  const currentResult = listResult?.key === queryKey ? listResult : null;
  const inquiries = currentResult?.data?.items ?? [];
  const total = currentResult?.data?.total ?? 0;
  const totalPages = currentResult?.data?.totalPages ?? 0;
  const loading = !currentResult;
  const error = currentResult?.error;

  const openInquiry = async (id: string) => {
    const requestId = ++detailRequestId.current;
    setSelectedId(id);
    setDetail({ id, loading: true });
    try {
      const inquiry = await getMyInquiryApi(id);
      if (requestId === detailRequestId.current) {
        setDetail({ id, inquiry, loading: false });
      }
    } catch (loadError) {
      if (requestId === detailRequestId.current) {
        setDetail({
          id,
          loading: false,
          error: loadError instanceof Error && loadError.message
            ? loadError.message
            : "Could not load this inquiry.",
        });
      }
    }
  };

  const closeInquiry = () => {
    detailRequestId.current += 1;
    setSelectedId(null);
    setDetail(null);
  };

  return (
    <PageStack>
      <PageHeader
        title="My inquiries"
        description="Review the messages you sent to travel agencies and their reported follow-up."
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState
          title="Could not load inquiries"
          description={error}
          action={<Button type="button" variant="outline" onClick={() => setReloadKey((key) => key + 1)}>Try again</Button>}
        />
      ) : inquiries.length === 0 ? (
        <EmptyState
          title="No inquiries yet"
          description="When you contact an agency about a trip, your message and its follow-up status will appear here."
          icon={<MessageSquareText />}
          action={
            <Button asChild>
              <Link href="/traveller/explore">Explore trips</Link>
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-body-sm text-muted-foreground" aria-live="polite">
            {total} {total === 1 ? "inquiry" : "inquiries"}
          </p>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agency</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-medium">
                      {inquiry.agency ? (
                        <Link className="text-primary hover:underline" href={`/agencies/${encodeURIComponent(inquiry.agency.slug)}`}>
                          {inquiry.agency.name}
                        </Link>
                      ) : "Agency listing unavailable"}
                    </TableCell>
                    <TableCell>{inquiry.packageName ?? "Agency inquiry"}</TableCell>
                    <TableCell>{formatDisplayDate(inquiry.createdAt, "Date unavailable")}</TableCell>
                    <TableCell><InquiryStatus status={inquiry.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button type="button" variant="outline" size="sm" onClick={() => void openInquiry(inquiry.id)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {inquiries.map((inquiry) => (
              <Card key={inquiry.id} size="sm">
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-body font-medium text-foreground">
                        {inquiry.agency?.name ?? "Agency listing unavailable"}
                      </p>
                      <p className="text-body-sm text-muted-foreground">
                        {inquiry.packageName ?? "Agency inquiry"}
                      </p>
                    </div>
                    <InquiryStatus status={inquiry.status} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-caption text-muted-foreground">
                      {formatDisplayDate(inquiry.createdAt, "Date unavailable")}
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={() => void openInquiry(inquiry.id)}>
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

      <Sheet open={selectedId !== null} onOpenChange={(open) => !open && closeInquiry()}>
        <SheetContent aria-describedby="traveler-inquiry-description">
          <SheetHeader>
            <div className="min-w-0">
              <SheetTitle>Inquiry details</SheetTitle>
              <SheetDescription id="traveler-inquiry-description">
                Agency-reported status; not a booking confirmation.
              </SheetDescription>
            </div>
            {detail?.inquiry && <InquiryStatus status={detail.inquiry.status} />}
          </SheetHeader>
          <SheetBody className="space-y-5 p-5">
            {detail?.loading && <LoadingState variant="inline" />}
            {detail?.error && (
              <ErrorState
                title="Inquiry unavailable"
                description={detail.error}
                action={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => detail.id && void openInquiry(detail.id)}
                  >
                    Try again
                  </Button>
                }
              />
            )}
            {detail?.inquiry && (
              <>
                <section className="space-y-1">
                  <h2 className="text-body-sm font-semibold">Agency</h2>
                  {detail.inquiry.agency ? (
                    <Link
                      className="text-body-sm text-primary hover:underline"
                      href={`/agencies/${encodeURIComponent(detail.inquiry.agency.slug)}`}
                    >
                      {detail.inquiry.agency.name}
                    </Link>
                  ) : (
                    <p className="text-body-sm text-muted-foreground">This agency listing is currently unavailable.</p>
                  )}
                </section>
                <section className="space-y-1">
                  <h2 className="text-body-sm font-semibold">Trip</h2>
                  <p className="text-body-sm text-muted-foreground">
                    {detail.inquiry.packageName ?? "General agency inquiry"}
                  </p>
                </section>
                <section className="space-y-1">
                  <h2 className="text-body-sm font-semibold">Your message</h2>
                  <p className="whitespace-pre-wrap break-words text-body-sm text-muted-foreground">
                    {detail.inquiry.message}
                  </p>
                </section>
                {detail.inquiry.requestedStartDate && (
                  <section className="space-y-1">
                    <h2 className="text-body-sm font-semibold">Requested start date</h2>
                    <p className="text-body-sm text-muted-foreground">
                      {formatDisplayDate(detail.inquiry.requestedStartDate, "Date unavailable")}
                    </p>
                  </section>
                )}
                {detail.inquiry.travelerCount !== undefined && (
                  <section className="space-y-1">
                    <h2 className="text-body-sm font-semibold">Travelers</h2>
                    <p className="text-body-sm text-muted-foreground">{detail.inquiry.travelerCount}</p>
                  </section>
                )}
                <section className="space-y-1 rounded-lg bg-muted p-3">
                  <h2 className="text-body-sm font-semibold">Status meaning</h2>
                  <p className="text-body-sm text-muted-foreground">
                    {statusDescriptions[detail.inquiry.status]}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    Last updated {formatDisplayDate(detail.inquiry.updatedAt, "Date unavailable")}
                  </p>
                </section>
              </>
            )}
          </SheetBody>
        </SheetContent>
      </Sheet>
    </PageStack>
  );
}
