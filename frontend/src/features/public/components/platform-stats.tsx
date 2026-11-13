"use client";

import { Users, Star, MapPin, Package, Award } from "lucide-react";
import type { PlatformStats } from "@/features/public/api/public-packages.api";

interface PlatformStatsDisplayProps {
  stats: PlatformStats;
}

export function PlatformStatsDisplay({ stats }: PlatformStatsDisplayProps) {
  const statItems = [
    { label: "Verified Agencies", value: stats.verifiedAgencies.toLocaleString("en-IN"), icon: Award },
    { label: "Happy Travellers", value: stats.happyTravellers.toLocaleString("en-IN"), icon: Users },
    { label: "Destinations", value: stats.destinations.toLocaleString("en-IN"), icon: MapPin },
    { label: "Packages Available", value: stats.totalPackages.toLocaleString("en-IN"), icon: Package },
  ];

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm sm:gap-10 animate-fade-in" role="list" aria-label="Platform statistics">
      {statItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2 group" role="listitem">
          <div className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <item.icon className="size-4" aria-hidden="true" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">{item.value}</p>
            <p className="text-caption text-muted-foreground">{item.label}</p>
          </div>
        </div>
      ))}
      <div className="mx-2 hidden h-10 w-px bg-border sm:block" aria-hidden="true" />
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-md bg-accent text-brand-accent">
          <Star aria-hidden="true" className="size-4" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{stats.avgRating}</p>
          <p className="text-caption text-muted-foreground">{stats.totalReviews.toLocaleString("en-IN")} reviews</p>
        </div>
      </div>
    </div>
  );
}

function PlatformStatsSkeleton() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 animate-pulse" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gray-200" />
          <div className="text-left">
            <div className="h-6 w-16 rounded bg-gray-200" />
            <div className="h-3 w-12 rounded bg-gray-200" />
          </div>
        </div>
      ))}
      <div className="mx-2 hidden h-10 w-px bg-border sm:block" />
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-xl bg-gray-200" />
        <div>
          <div className="h-6 w-8 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}