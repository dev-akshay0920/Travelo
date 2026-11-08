"use client";

import type { TravelPackage, PackageStatus } from "@/features/packages/types/package.types";
import { PackageCard } from "@/features/packages/components/package-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

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
            <Card key={index} className="overflow-hidden flex flex-col h-full border-gray-100 shadow-sm pt-0">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                <Skeleton className="w-full h-full" />
              </div>
              <CardContent className="p-2.5 pb-2 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded mt-0.5" />
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
          ))}
        </div>
      </div>
    );
  }

  if (!packages.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-10 px-6 text-center bg-gray-50">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
          <Plus className="h-5 w-5 text-primary" />
        </div>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No packages yet</h3>
        <p className="mt-1 max-w-sm text-xs text-gray-500">
          Create your first travel package to get started.
        </p>
        <Button onClick={onCreateNew} className="mt-3" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Package
        </Button>
      </div>
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