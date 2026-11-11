"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Users } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageStack } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InquiryFormDialog } from "@/features/leads/components/inquiry-form-dialog";
import { PublicLayout } from "@/features/public/components/public-layout";
import { fetchPublicPackageDetails } from "@/features/public/api/public-packages.api";
import type { TravelPackage } from "@/features/public/types/public-filters.types";
import { formatDisplayDate } from "@/lib/date-format";

function formatPrice(price: number, currency: string, priceType: string) {
  const formatted = currency === "INR"
    ? `₹${price.toLocaleString("en-IN")}`
    : `${currency} ${price.toLocaleString("en-US")}`;
  return `${formatted} ${priceType === "per_person" ? "per person" : "for package"}`;
}

export default function PublicPackageDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [result, setResult] = useState<{
    id: string;
    package?: TravelPackage;
    error?: string;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchPublicPackageDetails(id)
      .then((pkg) => {
        if (!cancelled) setResult({ id, package: pkg });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setResult({
            id,
            error: error instanceof Error && error.message
              ? error.message
              : "Could not load this package.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [attempt, id]);

  const current = result?.id === id ? result : null;
  const pkg = current?.package;

  return (
    <PublicLayout>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {!current ? (
          <LoadingState />
        ) : current.error || !pkg ? (
          <ErrorState
            title="Package unavailable"
            description={current.error ?? "This package could not be found or is no longer available."}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button type="button" variant="outline" onClick={() => setAttempt((value) => value + 1)}>
                  Try again
                </Button>
                <Button asChild>
                  <Link href="/packages">Browse packages</Link>
                </Button>
              </div>
            }
          />
        ) : (
          <PageStack>
            <PageHeader
              title={pkg.name}
              description={`${pkg.destination} · ${pkg.durationDays} days / ${pkg.durationNights} nights`}
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={pkg.availableSeats > 0 ? "secondary" : "destructive"}>
                    {pkg.availableSeats > 0 ? `${pkg.availableSeats} seats listed` : "Sold out"}
                  </Badge>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/agencies/${encodeURIComponent(pkg.agencySlug)}`}>
                      {pkg.agencyName}
                    </Link>
                  </Button>
                </div>
              }
            />

            {pkg.images?.length ? (
              <div className="relative aspect-[16/8] overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={pkg.images.find((image) => image.isPrimary)?.url ?? pkg.images[0].url}
                  alt={pkg.images.find((image) => image.isPrimary)?.altText ?? pkg.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="space-y-5">
                <Card size="sm">
                  <CardHeader>
                    <CardTitle>Trip overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pkg.description && <p className="whitespace-pre-wrap text-body-sm text-muted-foreground">{pkg.description}</p>}
                    <div className="grid gap-3 sm:grid-cols-3">
                      <p className="flex items-center gap-2 text-body-sm">
                        <CalendarDays aria-hidden="true" className="size-4 text-primary" />
                        {formatDisplayDate(pkg.startDate, "Date unavailable")} – {formatDisplayDate(pkg.endDate, "Date unavailable")}
                      </p>
                      <p className="flex items-center gap-2 text-body-sm">
                        <Users aria-hidden="true" className="size-4 text-primary" />
                        {pkg.minTravelers}{pkg.maxTravelers ? `–${pkg.maxTravelers}` : "+"} travelers
                      </p>
                      <p className="flex items-center gap-2 text-body-sm">
                        <MapPin aria-hidden="true" className="size-4 text-primary" />
                        {pkg.geographicScope}
                      </p>
                    </div>
                    {pkg.destinations.length > 0 && (
                      <ol className="flex flex-wrap gap-2" aria-label="Trip destinations">
                        {pkg.destinations.map((destination, index) => (
                          <li key={`${destination.city}-${index}`}>
                            <Badge variant="outline">
                              {[destination.city, destination.state, destination.country].filter(Boolean).join(", ")}
                            </Badge>
                          </li>
                        ))}
                      </ol>
                    )}
                    {pkg.highlights?.length ? (
                      <section className="space-y-2">
                        <h2 className="text-body font-semibold">Highlights</h2>
                        <ul className="list-inside list-disc space-y-1 text-body-sm text-muted-foreground">
                          {pkg.highlights.map((highlight, index) => <li key={`${highlight}-${index}`}>{highlight}</li>)}
                        </ul>
                      </section>
                    ) : null}
                  </CardContent>
                </Card>

                {pkg.itinerary?.length ? (
                  <Card size="sm">
                    <CardHeader><CardTitle>Itinerary</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {pkg.itinerary.map((day) => (
                        <section key={day.day} className="border-l-2 border-primary/30 pl-4">
                          <h3 className="text-body font-semibold">Day {day.day}: {day.title}</h3>
                          <p className="mt-1 whitespace-pre-wrap text-body-sm text-muted-foreground">{day.description}</p>
                          {day.meals?.length ? (
                            <p className="mt-1 text-caption text-muted-foreground">Meals: {day.meals.join(", ")}</p>
                          ) : null}
                          {day.accommodation && (
                            <p className="mt-1 text-caption text-muted-foreground">Stay: {day.accommodation}</p>
                          )}
                        </section>
                      ))}
                    </CardContent>
                  </Card>
                ) : null}

                {(pkg.inclusions?.length || pkg.exclusions?.length) ? (
                  <Card size="sm">
                    <CardHeader><CardTitle>Inclusions and exclusions</CardTitle></CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      {pkg.inclusions?.length ? (
                        <section className="space-y-2">
                          <h3 className="text-body-sm font-semibold">Included</h3>
                          <ul className="list-inside list-disc space-y-1 text-body-sm text-muted-foreground">
                            {pkg.inclusions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                          </ul>
                        </section>
                      ) : null}
                      {pkg.exclusions?.length ? (
                        <section className="space-y-2">
                          <h3 className="text-body-sm font-semibold">Not included</h3>
                          <ul className="list-inside list-disc space-y-1 text-body-sm text-muted-foreground">
                            {pkg.exclusions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                          </ul>
                        </section>
                      ) : null}
                    </CardContent>
                  </Card>
                ) : null}

                {(pkg.termsAndConditions || pkg.cancellationPolicy || pkg.childPolicy || pkg.infantPolicy) ? (
                  <Card size="sm">
                    <CardHeader><CardTitle>Policies</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {pkg.cancellationPolicy && <section><h3 className="text-body-sm font-semibold">Cancellation</h3><p className="mt-1 whitespace-pre-wrap text-body-sm text-muted-foreground">{pkg.cancellationPolicy}</p></section>}
                      {pkg.childPolicy && <section><h3 className="text-body-sm font-semibold">Children</h3><p className="mt-1 whitespace-pre-wrap text-body-sm text-muted-foreground">{pkg.childPolicy}</p></section>}
                      {pkg.infantPolicy && <section><h3 className="text-body-sm font-semibold">Infants</h3><p className="mt-1 whitespace-pre-wrap text-body-sm text-muted-foreground">{pkg.infantPolicy}</p></section>}
                      {pkg.termsAndConditions && <section><h3 className="text-body-sm font-semibold">Terms and conditions</h3><p className="mt-1 whitespace-pre-wrap text-body-sm text-muted-foreground">{pkg.termsAndConditions}</p></section>}
                    </CardContent>
                  </Card>
                ) : null}
              </div>

              <aside className="space-y-4">
                <Card size="sm">
                  <CardHeader>
                    <CardTitle>Price</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-section-title font-semibold">
                      {formatPrice(pkg.price, pkg.currency, pkg.priceType)}
                    </p>
                    <p className="text-body-sm text-muted-foreground">
                      {pkg.taxType === "inclusive"
                        ? "Taxes included as stated by the agency."
                        : pkg.taxType === "exclusive"
                          ? `Taxes may be additional${pkg.taxPercentage ? ` (${pkg.taxPercentage}%)` : ""}.`
                          : "Tax details are provided by the agency."}
                    </p>
                    {pkg.priceValidUntil && (
                      <p className="text-caption text-muted-foreground">
                        Agency price valid until {formatDisplayDate(pkg.priceValidUntil, "Date unavailable")}.
                      </p>
                    )}
                    {pkg.availableSeats > 0 ? (
                      <InquiryFormDialog
                        agencyId={pkg.agencyId}
                        packageId={pkg.id}
                        packageName={pkg.name}
                        className="w-full"
                      />
                    ) : (
                      <Button type="button" className="w-full" disabled>Currently unavailable</Button>
                    )}
                    <p className="text-caption text-muted-foreground">
                      Package information and availability are supplied by the agency and may change. An inquiry is not a booking, seat hold, or confirmed price.
                    </p>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </PageStack>
        )}
      </main>
    </PublicLayout>
  );
}
