"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageStack } from "@/components/shared/page-container";
import { formatCurrency, formatDate } from "@/features/agency/lib/format";
import { listUpcomingDeparturesApi } from "@/features/agency/api/crm.api";
import type { Booking } from "@/features/agency/types/crm.types";

export default function AgencyDeparturesPage() {
  const [departures, setDepartures] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const value = await listUpcomingDeparturesApi();
      setDepartures(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load departures.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const byDate = departures.reduce((acc, b) => {
    const key = b.departureDate ? b.departureDate.slice(0, 10) : "TBD";
    (acc[key] ??= []).push(b);
    return acc;
  }, {} as Record<string, Booking[]>);
  const dates = Object.keys(byDate).sort();

  if (isLoading) {
    return (
      <AgencyModulePage tab="bookings" title="Departure calendar">
        <LoadingState />
      </AgencyModulePage>
    );
  }

  if (error) {
    return (
      <AgencyModulePage tab="bookings" title="Departure calendar">
        <ErrorState title="Could not load departures" description={error} />
      </AgencyModulePage>
    );
  }

  return (
    <AgencyModulePage tab="bookings" title="Departure calendar">
      <PageStack>
        <div className="flex items-end justify-end mb-4">
          <Button onClick={load}>Refresh</Button>
        </div>

        <div className="mt-4">
          {dates.length === 0 ? (
            <div className="rounded-lg border border-border/50 p-8 text-center">
              <p className="text-muted-foreground">No upcoming departures.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dates.map((date) => {
                const dayBookings = byDate[date];
                const label = `${dayBookings.length} departure${dayBookings.length === 1 ? "" : "s"}`;
                return (
                  <div key={date} className="rounded-lg border border-border">
                    <CardHeader className="bg-muted/50 px-4 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{formatDate(date)}</span>
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/50">
                        {dayBookings.map((booking) => (
                          <div key={booking.id} className="px-4 py-3 flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-body-sm font-medium">{booking.bookingNumber}</p>
                              <p className="text-caption text-muted-foreground truncate">
                                {booking.travellers?.[0]?.name ?? "Traveller"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {booking.totalPrice > 0
                                  ? formatCurrency(booking.totalPrice, booking.currency)
                                  : "Price TBD"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-right text-caption text-muted-foreground text-sm">
                              <span>{booking.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </PageStack>
    </AgencyModulePage>
  );
}
