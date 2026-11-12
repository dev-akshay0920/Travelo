"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PublicLayout } from "@/features/public/components/public-layout";
import { PackageGrid } from "@/features/public/components/package-grid";
import { usePackageFilters } from "@/features/public/hooks/use-package-filters";
import { useInfinitePackages } from "@/features/public/hooks/use-infinite-packages";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, MapPin as MapPinIcon, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ErrorState } from "@/components/shared/error-state";
import { InquiryFormDialog } from "@/features/leads/components/inquiry-form-dialog";
import { getPublicAgencyApi } from "@/features/agencies/api/agency.api";
import type { AgencyProfile } from "@/features/agencies/types/agency.types";

export default function AgencyProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { filters } = usePackageFilters();
  const agencyFilters = { ...filters, agencySlug: slug, page: 1 };
  const { isLoading, total, loadMoreRef } = useInfinitePackages(agencyFilters);
  const [agencyResult, setAgencyResult] = useState<{
    slug: string;
    agency?: AgencyProfile;
    error?: string;
  } | null>(null);
  const currentAgencyResult = agencyResult?.slug === slug ? agencyResult : null;
  const agency = currentAgencyResult?.agency ?? null;
  const agencyLoading = !currentAgencyResult;
  const agencyError = currentAgencyResult?.error ?? "";

  useEffect(() => {
    let cancelled = false;
    getPublicAgencyApi(slug)
      .then((result) => {
        if (!cancelled) setAgencyResult({ slug, agency: result });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setAgencyResult({
            slug,
            error: error instanceof Error && error.message
              ? error.message
              : "Could not load this agency.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (isLoading || agencyLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-background">
          <header className="border-b border-border bg-card">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-4">
              <aside className="lg:col-span-1">
                <AgencySidebarSkeleton />
              </aside>
              <div className="lg:col-span-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
                  {Array.from({ length: 6 }).map((_, i) => <PackageCardSkeleton key={i} />)}
                </div>
              </div>
            </div>
          </main>
        </div>
      </PublicLayout>
    );
  }

  if (!agency || agencyError) {
    return (
      <PublicLayout>
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ErrorState
            title="Agency profile unavailable"
            description={agencyError || "This agency profile could not be found."}
          />
        </main>
      </PublicLayout>
    );
  }

  const agencyLocation = [
    agency.location?.city,
    agency.location?.state,
    agency.location?.country,
  ].filter(Boolean).join(", ");

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                  {agency.logo?.url ? (
                    <Image src={agency.logo.url} alt={agency.logo.altText || agency.name} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
                      {agency.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-page-title font-semibold text-foreground">{agency.name}</h1>
                    {agency.status === "approved" && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Approved
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-body-sm text-muted-foreground">
                    {agencyLocation && <span className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      {agencyLocation}
                    </span>}
                    {agency.yearEstablished && <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Est. {agency.yearEstablished}
                    </span>}
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {total} packages
                    </span>
                  </div>
                </div>
              </div>
              <InquiryFormDialog agencyId={agency.id} />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-7">
          <div className="grid gap-5 lg:grid-cols-4">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-20 space-y-3">
                {/* About */}
                <Card size="sm" className="gap-2 p-3">
                  <h3 className="text-card-title font-semibold text-foreground">About</h3>
                  <p className="text-body-sm leading-relaxed text-muted-foreground">
                    {agency.about || "This agency has not added an introduction yet."}
                  </p>
                </Card>

                {/* Services */}
                <Card size="sm" className="gap-2 p-3">
                  <h3 className="text-card-title font-semibold text-foreground">Services</h3>
                  {agency.services?.length ? (
                    <ul className="space-y-2">
                      {agency.services.map((service) => (
                        <li key={service} className="flex items-center gap-2 text-body-sm capitalize text-muted-foreground">
                          <CheckCircle className="h-4 w-4 flex-shrink-0 text-primary" />
                          {service.replaceAll("_", " ")}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-body-sm text-muted-foreground">Services have not been listed yet.</p>
                  )}
                </Card>

                {/* Contact */}
                {(agency.contact?.phone || agency.contact?.email || agency.contact?.website) && (
                <Card size="sm" className="gap-2 p-3">
                  <h3 className="text-card-title font-semibold text-foreground">Contact</h3>
                  <div className="space-y-3 text-body-sm">
                    {agency.contact?.phone && <a href={`tel:${agency.contact.phone}`} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      </span>
                      {agency.contact.phone}
                    </a>}
                    {agency.contact?.email && <a href={`mailto:${agency.contact.email}`} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      </span>
                      {agency.contact.email}
                    </a>}
                    {agency.contact?.website && (
                      <a href={agency.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                        </span>
                        Website
                      </a>
                    )}
                  </div>
                </Card>
                )}
              </div>
            </aside>

            {/* Packages */}
            <div className="lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-section-title font-semibold text-foreground">Packages by {agency.name}</h2>
                <span className="text-body-sm text-muted-foreground">{total} packages</span>
              </div>

              <PackageGrid
                filters={agencyFilters}
                viewMode="grid"
              />

              {/* Load More */}
              <div ref={loadMoreRef} className="h-4" />
            </div>
          </div>
        </main>
      </div>
    </PublicLayout>
  );
}

function AgencySidebarSkeleton() {
  return (
    <div className="space-y-3">
      <Card size="sm" className="gap-2 p-3">
        <Skeleton className="h-5 w-24 mb-3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </Card>
      <Card size="sm" className="gap-2 p-3">
        <Skeleton className="h-5 w-20 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </Card>
      <Card size="sm" className="gap-2 p-3">
        <Skeleton className="h-5 w-20 mb-3" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
        </div>
      </Card>
    </div>
  );
}

function PackageCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-[16/10] w-full bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded mt-1" />
          </div>
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <Skeleton className="h-18 w-full rounded-lg" />
          <Skeleton className="h-18 w-full rounded-lg" />
          <Skeleton className="h-18 w-full rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-gray-100">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}