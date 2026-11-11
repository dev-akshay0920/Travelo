"use client";

import { useState, useEffect } from "react";
import { FilterSidebar } from "@/features/public/components/filter-sidebar";
import { PackageGrid } from "@/features/public/components/package-grid";
import { PublicLayout } from "@/features/public/components/public-layout";
import { usePackageFilters } from "@/features/public/hooks/use-package-filters";
import { useInfinitePackages } from "@/features/public/hooks/use-infinite-packages";
import type { PackageFilters } from "@/features/public/types/public-filters.types";

export default function PackagesPage() {
  const { filters, setFilters, hasActiveFilters } = usePackageFilters();
  const { total, facets } = useInfinitePackages(filters);
  const viewMode = "grid";
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Handle mobile filter events
  useEffect(() => {
    const handleOpen = () => setMobileFiltersOpen(true);
    const handleClear = () => setMobileFiltersOpen(false);
    window.addEventListener("open-filters", handleOpen);
    window.addEventListener("clear-filters", handleClear);
    return () => {
      window.removeEventListener("open-filters", handleOpen);
      window.removeEventListener("clear-filters", handleClear);
    };
  }, []);

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
    const updates: Partial<PackageFilters> = {};
    if (key === "destinations") updates.destinations = [];
    else if (key === "theme") updates.theme = [];
    else if (key === "destination") updates.destination = undefined;
    else if (key === "priceMin") updates.priceMin = undefined;
    else if (key === "priceMax") updates.priceMax = undefined;
    else if (key === "startDate") updates.startDate = undefined;
    else if (key === "endDate") updates.endDate = undefined;
    else if (key === "flexibleDates") updates.flexibleDates = undefined;
    else if (key === "durationMin") updates.durationMin = undefined;
    else if (key === "durationMax") updates.durationMax = undefined;
    else if (key === "scope") updates.geographicScope = undefined;
    else if (key === "travelers") {
      updates.adults = 1;
      updates.children = 0;
      updates.infants = 0;
    }
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
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <header className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Browse Packages</h1>
                <p className="mt-1 text-gray-600">Discover handpicked travel experiences from verified agencies</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 hidden sm:block">
                  {total.toLocaleString("en-IN")} packages available
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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
                    <span className="mt-0.5 block text-xs text-slate-500">Choose destination, dates, budget and more</span>
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

              {/* Package Grid */}
              <PackageGrid
                filters={filters}
                viewMode={viewMode}
                onViewDetail={(pkg) => {
                  // Open detail modal - will be implemented
                  console.log("View detail:", pkg);
                }}
              />
            </div>
          </div>
        </main>

        {/* Mobile Filter Sheet */}
        {mobileFiltersOpen && (
          <FilterSidebar
            facets={facets}
            isMobile={true}
            onClose={() => setMobileFiltersOpen(false)}
          />
        )}
      </div>
    </PublicLayout>
  );
}