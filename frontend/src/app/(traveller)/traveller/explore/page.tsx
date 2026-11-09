"use client";

import { useState } from "react";
import { FilterSidebar } from "@/features/public/components/filter-sidebar";
import { ResultsToolbar } from "@/features/public/components/results-toolbar";
import { PackageGrid } from "@/features/public/components/package-grid";
import { PackageDetailModal } from "@/features/packages/components/package-detail-modal";
import { usePackageFilters } from "@/features/public/hooks/use-package-filters";
import { useInfinitePackages } from "@/features/public/hooks/use-infinite-packages";
import type { TravelPackage as PublicTravelPackage } from "@/features/public/types/public-filters.types";
import type { TravelPackage } from "@/features/packages/types/package.types";

export default function TravellerExplorePage() {
  const { filters, setFilters, hasActiveFilters } = usePackageFilters();
  const {
    packages,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    total,
    facets,
    loadMoreRef,
    refresh,
  } = useInfinitePackages(filters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPackage, setDetailPackage] = useState<TravelPackage | null>(null);
  const activeFilters = [
    filters.destination && { key: "destination", label: `Destination: ${filters.destination}` },
    filters.destinations && filters.destinations.length > 0 && { key: "destinations", label: `${filters.destinations.length} destinations` },
    filters.theme && filters.theme.length > 0 && { key: "theme", label: `${filters.theme.length} themes` },
    filters.priceMin && { key: "priceMin", label: `Min ₹${filters.priceMin.toLocaleString("en-IN")}` },
    filters.priceMax && { key: "priceMax", label: `Max ₹${filters.priceMax.toLocaleString("en-IN")}` },
    filters.startDate && { key: "startDate", label: `From ${filters.startDate}` },
    filters.endDate && { key: "endDate", label: `To ${filters.endDate}` },
    filters.flexibleDates && { key: "flexibleDates", label: "Flexible dates" },
    ((filters.adults ?? 1) > 1 || (filters.children ?? 0) > 0) && {
      key: "travelers",
      label: `${(filters.adults ?? 1) + (filters.children ?? 0)} travelers`,
    },
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

  const clearFilters = () => {
    setFilters({
      destination: undefined,
      destinations: [],
      theme: [],
      priceMin: undefined,
      priceMax: undefined,
      startDate: undefined,
      endDate: undefined,
      flexibleDates: undefined,
      durationMin: undefined,
      durationMax: undefined,
      geographicScope: undefined,
      sortBy: "recommended",
      page: 1,
    }, true);
  };

  return (
    <>
      <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <FilterSidebar facets={facets} />
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter Trigger */}
            <div className="lg:hidden mb-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <span>
                  <span className="block font-semibold text-slate-900">Refine your search</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Choose destination, dates, budget and more
                  </span>
                </span>
                <span className="flex items-center gap-2.5">
                  {hasActiveFilters && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {activeFilters.length} active
                    </span>
                  )}
                  <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                </span>
              </button>
            </div>

            {/* Results Toolbar */}
            <ResultsToolbar total={total} hasFilters={hasActiveFilters} />

            {/* Package Grid */}
            <PackageGrid
              filters={filters}
              onViewDetail={(pkg: PublicTravelPackage) => {
                setDetailPackage(pkg as TravelPackage);
                setDetailOpen(true);
              }}
            />
          </div>
      </div>

      {/* Mobile Filter Sheet */}
      {mobileFiltersOpen && (
        <FilterSidebar
          facets={facets}
          isMobile={true}
          onClose={() => setMobileFiltersOpen(false)}
        />
      )}

      {/* Package Detail Modal */}
      <PackageDetailModal
        package={detailPackage}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={() => {}}
      />
    </>
  );
}
