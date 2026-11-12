"use client";

import { PackageCard } from "@/features/public/components/public-package-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PackageSearch } from "lucide-react";
import { useInfinitePackages } from "@/features/public/hooks/use-infinite-packages";
import { usePackageFilters } from "@/features/public/hooks/use-package-filters";
import type {
  PackageFilters,
  PackageStatus,
  TravelPackage,
} from "@/features/public/types/public-filters.types";

interface PackageGridProps {
  filters: PackageFilters;
  onEdit?: (pkg: TravelPackage) => void;
  onDelete?: (pkg: TravelPackage) => void;
  onStatusChange?: (pkg: TravelPackage, status: PackageStatus) => void;
  onViewDetail?: (pkg: TravelPackage) => void;
  viewMode?: "grid" | "list";
}

export function PackageGrid({ filters, onEdit, onDelete, onStatusChange, onViewDetail, viewMode = "grid" }: PackageGridProps) {
  const { packages, isLoading, isLoadingMore, error, hasMore, total, facets, loadMoreRef, refresh } = useInfinitePackages(filters);
  const { clearFilters } = usePackageFilters();

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className={viewMode === "list" ? "space-y-3" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <PackageCardSkeleton key={i} mode={viewMode} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load packages"
        description={error}
        action={<Button onClick={refresh} variant="outline">Try again</Button>}
      />
    );
  }

  if (!packages.length) {
    return (
      <EmptyState
        title="No packages found"
        description="Try adjusting your filters or search terms to find what you’re looking for."
        icon={<PackageSearch />}
        action={<Button variant="outline" onClick={clearFilters}>Clear all filters</Button>}
      />
    );
  }

  return (
    <div className="space-y-5">
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onViewDetail={onViewDetail}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onViewDetail={onViewDetail}
            />
          ))}
        </div>
      )}

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="h-4" aria-hidden="true">
        {isLoadingMore && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-gray-500">
              <Spinner label="Loading more packages" size="md" className="text-primary" />
              <span>Loading more packages...</span>
            </div>
          </div>
        )}
        {hasMore && !isLoadingMore && (
          <div className="text-center py-8">
            <Button variant="outline" onClick={() => loadMoreRef.current?.scrollIntoView({ behavior: "smooth" })}>
              Load More ({total - packages.length} remaining)
            </Button>
          </div>
        )}
        {!hasMore && packages.length > 0 && (
          <p className="text-center text-gray-500 py-4">All {total} packages loaded</p>
        )}
      </div>
    </div>
  );
}

function PackageCardSkeleton({ mode }: { mode: "grid" | "list" }) {
  return (
    <Card size="sm" className="animate-pulse gap-0 pt-0">
      <div className="aspect-[16/10] w-full bg-gray-100" />
      <CardContent className="space-y-3">
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
      </CardContent>
    </Card>
  );
}