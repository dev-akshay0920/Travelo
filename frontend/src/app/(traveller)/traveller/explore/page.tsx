"use client";

import { useState, useEffect, useCallback } from "react";
import { FilterSidebar } from "@/features/public/components/filter-sidebar";
import { PackageDetailModal } from "@/features/packages/components/package-detail-modal";
import { usePackageFilters } from "@/features/public/hooks/use-package-filters";
import { useInfinitePackages } from "@/features/public/hooks/use-infinite-packages";
import { fetchPublicAgencies } from "@/features/public/api/public-packages.api";
import type { TravelPackage as PublicTravelPackage } from "@/features/public/types/public-filters.types";
import type { TravelPackage } from "@/features/packages/types/package.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, CalendarDays, Heart, MapPin, Package as PackageIcon, Users, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { watchlistApi } from "@/features/watchlist/api/watchlist.api";
import { toast } from "sonner";
import { formatDisplayDate } from "@/lib/date-format";
import { Pagination } from "@/components/ui/pagination";

type ViewType = "packages" | "agencies" | "both";

interface AgencyCardItem {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  destination: string;
  packageCount: number;
}

interface UnifiedItem {
  type: "package" | "agency";
  package?: PublicTravelPackage;
  agency?: AgencyCardItem;
}

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
  const [viewType, setViewType] = useState<ViewType>("both");
  const [agencies, setAgencies] = useState<AgencyCardItem[]>([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [savedItems, setSavedItems] = useState<Set<string>>(() => new Set());
  const [savingItems, setSavingItems] = useState<Set<string>>(() => new Set());
  const [isSavedItemsLoading, setIsSavedItemsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setAgenciesLoading(true);
      try {
        const data = await fetchPublicAgencies(50);
        if (!cancelled) {
          setAgencies(
            (data.items || []).map((a) => ({
              id: a.id,
              name: a.name,
              slug: a.slug,
              logo: a.logo,
              destination: a.destination,
              packageCount: a.packageCount,
            }))
          );
          setTotalPages(Math.ceil(data.items.length / 50));
        }
      } catch {
        if (!cancelled) setAgencies([]);
      } finally {
        if (!cancelled) setAgenciesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadSavedItems = async () => {
      try {
        const firstPage = await watchlistApi.list({ page: 1, limit: 100 });
        const pages = Array.from(
          { length: Math.max(0, firstPage.totalPages - 1) },
          (_, index) => index + 2
        );
        const remainingPages = await Promise.all(
          pages.map((pageNumber) => watchlistApi.list({ page: pageNumber, limit: 100 }))
        );

        if (cancelled) return;

        const entries = [...firstPage.items, ...remainingPages.flatMap((page) => page.items)];
        setSavedItems(new Set(
          entries.flatMap((item) => {
            if (item.itemType === "package" && item.packageId) return [`package:${item.packageId}`];
            if (item.itemType === "agency" && item.agencyId) return [`agency:${item.agencyId}`];
            return [];
          })
        ));
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Could not load your watchlist status.");
        }
      } finally {
        if (!cancelled) setIsSavedItemsLoading(false);
      }
    };

    void loadSavedItems();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSavedItem = useCallback(async (itemType: "package" | "agency", id: string) => {
    const key = `${itemType}:${id}`;
    if (savingItems.has(key)) return;

    setSavingItems((current) => new Set(current).add(key));
    try {
      const result = await watchlistApi.toggle(
        itemType === "package"
          ? { packageId: id, itemType }
          : { agencyId: id, itemType }
      );
      setSavedItems((current) => {
        const updated = new Set(current);
        if (result.saved) updated.add(key);
        else updated.delete(key);
        return updated;
      });
      toast.success(result.saved ? "Added to your watchlist." : "Removed from your watchlist.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your watchlist.");
    } finally {
      setSavingItems((current) => {
        const updated = new Set(current);
        updated.delete(key);
        return updated;
      });
    }
  }, [savingItems]);

  const activeFilters = [
    filters.destination && {
      key: "destination",
      label: `Destination: ${filters.destination}`,
    },
    filters.destinations &&
      filters.destinations.length > 0 && {
        key: "destinations",
        label: `${filters.destinations.length} destinations`,
      },
    filters.theme &&
      filters.theme.length > 0 && { key: "theme", label: `${filters.theme.length} themes` },
    filters.priceMin && {
      key: "priceMin",
      label: `Min \u20B9${filters.priceMin.toLocaleString("en-IN")}`,
    },
    filters.priceMax && {
      key: "priceMax",
      label: `Max \u20B9${filters.priceMax.toLocaleString("en-IN")}`,
    },
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
    const updates: Record<string, unknown> = {};
    if (key === "destinations") updates.destinations = [];
    else if (key === "theme") updates.theme = [];
    else updates[key] = undefined;
    setFilters(updates, true);
  };

  const clearFilters = () => {
    setFilters(
      {
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
      },
      true
    );
  };

  const filteredAgencies = agencies.filter((agency) => {
    if (viewType === "packages") return false;
    if (
      filters.destination &&
      !agency.destination.toLowerCase().includes(filters.destination.toLowerCase())
    )
      return false;
    return true;
  });

  const unifiedItems: UnifiedItem[] = [];
  if (viewType !== "agencies") {
    packages.forEach((pkg) => unifiedItems.push({ type: "package", package: pkg }));
  }
  if (viewType !== "packages") {
    filteredAgencies.forEach((agency) =>
      unifiedItems.push({ type: "agency", agency })
    );
  }

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Explore</h1>
        <p className="mt-1 text-sm leading-5 text-gray-600">
          Discover travel packages and verified agencies
        </p>
      </div>

      <div className="flex gap-6 xl:gap-8">
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <FilterSidebar
            facets={facets}
            viewType={viewType}
            onViewTypeChange={setViewType}
          />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="mb-4 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <span>
                <span className="block font-semibold text-slate-900">
                  Refine your search
                </span>
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
                <svg
                  className="h-5 w-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </span>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {unifiedItems.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center sm:py-20">
                <Search className="mb-4 h-10 w-10 text-gray-300" />
                <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                  No results found
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Try adjusting your filters or search terms to find what you&apos;re looking for.
                </p>
                <Button variant="outline" onClick={clearFilters} className="mt-6">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              unifiedItems.map((item) => {
                if (item.type === "package") {
                  const pkg = item.package!;
                  return (
                    <Card
                      key={pkg.id}
                      className={cn(
                        "group flex flex-col gap-0 overflow-hidden rounded-xl border border-gray-100 py-0 shadow-sm transition-shadow duration-200 hover:shadow-md",
                        pkg.status !== "active" && "opacity-60 grayscale"
                      )}
                    >
                      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gray-100">
                        {pkg.images?.[0]?.url ? (
                          <Image
                            src={pkg.images[0].url}
                            alt={pkg.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.015]"
                            sizes="(max-width: 768px) 100vw, 25vw"
                          />
                        ) : (
                          <PackageIcon
                            className="absolute inset-0 w-12 h-12 mx-auto my-auto text-gray-300"
                          />
                        )}
                        <span
                          className={cn(
                            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold",
                            "bg-white/95 backdrop-blur-sm shadow-sm",
                            pkg.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          {pkg.status.replace("_", " ")}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={savedItems.has(`package:${pkg.id}`) ? `Remove ${pkg.name} from watchlist` : `Add ${pkg.name} to watchlist`}
                          aria-pressed={savedItems.has(`package:${pkg.id}`)}
                          disabled={isSavedItemsLoading || savingItems.has(`package:${pkg.id}`)}
                          onClick={() => void toggleSavedItem("package", pkg.id)}
                          className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/95 text-slate-600 shadow-sm backdrop-blur-sm hover:bg-white hover:text-rose-600"
                        >
                          <Heart className={cn("h-4 w-4", savedItems.has(`package:${pkg.id}`) && "fill-rose-500 text-rose-500")} />
                        </Button>
                        <div className="absolute bottom-1.5 left-1.5">
                          <div className="rounded-lg bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
                            <span className="text-sm font-semibold text-gray-900">
                              {pkg.currency === "INR"
                                ? `\u20B9${pkg.price.toLocaleString("en-IN")}`
                                : `${pkg.currency} ${pkg.price.toLocaleString("en-US")}`}
                            </span>
                            <span className="ml-1 text-xs text-gray-500">
                              /{pkg.priceType === "per_person" ? "person" : "package"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <CardContent className="flex flex-1 flex-col gap-3 p-4">
                        <h3 className="line-clamp-1 text-base font-semibold leading-5 text-gray-900">
                          {pkg.name}
                        </h3>
                        <p className="flex items-center gap-1.5 text-sm leading-5 text-gray-500">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{pkg.destination}</span>
                        </p>
                        <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-xs">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-500">Travel dates</p>
                            <p className="mt-1 flex items-center gap-1.5 font-semibold text-gray-800">
                              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                              <span className="truncate">
                                {formatDisplayDate(pkg.startDate, "Date not set")} – {formatDisplayDate(pkg.endDate, "Date not set")}
                              </span>
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-500">Duration</p>
                            <p className="mt-1 truncate font-semibold text-gray-800">
                              {pkg.durationDays} days · {pkg.durationNights} nights
                            </p>
                          </div>
                          <div className="col-span-2 flex items-center gap-1.5 text-gray-600">
                            <Users className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            <span>{pkg.availableSeats} seats available</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardContent className="flex justify-end border-t border-gray-100 p-3">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pkg.status !== "active"}
                          onClick={() => {
                            setDetailPackage(pkg as TravelPackage);
                            setDetailOpen(true);
                          }}
                          className="min-w-24"
                        >
                          <PackageIcon className="h-3.5 w-3.5 mr-1.5" />
                          {pkg.status !== "active" ? "Outdated" : "View"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                } else {
                  const agency = item.agency!;
                  return (
                    <Card
                      key={agency.id}
                      className="group flex flex-col gap-0 overflow-hidden rounded-xl border border-gray-100 py-0 shadow-sm transition-shadow duration-200 hover:shadow-md"
                    >
                      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gray-100">
                        {agency.logo ? (
                          <Image
                            src={agency.logo}
                            alt={agency.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.015]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Building2 className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                        <Badge variant="outline" className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs backdrop-blur-sm">
                          {agency.packageCount} packages
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={savedItems.has(`agency:${agency.id}`) ? `Remove ${agency.name} from watchlist` : `Add ${agency.name} to watchlist`}
                          aria-pressed={savedItems.has(`agency:${agency.id}`)}
                          disabled={isSavedItemsLoading || savingItems.has(`agency:${agency.id}`)}
                          onClick={() => void toggleSavedItem("agency", agency.id)}
                          className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/95 text-slate-600 shadow-sm backdrop-blur-sm hover:bg-white hover:text-rose-600"
                        >
                          <Heart className={cn("h-4 w-4", savedItems.has(`agency:${agency.id}`) && "fill-rose-500 text-rose-500")} />
                        </Button>
                      </div>
                      <CardContent className="flex flex-1 flex-col gap-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="line-clamp-1 text-base font-semibold leading-5 text-gray-900">
                              {agency.name}
                            </h3>
                            <p className="mt-1 flex items-center gap-1.5 text-sm leading-5 text-gray-500">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{agency.destination}</span>
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {agency.packageCount} {agency.packageCount === 1 ? "package" : "packages"}
                          </Badge>
                        </div>
                      </CardContent>
                      <CardContent className="flex justify-end border-t border-gray-100 p-3">
                        <Button variant="outline" size="sm" asChild className="min-w-28">
                          <Link href={`/packages?agencySlug=${encodeURIComponent(agency.slug)}`}>
                            <PackageIcon className="mr-1.5 h-3.5 w-3.5" />View packages
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                }
              })
            )}
          </div>

          {totalPages > 1 && viewType !== "agencies" && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="mt-6"
            />
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <FilterSidebar
          facets={facets}
          isMobile={true}
          onClose={() => setMobileFiltersOpen(false)}
          viewType={viewType}
          onViewTypeChange={setViewType}
        />
      )}

      <PackageDetailModal
        package={detailPackage}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}
