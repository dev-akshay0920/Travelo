"use client";

import type { TravelPackage, PackageStatus } from "@/features/packages/types/package.types";
import { PackageCard } from "@/features/packages/components/package-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

type PackageListProps = {
  packages: TravelPackage[];
  isLoading: boolean;
  onCreateNew: () => void;
  onEdit: (pkg: TravelPackage) => void;
  onDelete: (pkg: TravelPackage) => void;
  onStatusChange: (pkg: TravelPackage, status: PackageStatus) => void;
  onViewDetail?: (pkg: TravelPackage) => void;
};

export function PackageList({ packages, isLoading, onCreateNew, onEdit, onDelete, onStatusChange, onViewDetail }: PackageListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 pb-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} size="sm" className="h-full gap-0 overflow-hidden pt-0">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                <Skeleton className="w-full h-full" />
              </div>
              <CardContent className="space-y-3 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="mt-1 h-3 w-1/2 rounded" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <Skeleton className="h-3 w-2/3 rounded" />
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!packages.length) {
    return (
      <EmptyState
        title="No packages yet"
        description="Create your first travel package to get started."
        icon={<Plus />}
        action={
          <Button onClick={onCreateNew} size="sm">
            <Plus aria-hidden="true" />
            Create package
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-500">
          {packages.length} package{packages.length !== 1 ? "s" : ""}
        </h2>
        <Button onClick={onCreateNew} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Package
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-4">
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
    </div>
  );
}