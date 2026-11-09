"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Package, AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { fetchPublicAgencies } from "@/features/public/api/public-packages.api";
import type { AgencySummary } from "@/features/public/api/public-packages.api";

interface AgencyCardItem extends AgencySummary {
  isSaved?: boolean;
}

export default function TravellerAgenciesPage() {
  const [agencies, setAgencies] = useState<AgencyCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAgencies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPublicAgencies(50);
      setAgencies((data.items || []).map((a) => ({ ...a, isSaved: false })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agencies");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAgencies();
  }, [loadAgencies]);

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
        <h2 className="text-lg font-semibold text-gray-900">Failed to load agencies</h2>
        <p className="text-gray-500 mt-2 max-w-md">{error}</p>
        <Button onClick={loadAgencies} variant="outline" className="mt-6">
          <RefreshCw className="h-4 w-4 mr-2" />Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel Agencies</h1>
          <p className="mt-1 text-gray-600">
            Discover verified travel agencies and explore their packages
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {agencies.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No agencies found</h3>
            <p className="text-gray-500 max-w-md mt-2">
              No travel agencies are currently available. Please check back later.
            </p>
          </div>
        ) : (
          agencies.map((agency) => (
            <Card
              key={agency.id}
              className="flex flex-col overflow-hidden transition-shadow duration-200 border border-gray-100 shadow-sm hover:shadow-md group"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                {agency.logo ? (
                  <Image
                    src={agency.logo}
                    alt={agency.name}
                    width={400}
                    height={250}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.015]"
                  />
                ) : (
                  <Building2 className="absolute inset-0 w-16 h-16 mx-auto my-auto text-gray-300" />
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {agency.name}
                    </CardTitle>
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{agency.destination}</span>
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {agency.packageCount} packages
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{agency.packageCount} active package{agency.packageCount !== 1 ? "s" : ""}</span>
                </div>
              </CardContent>
              <CardContent className="flex justify-end gap-3 pt-3 border-t border-gray-50">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                >
                  <Link href={`/traveller/agencies/${agency.slug}`}>
                    <Package className="h-3.5 w-3.5 mr-1.5" />View Packages
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
