"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { formatCurrency, formatDate } from "@/features/agency/lib/format";
import { getPublicVoucherApi } from "@/features/agency/api/crm.api";
import type { Booking } from "@/features/agency/types/crm.types";

export default function PublicVoucherPage() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("id") ?? ""
      : "";

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const value = await getPublicVoucherApi(bookingId);
      setBooking(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load voucher.");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void load();
    }
  }, [bookingId, load]);

  if (isLoading) {
    return (
      <AgencyModulePage tab="bookings" title="Voucher">
        <LoadingState />
      </AgencyModulePage>
    );
  }

  if (error || !booking) {
    return (
      <AgencyModulePage tab="bookings" title="Voucher">
        <ErrorState title="Could not load voucher" description={error ?? undefined} />
      </AgencyModulePage>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-border bg-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Travel Voucher</h2>
            <p className="text-caption text-muted-foreground">#{booking.bookingNumber}</p>
          </div>
          <div className="flex items-end gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Calendar className="size-4 mr-2" aria-hidden="true" />
              Print
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Card className="p-4">
            <CardHeader className="px-0 pb-2">
              <CardTitle className="text-xs font-medium text-caption text-muted-foreground">Traveller</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-body-sm font-medium">{booking.travellers?.[0]?.name ?? "Traveller"}</p>
              <p className="text-xs text-muted-foreground">{booking.travellers?.[0]?.email ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{booking.travellers?.[0]?.phone ?? "—"}</p>
            </CardContent>
          </Card>
          <Card className="p-4">
            <CardHeader className="px-0 pb-2">
              <CardTitle className="text-xs font-medium text-caption text-muted-foreground">Departure</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-body-sm font-medium">{formatDate(booking.departureDate)}</p>
            </CardContent>
          </Card>
          <Card className="p-4">
            <CardHeader className="px-0 pb-2">
              <CardTitle className="text-xs font-medium text-caption text-muted-foreground">Duration</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-body-sm font-medium">{booking.startDate} → {booking.endDate}</p>
            </CardContent>
          </Card>
          <Card className="p-4">
            <CardHeader className="px-0 pb-2">
              <CardTitle className="text-xs font-medium text-caption text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-body-sm font-medium">{formatCurrency(booking.totalPrice, booking.currency)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-sm font-medium text-foreground">Package Details</CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-3">
              <p className="text-body-sm text-muted-foreground">
                {booking.itineraryId ? "Itinerary attached" : "No itinerary details available."}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Travora Travel Agency</p>
        </div>
      </div>
    </div>
  );
}
