"use client";

import { useParams } from "next/navigation";
import { PublicLayout } from "@/features/public/components/public-layout";
import { PackageGrid } from "@/features/public/components/package-grid";
import { usePackageFilters } from "@/features/public/hooks/use-package-filters";
import { useInfinitePackages } from "@/features/public/hooks/use-infinite-packages";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, Users, Calendar, Clock, MapPin as MapPinIcon, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { PackageFilters } from "@/features/public/types/public-filters.types";

export default function AgencyProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { filters, setFilters } = usePackageFilters();
  const agencyFilters = { ...filters, agencySlug: slug, page: 1 };
  const { packages, isLoading, total, facets, loadMoreRef } = useInfinitePackages(agencyFilters);

  // Mock agency data - in real app this would come from API
  const agency = {
    id: "1",
    name: "Wanderlust Tours",
    slug: "wanderlust-tours",
    logo: null,
    about: "We specialize in creating unforgettable travel experiences across India and beyond. With 15+ years of expertise, we curate personalized journeys that match your dreams.",
    destination: "Mumbai, Maharashtra",
    rating: 4.8,
    reviewCount: 247,
    packageCount: 24,
    yearEstablished: 2009,
    verified: true,
    services: ["Custom Itineraries", "Group Tours", "Corporate Travel", "Honeymoon Packages"],
    contact: {
      phone: "+91 98765 43210",
      email: "info@wanderlusttours.com",
      website: "https://wanderlusttours.com",
    },
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Agency Header */}
        <header className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {agency.logo ? (
                    <Image src={agency.logo} alt={agency.name} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-primary-600 bg-primary-50">
                      {agency.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900">{agency.name}</h1>
                    {agency.verified && (
                      <Badge variant="default" className="gap-1 bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      {agency.destination}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Est. {agency.yearEstablished}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {agency.packageCount} packages
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{agency.rating}</div>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                    <Star className="h-4 w-4 fill-current text-amber-500" />
                    <span>{agency.reviewCount} reviews</span>
                  </div>
                </div>
                <Button size="lg" asChild>
                  <a href={`/agencies/${slug}/contact`}>Contact Agency</a>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* About */}
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{agency.about}</p>
                </Card>

                {/* Services */}
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Services</h3>
                  <ul className="space-y-2">
                    {agency.services.map((service, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        {service}
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Contact */}
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
                  <div className="space-y-3 text-sm">
                    <a href={`tel:${agency.contact.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
                      <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      </span>
                      {agency.contact.phone}
                    </a>
                    <a href={`mailto:${agency.contact.email}`} className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
                      <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      </span>
                      {agency.contact.email}
                    </a>
                    {agency.contact.website && (
                      <a href={agency.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
                        <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                        </span>
                        Website
                      </a>
                    )}
                  </div>
                </Card>
              </div>
            </aside>

            {/* Packages */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Packages by {agency.name}</h2>
                <span className="text-sm text-gray-500">{total} packages</span>
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
    <div className="space-y-6">
      <Card className="p-6">
        <Skeleton className="h-5 w-24 mb-3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </Card>
      <Card className="p-6">
        <Skeleton className="h-5 w-20 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </Card>
      <Card className="p-6">
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