"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PackageFilters, PublicPackageResponse, TravelPackage, PackageFacetCounts } from "@/features/public/types/public-filters.types";
import { fetchPublicPackages } from "@/features/public/api/public-packages.api";

export function useInfinitePackages(initialFilters: PackageFilters) {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [facets, setFacets] = useState<PackageFacetCounts | undefined>(undefined);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef(initialFilters);
  filtersRef.current = initialFilters;

  const loadPackages = useCallback(async (pageNum: number, isInitial = false) => {
    if (isInitial) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);

    try {
      const response = await fetchPublicPackages({
        ...filtersRef.current,
        page: pageNum,
      });

      // Cast API response to local types
      const typedItems = response.items as TravelPackage[];
      const typedFacets = response.facets as PackageFacetCounts | undefined;

      if (isInitial) {
        setPackages(typedItems);
      } else {
        setPackages((prev) => {
          const packagesById = new Map(prev.map((pkg) => [pkg.id, pkg]));
          typedItems.forEach((pkg) => packagesById.set(pkg.id, pkg));
          return Array.from(packagesById.values());
        });
      }

      setTotal(response.total);
      setPage(response.page);
      setHasMore(response.page < response.totalPages);
      setFacets(typedFacets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load packages");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPackages([]);
    setPage(1);
    setHasMore(true);
    loadPackages(1, true);
  }, [JSON.stringify(initialFilters), loadPackages]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          loadPackages(page + 1);
        }
      },
      { rootMargin: "200px", threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, isLoading, page, loadPackages]);

  return {
    packages,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    total,
    page,
    facets,
    loadMoreRef,
    refresh: () => loadPackages(1, true),
  };
}