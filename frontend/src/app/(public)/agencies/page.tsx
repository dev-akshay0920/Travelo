"use client";

import { useEffect, useState } from "react";
import { PublicLayout } from "@/features/public/components/public-layout";
import { MapPin, Building2, Users, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import Link from "next/link";
import { fetchPublicAgencies } from "@/features/public/api/public-packages.api";
import type { AgencySummary } from "@/features/public/api/public-packages.api";

interface AgencyCardProps {
  agency: AgencySummary;
}

function AgencyCard({ agency }: AgencyCardProps) {
  return (
    <Card size="sm" variant="interactive" className="gap-0 overflow-hidden p-0">
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
        {agency.logo ? (
          <img
            src={agency.logo}
            alt={agency.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <Building2 className="h-10 w-10" />
          </div>
        )}
      </div>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="line-clamp-1">{agency.name}</CardTitle>
          {agency.rating && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400" />
              {agency.rating.toFixed(1)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-body-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{agency.destination || "Location not specified"}</span>
        </div>
        <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
          {agency.packageCount && (
            <span>
              <Users className="h-3 w-3" /> {agency.packageCount} packages
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-100" />
            <span className="text-xs">Verified</span>
          </span>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/agencies/${encodeURIComponent(agency.slug)}`}>View agency</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function AgencySkeleton() {
  return (
    <Card size="sm" className="animate-pulse gap-0 overflow-hidden p-0">
      <div className="aspect-[4/3] w-full bg-muted" />
      <CardContent className="space-y-3">
        <div className="h-4 w-1/3 bg-muted rounded mb-2" />
        <div className="h-3 w-full bg-muted rounded mb-3" />
        <div className="flex gap-2">
          <div className="h-4 w-8 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
        <Button className="w-full" disabled>
          Loading...
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AgenciesPage() {
  const [result, setResult] = useState<{
    items: AgencySummary[];
    error?: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchPublicAgencies(50).then((data) => {
      if (!cancelled) setResult(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = result?.items ?? [];
  const error = result?.error;

  const filteredItems = items.filter(
    (agency) =>
      !searchQuery ||
      agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agency.destination?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (result === null) {
    return (
      <PublicLayout>
        <PageContainer className="space-y-5">
          <PageHeader
            title="Travel Agencies"
            description="Browse verified agencies and find your perfect travel partner."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <AgencySkeleton key={i} />
            ))}
          </div>
        </PageContainer>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <PageContainer className="space-y-5">
          <PageHeader title="Travel Agencies" />
          <ErrorState
            title="Could not load agencies"
            description={error}
            action={
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try again
              </Button>
            }
          />
        </PageContainer>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <PageContainer className="space-y-5">
        <PageHeader
          title="Travel Agencies"
          description={`${filteredItems.length} verified agencies ready to help you plan your trip`}
          actions={
            <Input
              aria-label="Search agencies"
              placeholder="Search agencies by name or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80"
            />
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.length === 0 ? (
            <EmptyState
              className="col-span-full"
              title="No agencies found"
              description="Try another agency name or destination."
            />
          ) : (
            filteredItems.map((agency) => (
              <AgencyCard key={agency.id} agency={agency} />
            ))
          )}
        </div>
      </PageContainer>
    </PublicLayout>
  );
}