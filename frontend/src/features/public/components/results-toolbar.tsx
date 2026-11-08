"use client";

import { useState } from "react";
import { Grid, List, ChevronDown, X, SlidersHorizontal, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePackageFilters } from "@/features/public/hooks/use-package-filters";
import type { SortOption } from "@/features/public/types/public-filters.types";
import { SORT_OPTIONS } from "@/features/public/types/public-filters.types";

export function ResultsToolbar({ total, hasFilters }: { total: number; hasFilters: boolean }) {
  const { filters, setFilters, clearFilters } = usePackageFilters();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const activeFilters = [
    filters.destination && { key: "destination", label: `Destination: ${filters.destination}` },
    filters.destinations && filters.destinations.length > 0 && { key: "destinations", label: `${filters.destinations.length} destinations` },
    filters.theme && filters.theme.length > 0 && { key: "theme", label: `${filters.theme.length} themes` },
    filters.priceMin && { key: "priceMin", label: `Min ₹${filters.priceMin.toLocaleString("en-IN")}` },
    filters.priceMax && { key: "priceMax", label: `Max ₹${filters.priceMax.toLocaleString("en-IN")}` },
    filters.startDate && { key: "startDate", label: `From ${filters.startDate}` },
    filters.endDate && { key: "endDate", label: `To ${filters.endDate}` },
    filters.flexibleDates && { key: "flexibleDates", label: "Flexible dates" },
    filters.durationMin && { key: "durationMin", label: `Min ${filters.durationMin} days` },
    filters.durationMax && { key: "durationMax", label: `Max ${filters.durationMax} days` },
    filters.geographicScope && { key: "scope", label: `Scope: ${filters.geographicScope}` },
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  const removeFilter = (key: string) => {
    const updates: Record<string, any> = {};
    if (key === "destinations") updates.destinations = [];
    else if (key === "theme") updates.theme = [];
    else updates[key] = undefined;
    setFilters(updates, true);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
      {/* Results Count */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span className="font-medium text-gray-900">{total.toLocaleString("en-IN")}</span>
        <span>package{total !== 1 ? "s" : ""} found</span>
        {hasFilters && (
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
            Filtered
          </span>
        )}
      </div>

      {/* Active Filter Pills */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 animate-slide-in">
          {activeFilters.map((filter) => (
            <span key={filter.key} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-700">
              {filter.label}
              <button
                type="button"
                onClick={() => removeFilter(filter.key)}
                className="text-gray-400 hover:text-gray-600 p-0.5"
                aria-label={`Remove ${filter.label}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {activeFilters.length > 1 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50">
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* View Toggle & Sort */}
      <div className="flex items-center gap-3">
        {/* View Toggle */}
        <div className="hidden sm:flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded"
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hidden sm:flex"
            onClick={() => document.getElementById("sort-dropdown")?.focus()}
          >
            <Filter className="h-4 w-4" />
            <span>Sort</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <select
            id="sort-dropdown"
            value={filters.sortBy || "recommended"}
            onChange={(e) => setFilters({ sortBy: e.target.value as SortOption }, true)}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Mobile Filter Trigger */}
        <Button variant="outline" size="sm" className="md:hidden gap-2" onClick={() => document.dispatchEvent(new CustomEvent("open-filters"))}>
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {hasFilters && <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">2</span>}
        </Button>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}