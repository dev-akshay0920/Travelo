"use client";

import { useState, useEffect, useCallback } from "react";
import { watchlistApi } from "@/features/watchlist/api/watchlist.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Package, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TravellerWatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const loadWatchlist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await watchlistApi.list(page, 12);
      setWatchlist(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load watchlist");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  const toggleWatchlist = async (packageId: string, currentlySaved: boolean) => {
    try {
      const result = await watchlistApi.toggle(packageId);
      setWatchlist((prev) =>
        result.saved
          ? [...prev, { id: result.watchlistItem?.id, packageId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
          : prev.filter((item) => item.packageId !== packageId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update watchlist");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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

  return (
    <>
      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Your watchlist is empty</h3>
          <p className="text-gray-500 max-w-md mt-2">
            Save packages you love from the Explore page to find them easily later.
          </p>
          <Button
            onClick={() => {}}
            asChild
            className="mt-6"
          >
            {/* Link would be added here */}
            Browse Packages
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Watchlist</h1>
              <p className="mt-1 text-gray-600">
                Saved packages you want to revisit
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Saved Packages</h2>
              <p className="mt-1 text-sm text-gray-500">
                {total} package{total !== 1 ? "s" : ""} saved
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {watchlist.map((item) => (
              <Card
                key={item.id}
                className="flex flex-col overflow-hidden transition-shadow duration-200 border border-gray-100 shadow-sm hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Package</CardTitle>
                    <Badge variant="outline">Saved</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                        Package #{item.packageId.slice(-6)}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Package className="h-3 w-3 flex-shrink-0" />
                        <span>Saved on {new Date(item.createdAt).toLocaleDateString("en-IN")}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardContent className="flex justify-end gap-3 pt-3 border-t border-gray-50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWatchlist(item.packageId, true)}
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
