"use client";

import { PackageCard } from "@/features/public/components/public-package-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInfinitePackages } from "@/features/public/hooks/use-infinite-packages";
import type { PackageFilters } from "@/features/public/types/public-filters.types";

interface PackageGridProps {
  filters: PackageFilters;
  onEdit?: (pkg: any) => void;
  onDelete?: (pkg: any) => void;
  onStatusChange?: (pkg: any, status: any) => void;
  onViewDetail?: (pkg: any) => void;
  viewMode?: "grid" | "list";
}

export function PackageGrid({ filters, onEdit, onDelete, onStatusChange, onViewDetail, viewMode = "grid" }: PackageGridProps) {
  const { packages, isLoading, isLoadingMore, error, hasMore, total, facets, loadMoreRef, refresh } = useInfinitePackages(filters);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className={viewMode === "list" ? "space-y-4" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <PackageCardSkeleton key={i} mode={viewMode} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Failed to load packages</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={refresh} variant="outline">Try Again</Button>
      </div>
    );
  }

  if (!packages.length) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No packages found</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
        <Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent("clear-filters"))}>
          Clear All Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="space-y-4">
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
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
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