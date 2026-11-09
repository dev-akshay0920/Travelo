"use client";

import { useState, useEffect, useCallback } from "react";
import { watchlistApi } from "@/features/watchlist/api/watchlist.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Package, Building2, AlertTriangle, RefreshCw, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

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
  createdAt: string;
}

interface WatchlistAgencyItem {
  id: string;
  agencyId: string;
  itemType: "agency";
  name: string;
  slug: string;
  destination: string;
  packageCount: number;
  logo?: string;
  createdAt: string;
}

type WatchlistItem = WatchlistPackageItem | WatchlistAgencyItem;

export default function TravellerWatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const loadWatchlist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await watchlistApi.list({ page, limit: 20 });
      const items: WatchlistItem[] = [];

      const packageItems = data.items.filter((i) => i.itemType === "package" && i.packageId);
      const agencyItems = data.items.filter((i) => i.itemType === "agency" && i.agencyId);

      if (packageItems.length > 0) {
        const packageDetails = await Promise.allSettled(
          packageItems.map((item) =>
            fetch(`/api/packages/${encodeURIComponent(item.packageId!)}`, {
              headers: { "Content-Type": "application/json" },
            }).then((r) => r.json())
          )
        );
        packageDetails.forEach((result, idx) => {
          if (result.status === "fulfilled" && result.value.success) {
            const pkg = result.value.data.package;
            items.push({
              id: packageItems[idx].id,
              packageId: packageItems[idx].packageId!,
              itemType: "package",
              name: pkg.name,
              destination: pkg.destination,
              price: pkg.price,
              currency: pkg.currency,
              priceType: pkg.priceType,
              status: pkg.status,
              availableSeats: pkg.availableSeats,
              agencyName: pkg.agencyName,
              agencySlug: pkg.agencySlug,
              agencyLogo: pkg.agencyLogo,
              imageUrl: pkg.images?.[0]?.url,
              createdAt: packageItems[idx].createdAt,
            });
          }
        });
      }

      if (agencyItems.length > 0) {
        try {
          const agenciesRes = await fetch(`/api/public/agencies?limit=100`, {
            headers: { "Content-Type": "application/json" },
          });
          const agenciesData = await agenciesRes.json();
          const agencies = agenciesData.data?.items || agenciesData.items || [];

          agencyItems.forEach((item) => {
            const agency = agencies.find((a: { id: string }) => a.id === item.agencyId);
            if (agency) {
              items.push({
                id: item.id,
                agencyId: item.agencyId!,
                itemType: "agency",
                name: agency.name,
                slug: agency.slug,
                destination: agency.destination,
                packageCount: agency.packageCount,
                logo: agency.logo,
                createdAt: item.createdAt,
              });
            }
          });
        } catch {
          // Agencies fetch failed, skip
        }
      }

      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setWatchlist(items);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load watchlist");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

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
      <div className="flex h-screen overflow-hidden">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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

  const packages = watchlist.filter((i) => i.itemType === "package");
  const agencies = watchlist.filter((i) => i.itemType === "agency");

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Watchlist</h1>
          <p className="mt-1 text-gray-600">
            Saved packages and agencies you want to revisit
          </p>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Your watchlist is empty</h3>
          <p className="text-gray-500 max-w-md mt-2">
            Save packages and agencies you love from the Explore page to find them easily later.
          </p>
          <Button
            asChild
            className="mt-6"
          >
            <Link href="/traveller/explore">Browse Packages</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((item) => (
              <Card
                key={item.id}
                className={cn(
                  "flex flex-col overflow-hidden transition-shadow duration-200 border border-gray-100 shadow-sm hover:shadow-md",
                  item.status !== "active" && "opacity-60 grayscale"
                )}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-[1.015]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <Package className="absolute inset-0 w-12 h-12 mx-auto my-auto text-gray-300" />
                  )}
                  <span className={cn(
                    "absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                    "bg-white/95 backdrop-blur-sm shadow-sm",
                    item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
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
                    <span>{new Date(item.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 text-right">
                    {item.agencyName}
                  </p>
                </CardContent>
                <CardContent className="flex justify-end gap-3 pt-3 border-t border-gray-50">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={item.status !== "active"}
                    onClick={() => toggleWatchlist(item)}
                    className="flex-1"
                  >
                    <Heart className="h-3.5 w-3.5 mr-1.5" />{
                      item.status !== "active" ? "Outdated" : "Unsave"
                    }
                  </Button>
                </CardContent>
              </Card>
            ))}
            {agencies.map((item) => (
              <Card key={item.id} className="flex flex-col overflow-hidden transition-shadow duration-200 border border-gray-100 shadow-sm hover:shadow-md">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  {item.logo ? (
                    <Image
                      src={item.logo}
                      alt={item.name}
                      width={400}
                      height={250}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.015]"
                    />
                  ) : (
                    <Building2 className="absolute inset-0 w-12 h-12 mx-auto my-auto text-gray-300" />
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
                    <span>{item.packageCount} packages</span>
                    <span>{new Date(item.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </CardContent>
                <CardContent className="flex justify-end gap-3 pt-3 border-t border-gray-50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWatchlist(item)}
                    className="flex-1"
                  >
                    <Heart className="h-3.5 w-3.5 mr-1.5" />Unsave
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
        </>
      )}
    </>
  );
}
