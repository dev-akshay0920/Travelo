"use client";

import { Users, Star, MapPin, Package, Award } from "lucide-react";
import type { PlatformStats } from "@/features/public/api/public-packages.api";

interface PlatformStatsDisplayProps {
  stats: PlatformStats;
}

export function PlatformStatsDisplay({ stats }: PlatformStatsDisplayProps) {
  const statItems = [
    { label: "Verified Agencies", value: stats.verifiedAgencies.toLocaleString("en-IN"), icon: Award, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Happy Travellers", value: stats.happyTravellers.toLocaleString("en-IN"), icon: Users, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Destinations", value: stats.destinations.toLocaleString("en-IN"), icon: MapPin, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Packages Available", value: stats.totalPackages.toLocaleString("en-IN"), icon: Package, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm animate-fade-in" style={{ animationDelay: '0.4s' }} role="list" aria-label="Platform statistics">
      {statItems.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2 group" role="listitem">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${item.bg} ${item.color} group-hover:scale-110`}>
            <item.icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900">{item.value}</p>
            <p className="text-gray-500 text-xs">{item.label}</p>
          </div>
        </div>
      ))}
      <div className="w-px h-10 bg-gray-200 hidden sm:block mx-2" aria-hidden="true" />
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Star className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <p className="font-bold text-gray-900">{stats.avgRating}</p>
          <p className="text-gray-500 text-xs">{stats.totalReviews.toLocaleString("en-IN")} reviews</p>
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
      <div className="w-px h-10 bg-gray-200 hidden sm:block mx-2" />
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