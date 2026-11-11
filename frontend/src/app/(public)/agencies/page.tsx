"use client";

import { useEffect, useState } from "react";
import { PublicLayout } from "@/features/public/components/public-layout";
import { MapPin, Building2, Users, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPublicAgencies } from "@/features/public/api/public-packages.api";
import type { AgencySummary } from "@/features/public/api/public-packages.api";

interface AgencyCardProps {
  agency: AgencySummary;
}

function AgencyCard({ agency }: AgencyCardProps) {
  return (
    <Card className="overflow-hidden border border-border hover:shadow-md transition-shadow duration-200">
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
        {agency.logo ? (
          <img
            src={agency.logo}
            alt={agency.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <Building2 className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {agency.name}
          </h3>
          {agency.rating && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400" />
              {agency.rating.toFixed(1)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" />
          <span>{agency.destination || "Location not specified"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
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
        <Button asChild variant="outline" className="w-full">
          <a href={`/agencies/${agency.slug}`}>View Agency</a>
        </Button>
      </div>
    </Card>
  );
}

function AgencySkeleton() {
  return (
    <Card className="overflow-hidden border border-border animate-pulse">
      <div className="aspect-[4/3] w-full bg-muted" />
      <div className="p-5">
        <div className="h-4 w-1/3 bg-muted rounded mb-2" />
        <div className="h-3 w-full bg-muted rounded mb-3" />
        <div className="flex gap-2">
          <div className="h-4 w-8 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
        <Button className="w-full" disabled>
          Loading...
        </Button>
      </div>
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
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Travel Agencies
            </h1>
            <p className="mt-1 text-muted-foreground">
              Browse verified agencies and find your perfect travel partner.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <AgencySkeleton key={i} />
            ))}
          </div>
        </main>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Travel Agencies
            </h1>
          </header>
          <div className="text-center py-20">
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        </main>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Travel Agencies
            </h1>
            <p className="mt-1 text-muted-foreground">
              {filteredItems.length} verified agencies ready to help you plan
              your trip
            </p>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <Input
              placeholder="Search agencies by name or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80"
            />
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted-foreground">
                No agencies found matching your search.
              </p>
            </div>
          ) : (
            filteredItems.map((agency) => (
              <AgencyCard key={agency.id} agency={agency} />
            ))
          )}
        </div>
      </main>
    </PublicLayout>
  );
}