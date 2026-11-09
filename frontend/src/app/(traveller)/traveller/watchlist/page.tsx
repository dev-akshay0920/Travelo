"use client";

import { useState, useEffect, useCallback } from "react";
import { watchlistApi } from "@/features/watchlist/api/watchlist.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Package, Building2, AlertTriangle, RefreshCw, MapPin, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { getPackageByIdApi } from "@/features/packages/api/package.api";
import type { TravelPackage } from "@/features/packages/types/package.types";
import { PackageDetailModal } from "@/features/packages/components/package-detail-modal";
import { getPublicAgencyApi } from "@/features/agencies/api/agency.api";
import { formatDisplayDate } from "@/lib/date-format";

interface WatchlistPackageItem {
  id: string;
  packageId: string;
  itemType: "package";
  name: string;
  destination: string;
  price: number;
  currency: string;
  priceType: string;
  status: string;
  availableSeats: number;
  agencyName: string;
  agencySlug: string;
  agencyLogo?: string;
  imageUrl?: string;
  packageDetails: TravelPackage;
  createdAt: string;
}

interface WatchlistAgencyItem {
  id: string;
  agencyId: string;
  itemType: "agency";
  name: string;
  slug: string;
  destination: string;
  packageCount?: number;
  logo?: string;
  createdAt: string;
}

type WatchlistItem = WatchlistPackageItem | WatchlistAgencyItem;
type WatchlistTab = "all" | "package" | "agency";

export default function TravellerWatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState<WatchlistTab>("all");
  const [detailPackage, setDetailPackage] = useState<TravelPackage | null>(null);

  const loadWatchlist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setWarning(null);
    try {
      const data = await watchlistApi.list({
        page,
        limit: 20,
        itemType: activeTab === "all" ? undefined : activeTab,
      });
      const items: WatchlistItem[] = [];
      let failedItems = 0;

      const packageItems = data.items.filter((i) => i.itemType === "package" && i.packageId);
      const agencyItems = data.items.filter((i) => i.itemType === "agency" && i.agencyId);
      const agencyRequests = new Map<string, ReturnType<typeof getPublicAgencyApi>>();
      const getAgency = (agencyId: string) => {
        let request = agencyRequests.get(agencyId);
        if (!request) {
          request = getPublicAgencyApi(agencyId);
          agencyRequests.set(agencyId, request);
        }
        return request;
      };

      if (packageItems.length > 0) {
        const packageDetails = await Promise.allSettled(
          packageItems.map(async (item) => {
            const { package: pkg } = await getPackageByIdApi(item.packageId!);
            const agencyResult = await Promise.allSettled([getAgency(pkg.agencyId)]);
            return {
              item,
              pkg,
              agency:
                agencyResult[0].status === "fulfilled"
                  ? agencyResult[0].value
                  : undefined,
            };
          })
        );
        packageDetails.forEach((result) => {
          if (result.status === "fulfilled") {
            const { item, pkg, agency } = result.value;
            if (!agency) failedItems += 1;
            items.push({
              id: item.id,
              packageId: item.packageId!,
              itemType: "package",
              name: pkg.name,
              destination: pkg.destination,
              price: pkg.price,
              currency: pkg.currency,
              priceType: pkg.priceType,
              status: pkg.status,
              availableSeats: pkg.availableSeats,
              agencyName: agency?.name ?? "Travel agency",
              agencySlug: agency?.slug ?? "",
              agencyLogo: agency?.logo?.url ?? undefined,
              imageUrl: pkg.images?.[0]?.url,
              packageDetails: pkg,
              createdAt: item.createdAt,
            });
          } else {
            failedItems += 1;
          }
        });
      }

      if (agencyItems.length > 0) {
        const agencyDetails = await Promise.allSettled(
          agencyItems.map(async (item) => ({
            item,
            agency: await getAgency(item.agencyId!),
          }))
        );
        agencyDetails.forEach((result) => {
          if (result.status === "fulfilled") {
            const { item, agency } = result.value;
            items.push({
              id: item.id,
              agencyId: item.agencyId!,
              itemType: "agency",
              name: agency.name,
              slug: agency.slug,
              destination: [
                agency.location.city,
                agency.location.state,
                agency.location.country,
              ]
                .filter(Boolean)
                .join(", "),
              logo: agency.logo?.url ?? undefined,
              createdAt: item.createdAt,
            });
          } else {
            failedItems += 1;
          }
        });
      }

      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setWatchlist(items);
      setTotalPages(data.totalPages);
      if (failedItems > 0) {
        setWarning(
          `${failedItems} saved item${failedItems === 1 ? "" : "s"} could not be fully loaded. Try again to refresh.`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load watchlist");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadWatchlist();
  }, [loadWatchlist]);

  const toggleWatchlist = async (item: WatchlistItem) => {
    try {
      if (item.itemType === "package") {
        await watchlistApi.toggle({
          packageId: item.packageId,
          itemType: "package",
        });
      } else {
        await watchlistApi.toggle({
          agencyId: item.agencyId,
          itemType: "agency",
        });
      }
      setWatchlist((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update watchlist");
    }
  };

  const formatPrice = (price: number, currency: string = "INR"): string => {
    if (currency === "INR") {
      return `₹${price.toLocaleString("en-IN")}`;
    }
    return `${currency} ${price.toLocaleString("en-US")}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">Failed to load watchlist</h2>
        <p className="text-gray-500 mt-2 max-w-md">{error}</p>
        <Button onClick={loadWatchlist} variant="outline" className="mt-6">
          <RefreshCw className="h-4 w-4 mr-2" />Retry
        </Button>
      </div>
    );
  }

  const packages = watchlist.filter((item): item is WatchlistPackageItem => item.itemType === "package");
  const agencies = watchlist.filter((item): item is WatchlistAgencyItem => item.itemType === "agency");

  return (
    <>
      <div className="mb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">My Watchlist</h1>
          <p className="mt-1 text-sm leading-5 text-gray-600">
            Saved packages and agencies you want to revisit
          </p>
        </div>
      </div>

      <div
        className="mb-6 flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-white p-1"
        role="tablist"
        aria-label="Filter watchlist"
      >
        {([
          ["all", "All"],
          ["package", "Packages"],
          ["agency", "Agencies"],
        ] as const).map(([tab, label]) => (
          <button
            key={tab}
            id={`watchlist-tab-${tab}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls="watchlist-content"
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={cn(
              "whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {warning && (
        <div className="mb-6 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{warning}</span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto border-amber-300 bg-white"
            onClick={loadWatchlist}
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      {watchlist.length === 0 ? (
        <div
          id="watchlist-content"
          role="tabpanel"
          aria-labelledby={`watchlist-tab-${activeTab}`}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {warning
              ? "Saved items could not be displayed"
              : activeTab === "package"
                ? "No packages saved yet"
                : activeTab === "agency"
                  ? "No agencies saved yet"
                  : "Your watchlist is empty"}
          </h3>
          <p className="text-gray-500 max-w-md mt-2">
            {warning
              ? "We found saved items, but their details are temporarily unavailable."
              : "Save packages and agencies you love from the Explore page to find them easily later."}
          </p>
          {warning ? (
            <Button className="mt-6" onClick={loadWatchlist}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          ) : (
            <Button asChild className="mt-6">
              <Link href="/traveller/explore">Browse Packages</Link>
            </Button>
          )}
        </div>
      ) : (
        <div
          id="watchlist-content"
          role="tabpanel"
          aria-labelledby={`watchlist-tab-${activeTab}`}
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((item) => (
              <Card
                key={item.id}
                className={cn(
                  "flex flex-col overflow-hidden pt-0 transition-shadow duration-200 border border-gray-100 shadow-sm hover:shadow-md",
                  item.status !== "active" && "opacity-60 grayscale"
                )}
              >
                <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-gray-100">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-[1.015]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-gray-300" />
                  )}
                  <span className={cn(
                    "absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-caption font-semibold",
                    "bg-card/95 shadow-sm",
                    item.status === "active" ? "bg-success-muted text-success-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {item.status.replace("_", " ")}
                  </span>
                  <div className="absolute bottom-1.5 left-1.5">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-lg">
                      <span className="font-bold text-gray-900">{formatPrice(item.price, item.currency)}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-3 space-y-2">
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.name}</h3>
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{item.destination}</span>
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{item.availableSeats} seats left</span>
                    <span>{formatDisplayDate(item.createdAt, "—")}</span>
                  </div>
                  <p className="text-caption text-muted-foreground text-right">
                    {item.agencyName}
                  </p>
                </CardContent>
                <CardContent className="mt-auto flex gap-2 border-t border-gray-50 pt-3">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setDetailPackage(item.packageDetails)}
                    className="flex-1"
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    View Package
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWatchlist(item)}
                  >
                    <Heart className="mr-1.5 h-3.5 w-3.5" />
                    Unsave
                  </Button>
                </CardContent>
              </Card>
            ))}
            {agencies.map((item) => (
              <Card key={item.id} className="flex flex-col overflow-hidden pt-0 transition-shadow duration-200 border border-gray-100 shadow-sm hover:shadow-md">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  {item.logo ? (
                    <Image
                      src={item.logo}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 hover:scale-[1.015]"
                    />
                  ) : (
                    <Building2 className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-gray-300" />
                  )}
                </div>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.name}</h3>
                      <p className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{item.destination}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {item.packageCount === undefined
                        ? "Travel agency"
                        : `${item.packageCount} packages`}
                    </span>
                    <span>{formatDisplayDate(item.createdAt, "—")}</span>
                  </div>
                </CardContent>
                <CardContent className="mt-auto flex gap-2 border-t border-gray-50 pt-3">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/agencies/${encodeURIComponent(item.slug)}`}>
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      View Agency
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWatchlist(item)}
                  >
                    <Heart className="mr-1.5 h-3.5 w-3.5" />
                    Unsave
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <Button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
      <PackageDetailModal
        package={detailPackage}
        isOpen={detailPackage !== null}
        onClose={() => setDetailPackage(null)}
      />
    </>
  );
}
