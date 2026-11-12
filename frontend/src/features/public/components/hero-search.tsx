"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Calendar, Users, ChevronDown, MapPin, Sparkles, Sun, Heart, Users as UsersIcon, Mountain, Church, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/shared/page-container";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { PlatformStatsDisplay } from "@/features/public/components/platform-stats";
import type { PlatformStats } from "@/features/public/api/public-packages.api";

interface HeroSearchProps {
  stats: PlatformStats;
}

const QUICK_THEMES: Array<{ value: string; label: string; icon: React.ReactNode; bg: string; color: string; hoverBg: string; hoverColor: string }> = [
  { value: "honeymoon", label: "Honeymoon", icon: <Heart className="h-4 w-4" />, bg: "bg-rose-100", color: "text-rose-700", hoverBg: "group-hover:bg-rose-600", hoverColor: "group-hover:text-white" },
  { value: "family", label: "Family", icon: <UsersIcon className="h-4 w-4" />, bg: "bg-blue-100", color: "text-blue-700", hoverBg: "group-hover:bg-blue-600", hoverColor: "group-hover:text-white" },
  { value: "adventure", label: "Adventure", icon: <Mountain className="h-4 w-4" />, bg: "bg-amber-100", color: "text-amber-700", hoverBg: "group-hover:bg-amber-600", hoverColor: "group-hover:text-white" },
  { value: "pilgrimage", label: "Pilgrimage", icon: <Church className="h-4 w-4" />, bg: "bg-purple-100", color: "text-purple-700", hoverBg: "group-hover:bg-purple-600", hoverColor: "group-hover:text-white" },
  { value: "leisure", label: "Leisure", icon: <Sun className="h-4 w-4" />, bg: "bg-amber-100", color: "text-amber-700", hoverBg: "group-hover:bg-amber-600", hoverColor: "group-hover:text-white" },
  { value: "weekend", label: "Weekend", icon: <CalendarIcon className="h-4 w-4" />, bg: "bg-green-100", color: "text-green-700", hoverBg: "group-hover:bg-green-600", hoverColor: "group-hover:text-white" },
];

const POPULAR_DESTINATIONS = [
  { name: "Goa", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop", count: 45 },
  { name: "Kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop", count: 38 },
  { name: "Rajasthan", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&h=300&fit=crop", count: 32 },
  { name: "Himachal", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop", count: 28 },
  { name: "Kashmir", image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop", count: 24 },
  { name: "Andaman", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop", count: 18 },
];

export function HeroSearch({ stats }: HeroSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [showTravelers, setShowTravelers] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("all");
  const [showDestinations, setShowDestinations] = useState(false);
  const travelersRef = useRef<HTMLDivElement>(null);
  const destinationsRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set("destination", destination.trim());
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    params.set("adults", String(adults));
    if (children > 0) params.set("children", String(children));
    if (selectedTheme !== "all") params.set("theme", selectedTheme);
    params.set("page", "1");
    params.set("status", "active");
    params.set("status", "sold_out");
    params.set("sortBy", "recommended");
    params.set("limit", "24");

    router.push(`/packages?${params.toString()}`, { scroll: false });
    setShowTravelers(false);
    setShowDestinations(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (travelersRef.current && !travelersRef.current.contains(e.target as Node)) {
      setShowTravelers(false);
    }
    if (destinationsRef.current && !destinationsRef.current.contains(e.target as Node)) {
      setShowDestinations(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalTravelers = adults + children;

  return (
    <section className="relative overflow-hidden bg-background py-10 sm:py-12">

      <PageContainer className="relative py-0">
        {/* Search-focused landing heading */}
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
            <Sparkles className="h-4 w-4" />
            Discover handpicked experiences from verified agencies
          </span>
          <h1 className="text-display font-bold tracking-tight text-foreground">
            Your Perfect Journey
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
              Starts Here
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-body text-muted-foreground">
            Compare curated packages, read real reviews, and book with confidence. No hidden fees, no surprises.
          </p>
        </div>

        {/* Search Card */}
        <div className="mx-auto max-w-4xl">
          <Card className="gap-0 p-4 shadow-card sm:p-5">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Destination Input with autocomplete */}
              <div className="relative" ref={destinationsRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Where to?</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    value={destination}
                    onChange={(e) => { setDestination(e.target.value); setShowDestinations(true); }}
                    onFocus={() => destination && setShowDestinations(true)}
                    placeholder="e.g., Goa, Kerala, Bali, Maldives..."
                    className="h-11 rounded-md border-input bg-muted pl-10 pr-10 text-base focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    autoComplete="off"
                  />
                  {showDestinations && destination && (
                    <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-md">
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Popular Destinations</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 max-h-64 overflow-y-auto">
                        {POPULAR_DESTINATIONS.map((dest) => (
                          <button
                            key={dest.name}
                            type="button"
                            onClick={() => { setDestination(dest.name); setShowDestinations(false); }}
                            className="group relative aspect-[4/3] overflow-hidden rounded-lg"
                          >
                            <Image
                              src={dest.image}
                              alt={dest.name}
                              fill
                              className="object-cover"
                              sizes="100px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2 text-left">
                              <p className="text-white font-medium text-sm">{dest.name}</p>
                              <p className="text-white/80 text-xs">{dest.count} packages</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Row: Dates + Travelers + Theme */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="h-11 rounded-md border-input bg-muted pl-10 text-base focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split("T")[0]}
                      className="h-11 rounded-md border-input bg-muted pl-10 text-base focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    />
                  </div>
                </div>

                {/* Travelers Dropdown */}
                <div className="relative" ref={travelersRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Travelers</label>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full justify-between border-border bg-background text-left hover:bg-muted"
                    onClick={() => { setShowTravelers(!showTravelers); setShowDestinations(false); }}
                  >
                    <span className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{totalTravelers} Traveler{totalTravelers !== 1 ? "s" : ""}</p>
                        <p className="text-xs text-gray-500">{adults} Adult{adults !== 1 ? "s" : ""}{children > 0 ? `, ${children} Child${children !== 1 ? "ren" : ""}` : ""}</p>
                      </div>
                    </span>
                    <ChevronDown className={cn("h-5 w-5 text-gray-400 transition-transform", showTravelers && "rotate-180")} />
                  </Button>

                  {showTravelers && (
                    <div className="absolute z-50 mt-2 w-full rounded-lg border border-border bg-popover p-3 shadow-md sm:w-72">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Adults (18+)</label>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">{adults}</span>
                            <div className="flex items-center gap-2">
                              <IconButton variant="outline" onClick={() => setAdults(Math.max(1, adults - 1))} disabled={adults <= 1} label="Remove one adult"><ChevronDown className="size-4" /></IconButton>
                              <IconButton variant="outline" onClick={() => setAdults(adults + 1)} label="Add one adult"><ChevronDown className="size-4 rotate-180" /></IconButton>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Children (2-17)</label>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">{children}</span>
                            <div className="flex items-center gap-2">
                              <IconButton variant="outline" onClick={() => setChildren(Math.max(0, children - 1))} disabled={children <= 0} label="Remove one child"><ChevronDown className="size-4" /></IconButton>
                              <IconButton variant="outline" onClick={() => setChildren(children + 1)} label="Add one child"><ChevronDown className="size-4 rotate-180" /></IconButton>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Theme Chips */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={selectedTheme === "all" ? "default" : "outline"}
                    size="sm"
                    className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white border-none hover:from-blue-700 hover:to-blue-600"
                    onClick={() => setSelectedTheme("all")}
                  >
                    <Sparkles className="h-4 w-4" /> All Types
                  </Button>
                  {QUICK_THEMES.map((theme) => (
                    <Button
                      key={theme.value}
                      type="button"
                      variant={selectedTheme === theme.value ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "gap-2 font-medium",
                        selectedTheme === theme.value
                          ? `${theme.bg} ${theme.color} border-none text-white hover:opacity-90`
                          : `bg-white ${theme.bg} ${theme.color} ${theme.hoverBg} ${theme.hoverColor} hover:border-blue-300`
                      )}
                      onClick={() => setSelectedTheme(selectedTheme === theme.value ? "all" : theme.value)}
                    >
                      {theme.icon}
                      {theme.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Search Button */}
              <Button type="submit" className="h-11 w-full font-medium">
                <span className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Packages
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </form>
          </Card>
        </div>

        <div className="mt-8">
          <PlatformStatsDisplay stats={stats} />
        </div>
      </PageContainer>
    </section>
  );
}