"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, CalendarCheck2, Plane, Plus, Search, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageStack } from "@/components/shared/page-container";
import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { SectionCard, StatCard, StatusPill } from "@/features/agency/components/crm-ui";
import {
  getBookingStatusCountsApi,
  listBookingsApi,
  listUpcomingDeparturesApi,
} from "@/features/agency/api/crm.api";
import { formatCurrency, formatDate } from "@/features/agency/lib/format";
import {
  BOOKING_STATUSES,
  type Booking,
  type BookingStatus,
} from "@/features/agency/types/crm.types";

export default function AgencyBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listBookingsApi({
        page,
        limit: 20,
        search: search || undefined,
        status: status === "all" ? undefined : status,
      });
      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load bookings.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    getBookingStatusCountsApi()
      .then((value) => {
        if (!cancelled) setCounts(value);
      })
      .catch(() => undefined);
    listUpcomingDeparturesApi()
      .then((value) => {
        if (!cancelled) setUpcoming(value.slice(0, 5));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const outstanding = items.reduce(
    (sum, booking) => sum + Math.max(booking.totalPrice - booking.paidAmount, 0),
    0,
  );

  return (
    <AgencyModulePage
      tab="bookings"
      title="Bookings"
      description="Track confirmed trips, departures and payments in one place."
      actions={
        <Button asChild>
          <Link href="/agency/bookings/new">
            <Plus className="size-4" aria-hidden="true" />
            New booking
          </Link>
        </Button>
      }
    >
      <PageStack>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total bookings" value={total} icon={CalendarCheck2} />
          <StatCard label="Confirmed" value={counts.confirmed ?? 0} tone="success" />
          <StatCard label="Upcoming departures" value={upcoming.length} icon={Plane} />
          <StatCard label="Outstanding" value={formatCurrency(outstanding)} icon={Wallet} tone="warning" />
        </div>

        {upcoming.length > 0 && (
          <SectionCard title="Upcoming departures" description="Trips leaving soon.">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {upcoming.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/agency/bookings/${booking.id}`}
                  className="rounded-lg border border-border p-3 transition-colors hover:border-primary/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-body-sm font-medium">{booking.bookingNumber}</p>
                    <StatusPill status={booking.status} />
                  </div>
                  <p className="mt-1 text-caption text-muted-foreground">
                    {booking.travellers[0]?.name ?? "Traveler"}
                    {booking.travellers.length > 1 ? ` +${booking.travellers.length - 1}` : ""}
                  </p>
                  <p className="mt-1 text-caption font-medium">
                    {formatDate(booking.departureDate)}
                  </p>
                </Link>
              ))}
            </div>
          </SectionCard>
        )}

        <Card>
          <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>All bookings</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      setPage(1);
                      setSearch(searchInput.trim());
                    }
                  }}
                  placeholder="Search booking"
                  className="pl-9 sm:w-56"
                />
              </div>
              <Select
                value={status}
                onValueChange={(value) => {
                  setPage(1);
                  setStatus(value as BookingStatus | "all");
                }}
              >
                <SelectTrigger className="sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {BOOKING_STATUSES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState variant="inline" />
            ) : error ? (
              <ErrorState
                title="Could not load bookings"
                description={error}
                action={
                  <Button variant="outline" onClick={load}>
                    Retry
                  </Button>
                }
              />
            ) : items.length === 0 ? (
              <EmptyState
                icon={<CalendarCheck2 />}
                title="No bookings yet"
                description="Convert an accepted quotation or create a booking manually."
                action={
                  <Button asChild>
                    <Link href="/agency/bookings/new">New booking</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking</TableHead>
                      <TableHead>Travellers</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead className="text-right">Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.bookingNumber}</TableCell>
                        <TableCell>
                          {booking.travellers[0]?.name ?? "-"}
                          {booking.travellers.length > 1
                            ? ` +${booking.travellers.length - 1}`
                            : ""}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(booking.departureDate)}
                        </TableCell>
                        <TableCell>
                          <StatusPill status={booking.status} />
                        </TableCell>
                        <TableCell>{formatCurrency(booking.totalPrice, booking.currency)}</TableCell>
                        <TableCell>{formatCurrency(booking.paidAmount, booking.currency)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/agency/bookings/${booking.id}`}>
                              View
                              <ArrowUpRight className="size-4" aria-hidden="true" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </CardContent>
        </Card>
      </PageStack>
    </AgencyModulePage>
  );
}
