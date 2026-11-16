"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, IndianRupee, TrendingUp, Users, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageStack } from "@/components/shared/page-container";
import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { StatCard } from "@/features/agency/components/crm-ui";
import {
  getBookingStatusCountsApi,
  getInvoiceStatusCountsApi,
  listBookingsApi,
  listInvoicesApi,
} from "@/features/agency/api/crm.api";
import { getAgencyDashboardApi } from "@/features/leads/api/leads.api";
import { formatCurrency, formatNumber } from "@/features/agency/lib/format";
import type { LeadDashboard } from "@/features/leads/types/lead.types";
import { LEAD_STATUSES } from "@/features/leads/types/lead.types";
import {
  BOOKING_STATUSES,
  INVOICE_STATUSES,
  titleCase,
} from "@/features/agency/types/crm.types";

function Breakdown({
  title,
  total,
  entries,
}: {
  title: string;
  total: number;
  entries: Array<{ label: string; value: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry) => {
          const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;
          return (
            <div key={entry.label} className="space-y-1">
              <div className="flex items-center justify-between text-body-sm">
                <span className="capitalize text-muted-foreground">{titleCase(entry.label)}</span>
                <span className="font-medium">
                  {formatNumber(entry.value)} ({percent}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function AgencyReportsPage() {
  const [dashboard, setDashboard] = useState<LeadDashboard | null>(null);
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({});
  const [invoiceCounts, setInvoiceCounts] = useState<Record<string, number>>({});
  const [bookingRevenue, setBookingRevenue] = useState(0);
  const [invoiced, setInvoiced] = useState(0);
  const [collected, setCollected] = useState(0);
  const [currency, setCurrency] = useState("INR");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dashboardData, bookings, invoices, nextBookingCounts, nextInvoiceCounts] =
        await Promise.all([
          getAgencyDashboardApi(),
          listBookingsApi({ page: 1, limit: 100 }),
          listInvoicesApi({ page: 1, limit: 100 }),
          getBookingStatusCountsApi().catch(() => ({}) as Record<string, number>),
          getInvoiceStatusCountsApi().catch(() => ({}) as Record<string, number>),
        ]);
      setDashboard(dashboardData);
      setBookingCounts(nextBookingCounts);
      setInvoiceCounts(nextInvoiceCounts);
      setBookingRevenue(bookings.items.reduce((sum, item) => sum + item.totalPrice, 0));
      setInvoiced(invoices.items.reduce((sum, item) => sum + item.total, 0));
      setCollected(invoices.items.reduce((sum, item) => sum + item.paidAmount, 0));
      const first = bookings.items[0] ?? invoices.items[0];
      if (first?.currency) setCurrency(first.currency);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load reports.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (isLoading) {
    return (
      <AgencyModulePage tab="reports" title="Reports">
        <LoadingState />
      </AgencyModulePage>
    );
  }

  if (error || !dashboard) {
    return (
      <AgencyModulePage tab="reports" title="Reports">
        <ErrorState
          title="Could not load reports"
          description={error ?? "Try again in a moment."}
          action={
            <Button variant="outline" onClick={load}>
              Retry
            </Button>
          }
        />
      </AgencyModulePage>
    );
  }

  const totalLeads = dashboard.leads.total;
  const wonLeads = dashboard.leads.byStatus.won ?? 0;
  const conversion = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const totalBookings = BOOKING_STATUSES.reduce(
    (sum, status) => sum + (bookingCounts[status] ?? 0),
    0,
  );
  const totalInvoices = INVOICE_STATUSES.reduce(
    (sum, status) => sum + (invoiceCounts[status] ?? 0),
    0,
  );
  const outstanding = Math.max(invoiced - collected, 0);

  return (
    <AgencyModulePage
      tab="reports"
      title="Reports"
      description="Pipeline, bookings and revenue at a glance."
      actions={
        <Button variant="outline" onClick={load}>
          <BarChart3 className="size-4" aria-hidden="true" />
          Refresh
        </Button>
      }
    >
      <PageStack>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total leads" value={formatNumber(totalLeads)} icon={Users} />
          <StatCard
            label="Conversion"
            value={`${conversion}%`}
            hint={`${formatNumber(wonLeads)} won`}
            icon={TrendingUp}
            tone="success"
          />
          <StatCard
            label="Booking value"
            value={formatCurrency(bookingRevenue, currency)}
            hint={`${formatNumber(totalBookings)} bookings`}
            icon={IndianRupee}
          />
          <StatCard
            label="Outstanding"
            value={formatCurrency(outstanding, currency)}
            hint={`${formatNumber(totalInvoices)} invoices`}
            icon={Wallet}
            tone="warning"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Breakdown
            title="Lead funnel"
            total={totalLeads}
            entries={LEAD_STATUSES.map((status) => ({
              label: status,
              value: dashboard.leads.byStatus[status] ?? 0,
            }))}
          />
          <Breakdown
            title="Bookings"
            total={totalBookings}
            entries={BOOKING_STATUSES.map((status) => ({
              label: status,
              value: bookingCounts[status] ?? 0,
            }))}
          />
          <Breakdown
            title="Invoices"
            total={totalInvoices}
            entries={INVOICE_STATUSES.map((status) => ({
              label: status,
              value: invoiceCounts[status] ?? 0,
            }))}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between border-b border-border/60 pb-2 text-body-sm">
                <span className="text-muted-foreground">Booked value</span>
                <span className="font-medium">{formatCurrency(bookingRevenue, currency)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2 text-body-sm">
                <span className="text-muted-foreground">Invoiced</span>
                <span className="font-medium">{formatCurrency(invoiced, currency)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2 text-body-sm">
                <span className="text-muted-foreground">Collected</span>
                <span className="font-medium">{formatCurrency(collected, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-muted-foreground">Outstanding</span>
                <span className="font-medium">{formatCurrency(outstanding, currency)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latest leads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dashboard.leads.latest.length === 0 ? (
                <p className="text-body-sm text-muted-foreground">No leads yet.</p>
              ) : (
                dashboard.leads.latest.slice(0, 5).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 text-body-sm last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{lead.travelerName}</p>
                      <p className="truncate text-caption text-muted-foreground">
                        {lead.packageName ?? "General enquiry"}
                      </p>
                    </div>
                    <span className="shrink-0 capitalize text-muted-foreground">
                      {titleCase(lead.status)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </PageStack>
    </AgencyModulePage>
  );
}
