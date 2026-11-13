"use client";

import { useState, useEffect, useCallback } from "react";
import { watchlistApi } from "@/features/watchlist/api/watchlist.api";
import { Button, IconButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Package, Building2, AlertTriangle, RefreshCw, MapPin, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageStack } from "@/components/shared/page-container";

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
  available: boolean;
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
  available: boolean;
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
      const failedItems = data.items.filter((item) => !item.available).length;
      const items: WatchlistItem[] = data.items.map((item) => {
        if (item.itemType === "package") {
          const pkg = item.package;
          return {
            id: item.id,
            packageId: item.packageId ?? "",
            itemType: "package",
            name: pkg?.name ?? "Package unavailable",
            destination: pkg?.destination ?? "This package is no longer public.",
            price: pkg?.price ?? 0,
            currency: pkg?.currency ?? "INR",
            priceType: pkg?.priceType ?? "per_person",
            status: pkg?.status ?? "unavailable",
            availableSeats: pkg?.availableSeats ?? 0,
            agencyName: pkg?.agencyName ?? "Agency unavailable",
            agencySlug: pkg?.agencySlug ?? "",
            agencyLogo: pkg?.agencyLogo,
            imageUrl: pkg?.imageUrl,
            available: item.available ?? false,
            createdAt: item.createdAt,
          };
        }
        const agency = item.agency;
        return {
          id: item.id,
          agencyId: item.agencyId ?? "",
          itemType: "agency",
          name: agency?.name ?? "Agency unavailable",
          slug: agency?.slug ?? "",
          destination: agency?.destination ?? "This agency is no longer public.",
          logo: agency?.logo,
          available: item.available ?? false,
          createdAt: item.createdAt,
        };
      });

      setWatchlist(items);
      setTotalPages(data.totalPages);
      if (failedItems > 0) {
        setWarning(
          `${failedItems} saved item${failedItems === 1 ? " is" : "s are"} no longer available. You can remove stale items from your list.`
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
      <PageStack>
        <PageHeader title="Saved items" description="Saved packages and agencies you want to revisit." />
        <LoadingState />
      </PageStack>
    );
  }

  if (error) {
    return (
      <PageStack>
        <PageHeader title="Saved items" description="Saved packages and agencies you want to revisit." />
        <ErrorState
          title="Could not load saved items"
          description={error}
          action={<Button onClick={loadWatchlist} variant="outline"><RefreshCw aria-hidden="true" />Try again</Button>}
        />
      </PageStack>
    );
  }

  const packages = watchlist.filter((item): item is WatchlistPackageItem => item.itemType === "package");
  const agencies = watchlist.filter((item): item is WatchlistAgencyItem => item.itemType === "agency");

  return (
    <PageStack>
      <PageHeader title="Saved items" description="Saved packages and agencies you want to revisit." />

      <div
        className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1"
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
              "whitespace-nowrap rounded-md px-4 py-2 text-body-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {warning && (
        <div role="status" className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning-muted px-4 py-3 text-body-sm text-warning-foreground">
          <AlertTriangle aria-hidden="true" className="size-4 shrink-0" />
          <span>{warning}</span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={loadWatchlist}
          >
            <RefreshCw aria-hidden="true" />
            Refresh list
          </Button>
        </div>
      )}

      {watchlist.length === 0 ? (
        <div
          id="watchlist-content"
          role="tabpanel"
          aria-labelledby={`watchlist-tab-${activeTab}`}
        >
          <EmptyState
            title={
              activeTab === "package"
                ? "No packages saved yet"
                : activeTab === "agency"
                  ? "No agencies saved yet"
                  : "Your saved list is empty"
            }
            description="Save packages and agencies from Explore to find them here later."
            icon={<Heart />}
            action={
            <Button asChild>
              <Link href="/traveller/explore">Explore trips</Link>
            </Button>
            }
          />
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
                size="sm"
                variant="interactive"
                className={cn(
                  "flex flex-col gap-0 pt-0",
                  !item.available && "opacity-80"
                )}
              >
                <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-muted">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <Package aria-hidden="true" className="size-12 text-muted-foreground" />
                  )}
                  <span className={cn(
                    "absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-caption font-semibold",
                    "bg-card/95 shadow-sm",
                    item.available ? "bg-success-muted text-success-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {item.status.replace("_", " ")}
                  </span>
                  {item.available && <div className="absolute bottom-1.5 left-1.5">
                    <div className="rounded-lg bg-card/95 px-2.5 py-1.5 shadow-card">
                      <span className="font-semibold text-foreground">{formatPrice(item.price, item.currency)}</span>
                    </div>
                  </div>}
                </div>
                <CardContent className="flex flex-1 flex-col gap-2.5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 text-card-title font-semibold text-foreground">{item.name}</h3>
                    <IconButton
                      variant="ghost"
                      size="icon-sm"
                      label={`Remove ${item.name} from saved items`}
                      onClick={() => toggleWatchlist(item)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Heart aria-hidden="true" className="size-4 fill-current" />
                    </IconButton>
                  </div>
                  <p className="flex items-center gap-1.5 text-body-sm text-muted-foreground">
                    <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                    <span className="truncate">{item.destination}</span>
                  </p>
                  <p className="mt-auto border-t border-border pt-3 text-caption text-muted-foreground">
                    {item.available ? `${item.availableSeats} seats · ${item.agencyName}` : "No longer available"}
                  </p>
                </CardContent>
                <CardContent className="border-t border-border py-3">
                  {item.available ? (
                    <Button asChild size="sm" variant="secondary" className="w-full">
                      <Link href={`/packages/${encodeURIComponent(item.packageId)}`}>
                        <Eye aria-hidden="true" />
                        View package
                      </Link>
                    </Button>
                  ) : (
                    <Button type="button" size="sm" variant="secondary" className="w-full" disabled>
                      Currently unavailable
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            {agencies.map((item) => (
              <Card key={item.id} size="sm" variant="interactive" className="flex flex-col gap-0 pt-0">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  {item.logo ? (
                    <Image
                      src={item.logo}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <Building2 aria-hidden="true" className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                  )}
                </div>
                <CardContent className="flex flex-1 flex-col gap-2.5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-card-title font-semibold text-foreground line-clamp-1">{item.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-body-sm text-muted-foreground">
                        <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                        <span className="truncate">{item.destination}</span>
                      </p>
                    </div>
                    <IconButton
                      variant="ghost"
                      size="icon-sm"
                      label={`Remove ${item.name} from saved items`}
                      onClick={() => toggleWatchlist(item)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Heart aria-hidden="true" className="size-4 fill-current" />
                    </IconButton>
                  </div>
                  <p className="mt-auto border-t border-border pt-3 text-caption text-muted-foreground">
                    {item.packageCount === undefined ? "Travel agency" : `${item.packageCount} packages`}
                  </p>
                </CardContent>
                <CardContent className="border-t border-border py-3">
                  {item.available ? (
                    <Button asChild size="sm" variant="secondary" className="w-full">
                      <Link href={`/agencies/${encodeURIComponent(item.slug)}`}>
                        <Eye aria-hidden="true" />
                        View agency
                      </Link>
                    </Button>
                  ) : (
                    <Button type="button" size="sm" variant="secondary" className="w-full" disabled>
                      Currently unavailable
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="mt-8"
            />
          )}
        </div>
      )}
    </PageStack>
  );
}
