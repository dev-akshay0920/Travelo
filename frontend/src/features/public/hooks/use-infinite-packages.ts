"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicPackageResponse } from "@/features/public/api/public-packages.api";
import type { PackageFilters, TravelPackage, PackageFacetCounts } from "@/features/public/types/public-filters.types";
import { fetchPublicPackages } from "@/features/public/api/public-packages.api";

export function useInfinitePackages(initialFilters: PackageFilters) {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [facets, setFacets] = useState<PackageFacetCounts | undefined>(undefined);
  const [loadedFiltersKey, setLoadedFiltersKey] = useState<string | null>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const filtersKey = JSON.stringify(initialFilters);
  const isLoading = loadedFiltersKey !== filtersKey || isRefreshing;

  const applyResponse = useCallback((response: PublicPackageResponse, isInitial: boolean) => {
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
  }, []);

  const loadPackages = useCallback(async (pageNum: number, isInitial = false) => {
    const requestId = ++requestIdRef.current;
    if (isInitial) setIsRefreshing(true);
    else setIsLoadingMore(true);
    setError(null);

    try {
      const response = await fetchPublicPackages({
        ...initialFilters,
        page: pageNum,
      });

      if (requestId !== requestIdRef.current) return;
      applyResponse(response, isInitial);
      setLoadedFiltersKey(filtersKey);
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load packages");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    }
  }, [applyResponse, filtersKey, initialFilters]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let cancelled = false;

    const loadInitialPage = async () => {
      try {
        const response = await fetchPublicPackages({ ...initialFilters, page: 1 });
        if (cancelled || requestId !== requestIdRef.current) return;
        applyResponse(response, true);
        setError(null);
      } catch (err) {
        if (!cancelled && requestId === requestIdRef.current) {
          setError(err instanceof Error ? err.message : "Failed to load packages");
        }
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoadedFiltersKey(filtersKey);
        }
      }
    };

    void loadInitialPage();
    return () => {
      cancelled = true;
      if (requestIdRef.current === requestId) requestIdRef.current += 1;
    };
  }, [applyResponse, filtersKey, initialFilters]);

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