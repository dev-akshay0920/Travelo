"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Package, Clock, Phone, Mail, AlertTriangle, RefreshCw, Heart, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getPublicAgencyApi } from "@/features/agencies/api/agency.api";
import { getPackagesApi } from "@/features/packages/api/package.api";
import { watchlistApi } from "@/features/watchlist/api/watchlist.api";
import type { AgencyProfile } from "@/features/agencies/types/agency.types";

interface AgencyPackage {
  id: string;
  name: string;
  slug: string;
  destination: string;
  price: number;
  currency: string;
  priceType: string;
  status: string;
  availableSeats: number;
  agencyId: string;
  agencyName: string;
  images?: Array<{ url: string; altText?: string; isPrimary: boolean; order: number }>;
  startDate: string;
  endDate: string;
}

function formatPrice(price: number, currency: string = "INR"): string {
  if (currency === "INR") {
    return `₹${price.toLocaleString("en-IN")}`;
  }
  return `${currency} ${price.toLocaleString("en-US")}`;
}

function formatDate(dateString: string): string {
  if (!dateString) return "\u2014";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getServiceLabel(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function TravellerAgencyDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [agency, setAgency] = useState<AgencyProfile | null>(null);
  const [packages, setPackages] = useState<AgencyPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAgency = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    try {
      const [agencyData, savedData] = await Promise.allSettled([
        getPublicAgencyApi(slug),
        watchlistApi.isSavedAgency(slug),
      ]);

      if (agencyData.status === "fulfilled") {
        setAgency(agencyData.value);
      }

      if (savedData.status === "fulfilled") {
        setIsSaved(savedData.value.saved);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agency");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAgency();
  }, [loadAgency]);

  useEffect(() => {
    if (!agency) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getPackagesApi({});
        if (!cancelled) {
          const agencyPkgs = data.items.filter((p: unknown) => String((p as { agencyId?: string }).agencyId) === agency.id);
          setPackages(agencyPkgs.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            destination: p.destination,
            price: p.price,
            currency: p.currency,
            priceType: p.priceType,
            status: p.status,
            availableSeats: p.availableSeats,
            agencyId: p.agencyId,
            agencyName: agency.name,
            images: p.images?.map((img) => ({ url: img.url, altText: img.altText, isPrimary: img.isPrimary, order: img.order })),
            startDate: p.startDate,
            endDate: p.endDate,
          })));
        }
      } catch {
        if (!cancelled) setPackages([]);
      }
    })();
    return () => { cancelled = true; };
  }, [agency]);

  const toggleAgencyWatchlist = async () => {
    if (!agency) return;
    setSaving(true);
    try {
      await watchlistApi.toggle({
        agencyId: agency.id,
        itemType: "agency",
      });
      setIsSaved((prev) => !prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update watchlist");
    } finally {
      setSaving(false);
    }
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

  if (error || !agency) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">Agency not found</h2>
        <p className="text-gray-500 mt-2 max-w-md">{error || "The agency you are looking for does not exist."}</p>
        <Button onClick={() => window.history.back()} variant="outline" className="mt-6">
          <RefreshCw className="h-4 w-4 mr-2" />Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{agency.name}</h1>
            <p className="mt-1 text-gray-600">
              {agency.about ? agency.about.slice(0, 120) : "Verified travel agency"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isSaved ? "outline" : "default"}
              size="sm"
              disabled={saving}
              onClick={toggleAgencyWatchlist}
              className="flex-1"
            >
              <Heart className="h-4 w-4 mr-2" />{isSaved ? "Saved" : "Save Agency"}
            </Button>
          </div>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-start gap-4 pb-4">
          <div className="relative shrink-0">
            {agency.logo?.url ? (
              <Image
                src={agency.logo.url}
                alt={agency.name}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-sm"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                <Building2 className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={agency.status === "approved" ? "default" : "secondary"} className="text-xs">
                {agency.status.charAt(0).toUpperCase() + agency.status.slice(1)}
              </Badge>
              {agency.yearEstablished && (
                <span className="text-xs text-gray-500">\u2022 {agency.yearEstablished}</span>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {agency.about || "No description available."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {agency.services?.map((service) => (
                <Badge key={service} variant="outline" className="text-xs">
                  {getServiceLabel(service)}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" asChild className="text-gray-500 hover:text-gray-700">
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([agency.location.city, agency.location.state, agency.location.country].filter(Boolean).join(", "))}`} target="_blank" rel="noopener noreferrer">
                <MapPin className="h-5 w-5" />
              </a>
            </Button>
            {agency.contact.phone && (
              <Button variant="outline" size="icon" asChild className="text-gray-500 hover:text-gray-700">
                <a href={`tel:${agency.contact.phone}`}>
                  <Phone className="h-5 w-5" />
                </a>
              </Button>
            )}
            {agency.contact.email && (
              <Button variant="outline" size="icon" asChild className="text-gray-500 hover:text-gray-700">
                <a href={`mailto:${agency.contact.email}`}>
                  <Mail className="h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Location</h3>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>
                  {agency.location.city}, {agency.location.state}, {agency.location.country}
                </span>
              </p>
              {agency.location.address && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span>{agency.location.address}</span>
                </p>
              )}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Contact</h3>
              {agency.contact.phone && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <a href={`tel:${agency.contact.phone}`} className="text-primary hover:underline">{agency.contact.phone}</a>
                </p>
              )}
              {agency.contact.email && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <a href={`mailto:${agency.contact.email}`} className="text-primary hover:underline">{agency.contact.email}</a>
                </p>
              )}
              {agency.contact.website && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Users className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <a href={agency.contact.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{agency.contact.website}</a>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Packages by {agency.name}</h2>
        <Badge variant="outline" className="text-sm">
          {packages.length} package{packages.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No packages yet</h3>
          <p className="text-gray-500 max-w-md mt-2">
            {agency.name} hasn&apos;t listed any travel packages yet. Check back later.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={cn(
                "flex flex-col overflow-hidden transition-shadow duration-200 border border-gray-100 shadow-sm hover:shadow-md group",
                pkg.status !== "active" && "opacity-60 grayscale"
              )}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                {pkg.images?.[0]?.url ? (
                  <Image
                    src={pkg.images[0].url}
                    alt={pkg.name}
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
                  pkg.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                )}>
                  {pkg.status.replace("_", " ")}
                </span>
                <div className="absolute bottom-1.5 left-1.5">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-lg">
                    <span className="font-bold text-gray-900">{formatPrice(pkg.price, pkg.currency)}</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-3 space-y-2">
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{pkg.name}</h3>
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{pkg.destination}</span>
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(pkg.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(pkg.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{pkg.availableSeats} seats</span>
                  </div>
                </div>
              </CardContent>
              <CardContent className="flex justify-end gap-3 pt-3 border-t border-gray-50">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pkg.status !== "active"}
                  onClick={() => {}}
                  className="flex-1"
                >
                  {pkg.status !== "active" ? "Outdated" : "View"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
