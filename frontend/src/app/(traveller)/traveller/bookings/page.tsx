"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Wallet } from "lucide-react";
import Link from "next/link";

import { listMyBookingsApi } from "@/features/traveller/api/traveller.api";
import { formatDateTime } from "@/features/agency/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageStack } from "@/components/shared/page-container";

interface TravellerBooking {
  id: string;
  bookingNumber: string;
  status: string;
  totalPrice: number;
  paidAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  departureDate: string;
  voucherUrl?: string;
  voucherKey?: string;
  travellers: Array<{ name: string; email?: string; phone?: string }>;
}

interface BookingsResponse {
  items: TravellerBooking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function TravellerBookingsPage() {
  const [bookings, setBookings] = useState<TravellerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data: BookingsResponse = await listMyBookingsApi({ page });
      setBookings(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your bookings.");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      enquiry: "Enquiry",
      quoted: "Quoted",
      deposit_paid: "Deposit Paid",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
      refunded: "Refunded",
    };
    return map[status] ?? status;
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "completed":
        return "secondary";
      case "deposit_paid":
        return "default";
      case "cancelled":
      case "refunded":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <PageStack>
      <PageHeader
        title="My Bookings"
        description="Your upcoming and past trips with Travora."
      />
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState title="Unable to load bookings" description={error} />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="You don’t have any trips booked. Explore packages to start planning your next journey."
          action={
            <Button asChild>
              <Link href="/traveller/explore">Browse packages</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} size="sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold leading-none">
                  {booking.bookingNumber}
                </CardTitle>
                <Badge variant={statusVariant(booking.status)} className="capitalize">
                  {statusLabel(booking.status)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-4 text-body-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-caption text-muted-foreground">Travellers</span>
                    <span className="font-medium">{booking.travellers.length}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-caption text-muted-foreground">Starts</span>
                    <span className="font-medium">{formatDateTime(booking.startDate)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-caption text-muted-foreground">Ends</span>
                    <span className="font-medium">{formatDateTime(booking.endDate)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-caption text-muted-foreground">Total</span>
                    <span className="font-medium">
                      {booking.currency === "INR" ? `₹${booking.totalPrice.toLocaleString("en-IN")}` : `${booking.currency} ${booking.totalPrice.toLocaleString("en-US")}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Wallet className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-body-sm text-muted-foreground">
                      Paid: {booking.paidAmount === 0 ? "—" : booking.currency === "INR" ? `₹${booking.paidAmount.toLocaleString("en-IN")}` : `${booking.currency} ${booking.paidAmount.toLocaleString("en-US")}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-body-sm text-muted-foreground">
                      {formatDateTime(booking.departureDate)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/voucher/${booking.id}`}>
                  <Button variant="outline" size="sm" asChild>
                    View voucher
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <span className="text-caption text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </PageStack>
  );
}
