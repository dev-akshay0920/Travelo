"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { FilterSidebar } from "@/features/public/components/filter-sidebar";
import { PackageGrid } from "@/features/public/components/package-grid";
import { PublicLayout } from "@/features/public/components/public-layout";
import { usePackageFilters } from "@/features/public/hooks/use-package-filters";
import { useInfinitePackages } from "@/features/public/hooks/use-infinite-packages";

export default function PackagesPage() {
  const { filters } = usePackageFilters();
  const { total, facets } = useInfinitePackages(filters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeFilterCount = [
    filters.destination,
    filters.destinations?.length,
    filters.theme?.length,
    filters.priceMin,
    filters.priceMax,
    filters.startDate,
    filters.endDate,
    filters.flexibleDates,
    (filters.adults ?? 1) > 1 || (filters.children ?? 0) > 0,
    filters.durationMin,
    filters.durationMax,
    filters.geographicScope,
  ].filter(Boolean).length;

  return (
    <PublicLayout>
      <PageContainer className="space-y-5">
        <PageHeader
          title="Browse Packages"
          description="Discover handpicked travel experiences from verified agencies"
          actions={
            <span className="hidden text-body-sm text-muted-foreground sm:inline">
              {total.toLocaleString("en-IN")} packages available
            </span>
          }
        />

        <div className="grid gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <div className="hidden lg:block">
            <FilterSidebar facets={facets} />
          </div>

          <div className="min-w-0">
            <Button
              type="button"
              variant="outline"
              className="mb-4 w-full justify-between lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={mobileFiltersOpen}
            >
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal aria-hidden="true" className="size-4" />
                Filters
              </span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount} active</Badge>
              )}
            </Button>

            <PackageGrid
              filters={filters}
              onViewDetail={(pkg) => {
                // Open detail modal - will be implemented
                console.log("View detail:", pkg);
              }}
            />
          </div>
        </div>

        {mobileFiltersOpen && (
          <FilterSidebar
            facets={facets}
            isMobile
            onClose={() => setMobileFiltersOpen(false)}
          />
        )}
      </PageContainer>
    </PublicLayout>
  );
}
