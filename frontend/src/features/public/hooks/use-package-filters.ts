"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo, useEffect, useState } from "react";
import type { PackageFilters, SortOption, TripTheme, GeographicScope, PackageStatus } from "@/features/public/types/public-filters.types";

function parseArray(params: URLSearchParams, key: string): string[] {
  return params.getAll(key).flatMap((value) => value.split(",")).filter(Boolean);
}

function parseNumber(param: string | null): number | undefined {
  if (!param) return undefined;
  const n = Number(param);
  return isNaN(n) ? undefined : n;
}

function parseBoolean(param: string | null): boolean | undefined {
  if (!param) return undefined;
  return param === "true";
}

export function usePackageFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<PackageFilters>(() => ({
    destination: searchParams.get("destination") || undefined,
    destinations: parseArray(searchParams, "destinations"),
    theme: parseArray(searchParams, "theme") as TripTheme[],
    priceMin: parseNumber(searchParams.get("priceMin")),
    priceMax: parseNumber(searchParams.get("priceMax")),
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    flexibleDates: parseBoolean(searchParams.get("flexibleDates")),
    adults: parseNumber(searchParams.get("adults")) || 1,
    children: parseNumber(searchParams.get("children")) || 0,
    infants: parseNumber(searchParams.get("infants")) || 0,
    durationMin: parseNumber(searchParams.get("durationMin")),
    durationMax: parseNumber(searchParams.get("durationMax")),
    geographicScope: (searchParams.get("geographicScope") as GeographicScope) || undefined,
    status: parseArray(searchParams, "status") as PackageStatus[],
    sortBy: (searchParams.get("sortBy") as SortOption) || "recommended",
    page: parseNumber(searchParams.get("page")) || 1,
    limit: 24,
  }), [searchParams]);

  const setFilters = useCallback((newFilters: Partial<PackageFilters>, replace = false) => {
    const params = new URLSearchParams(searchParams.toString());
    const updatedFilters = {
      ...filters,
      ...newFilters,
      page: newFilters.page ?? 1,
    };

    Object.entries(updatedFilters).forEach(([key, value]) => {
      params.delete(key);
      if (value === undefined || value === null || value === "") return;

      if (Array.isArray(value)) {
        if (value.length > 0) {
          value.forEach((v) => params.append(key, String(v)));
        }
      } else if (typeof value === "boolean") {
        params.set(key, value ? "true" : "false");
      } else {
        params.set(key, String(value));
      }
    });

    const newUrl = `${pathname}?${params.toString()}`;
    if (replace) {
      router.replace(newUrl, { scroll: false });
    } else {
      router.push(newUrl, { scroll: false });
    }
  }, [searchParams, pathname, router, filters]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", "24");
    params.set("adults", "1");
    params.append("status", "active");
    params.append("status", "sold_out");
    params.set("sortBy", "recommended");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.destination ||
      filters.destinations?.length ||
      filters.theme?.length ||
      filters.priceMin !== undefined ||
      filters.priceMax !== undefined ||
      filters.startDate ||
      filters.endDate ||
      filters.flexibleDates ||
      (filters.adults ?? 1) > 1 ||
      (filters.children ?? 0) > 0 ||
      (filters.infants ?? 0) > 0 ||
      filters.durationMin !== undefined ||
      filters.durationMax !== undefined ||
      filters.geographicScope
    );
  }, [filters]);

  return { filters, setFilters, clearFilters, hasActiveFilters };
}

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}