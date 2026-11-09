"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronDown, ChevronUp, X, Calendar, Users, DollarSign, MapPin, Sparkles, Clock, Globe, SlidersHorizontal, Filter, Search, ChevronLeft, ChevronRight, Minus, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { usePackageFilters } from "@/features/public/hooks/use-package-filters";
import type { TripTheme, GeographicScope, SortOption, PackageFilters } from "@/features/public/types/public-filters.types";
import { TRIP_THEME_LABELS, SORT_OPTIONS, DURATION_PRESETS, PRICE_PRESETS } from "@/features/public/types/public-filters.types";
import { format, parseISO, startOfDay } from "date-fns";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDisplayDate } from "@/lib/date-format";
import { Spinner } from "@/components/ui/spinner";

const THEME_OPTIONS: TripTheme[] = [
  "honeymoon", "family", "adventure", "pilgrimage", "corporate", "leisure", "weekend", "custom"
];

type ExploreViewType = "packages" | "agencies" | "both";

function FilterSection({ title, icon: Icon, expanded, onToggle, children, count, hasChanges, summary }: { title: string; icon: React.ComponentType<{ className?: string }>; expanded: boolean; onToggle: () => void; children: React.ReactNode; count?: number; hasChanges?: boolean; summary?: string }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-slate-50"
        aria-expanded={expanded}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <Icon className="h-4 w-4 text-slate-600" />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-800">{title}</span>
            {summary && <span className="truncate text-xs font-medium text-slate-500">{summary}</span>}
            {count !== undefined && count > 0 && (
              <Badge variant="secondary" className="h-5 shrink-0 rounded-full bg-slate-100 px-2 text-xs text-slate-600">{count}</Badge>
            )}
            {hasChanges && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-accent-soft px-2 py-0.5 text-caption font-medium text-brand-accent-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Unsaved
              </span>
            )}
          </div>
        </div>
        <div className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-transform duration-200", expanded && "rotate-180")}>
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>
      {expanded && (
        <div className="space-y-3 border-t border-slate-100 px-3.5 py-4">{children}</div>
      )}
    </section>
  );
}

function FilterContent({ filters, draftFilters, setDraftFilters, setFilters, facets, clearFilters, hasActiveFilters, expandedSections, setExpandedSections, isApplying, viewType, onViewTypeChange }: { filters: PackageFilters; draftFilters: PackageFilters; setDraftFilters: (f: PackageFilters) => void; setFilters: (f: Partial<PackageFilters>, replace?: boolean) => void; facets?: any; clearFilters: () => void; hasActiveFilters: boolean; expandedSections: Record<string, boolean>; setExpandedSections: (f: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void; isApplying: boolean; viewType?: ExploreViewType; onViewTypeChange?: (viewType: ExploreViewType) => void }) {
  const [showAllDestinations, setShowAllDestinations] = useState(false);
  const setExpanded = useCallback((key: string) => {
    setExpandedSections((prev: Record<string, boolean>) => ({ ...prev, [key]: !prev[key] }));
  }, [setExpandedSections]);

  const handlePriceChange = ([min, max]: number[]) => {
    setDraftFilters({ ...draftFilters, priceMin: min > 0 ? min : undefined, priceMax: max < 1000000 ? max : undefined });
  };

  const handleDurationPreset = (min: number, max: number) => {
    setDraftFilters({ ...draftFilters, durationMin: min, durationMax: max === 999 ? undefined : max });
  };

  const handlePricePreset = (min: number, max: number) => {
    setDraftFilters({ ...draftFilters, priceMin: min, priceMax: max === Infinity ? undefined : max });
  };

  const hasDraftChanges = JSON.stringify(draftFilters) !== JSON.stringify(filters);

  const toggleSection = (key: string) => {
    setExpandedSections((prev: Record<string, boolean>) => ({ ...prev, [key]: !prev[key] }));
  };

  const sectionHasChanges = (section: string) => {
    const sectionKeys: Record<string, (keyof PackageFilters)[]> = {
      destination: ['destination', 'destinations'],
      dates: ['startDate', 'endDate', 'flexibleDates'],
      travelers: ['adults', 'children'],
      price: ['priceMin', 'priceMax'],
      theme: ['theme'],
      duration: ['durationMin', 'durationMax'],
      scope: ['geographicScope'],
      sort: ['sortBy'],
    };
    return sectionKeys[section]?.some(k => draftFilters[k] !== filters[k]) || false;
  };

  const destinationCount = facets?.destinations?.slice(0, 10).length || 0;

  return (
    <>
      {viewType && onViewTypeChange && (
        <FilterSection
          title="Explore"
          icon={Filter}
          expanded={expandedSections.contentType}
          onToggle={() => toggleSection("contentType")}
          summary={viewType === "packages" ? "Packages" : viewType === "agencies" ? "Agencies" : "Both"}
        >
          <div className="grid gap-2" role="radiogroup" aria-label="What to explore">
            {([
              ["packages", "Packages", "Browse travel experiences"],
              ["agencies", "Agencies", "Discover verified agencies"],
              ["both", "Both", "See packages and agencies"],
            ] as const).map(([value, label, description]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={viewType === value}
                onClick={() => onViewTypeChange(value)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                  viewType === value
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <span className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  viewType === value ? "border-blue-600" : "border-slate-300"
                )}>
                  {viewType === value && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                </span>
                <span>
                  <span className={cn("block text-sm font-medium", viewType === value ? "text-blue-800" : "text-slate-800")}>{label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
                </span>
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Destination */}
      <FilterSection 
        title="Destination" 
        icon={MapPin} 
        expanded={expandedSections.destination} 
        onToggle={() => toggleSection("destination")}
        count={(draftFilters.destinations?.length || 0) + (draftFilters.destination ? 1 : 0)}
        hasChanges={sectionHasChanges('destination')}
      >
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Search city..."
            className="mb-1 h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 text-sm placeholder:text-slate-400 focus-visible:bg-white"
            value={draftFilters.destination || ""}
            onChange={(e) => setDraftFilters({ ...draftFilters, destination: e.target.value || undefined })}
          />
        </div>
        {facets?.destinations?.slice(0, showAllDestinations ? undefined : 10).map((d: any) => (
          <label key={d.city} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50">
            <Checkbox checked={!!draftFilters.destinations?.includes(d.city)} onCheckedChange={() => {
              const current = draftFilters.destinations || [];
              setDraftFilters({ ...draftFilters, destinations: current.includes(d.city) ? current.filter((c: string) => c !== d.city) : [...current, d.city] });
            }} />
            <div className="flex-1 min-w-0">
              <span className="block truncate text-sm font-medium text-slate-800">{d.city}</span>
              <span className="text-xs text-slate-500">{d.count} {d.count === 1 ? "package" : "packages"}</span>
            </div>
          </label>
        ))}
        {facets?.destinations && facets.destinations.length > 10 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1.5 w-full text-xs text-blue-600 hover:bg-blue-50"
            onClick={() => setShowAllDestinations((showAll) => !showAll)}
          >
            {showAllDestinations ? "Show fewer destinations" : `View all ${facets.destinations.length} destinations`}
          </Button>
        )}
      </FilterSection>

      {/* Travel Dates */}
      <FilterSection title="Travel Dates" icon={Calendar} expanded={expandedSections.dates} onToggle={() => toggleSection("dates")} hasChanges={sectionHasChanges('dates')}>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-slate-500">Start date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-10 w-full justify-start rounded-lg border-slate-200 text-left font-normal",
                    !draftFilters.startDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {draftFilters.startDate ? formatDisplayDate(draftFilters.startDate, "Select a start date") : "Select a start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarPicker
                  mode="single"
                  selected={draftFilters.startDate ? parseISO(draftFilters.startDate) : undefined}
                  onSelect={(date) => {
                    const startDate = date ? format(date, "yyyy-MM-dd") : undefined;
                    const endDate = startDate && draftFilters.endDate && draftFilters.endDate < startDate
                      ? undefined
                      : draftFilters.endDate;
                    setDraftFilters({ ...draftFilters, startDate, endDate });
                  }}
                  disabled={{ before: startOfDay(new Date()) }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-medium text-slate-500">End date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-10 w-full justify-start rounded-lg border-slate-200 text-left font-normal",
                    !draftFilters.endDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {draftFilters.endDate ? formatDisplayDate(draftFilters.endDate, "Select an end date") : "Select an end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarPicker
                  mode="single"
                  selected={draftFilters.endDate ? parseISO(draftFilters.endDate) : undefined}
                  onSelect={(date) => setDraftFilters({
                    ...draftFilters,
                    endDate: date ? format(date, "yyyy-MM-dd") : undefined,
                  })}
                  disabled={{ before: startOfDay(draftFilters.startDate ? parseISO(draftFilters.startDate) : new Date()) }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <label className="flex items-center gap-1.5 mt-2 cursor-pointer p-1.5 rounded hover:bg-gray-50 transition-colors">
          <Checkbox checked={!!draftFilters.flexibleDates} onCheckedChange={(checked: boolean) => setDraftFilters({ ...draftFilters, flexibleDates: checked })} />
          <span className="text-xs text-gray-700">Flexible (±3 days)</span>
        </label>
      </FilterSection>

      {/* Travelers */}
      <FilterSection title="Travelers" icon={Users} expanded={expandedSections.travelers} onToggle={() => toggleSection("travelers")} count={(draftFilters.adults ?? 1) + (draftFilters.children ?? 0) > 1 ? (draftFilters.adults ?? 1) + (draftFilters.children ?? 0) : 0} hasChanges={sectionHasChanges('travelers')}>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
            <Label className="text-sm font-medium text-slate-700">Adults</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 bg-white" onClick={() => setDraftFilters({ ...draftFilters, adults: Math.max(1, (draftFilters.adults ?? 1) - 1) })} disabled={(draftFilters.adults ?? 1) <= 1} aria-label="Remove one adult"><Minus className="h-3.5 w-3.5" /></Button>
              <span className="w-5 text-center text-sm font-semibold tabular-nums text-slate-900">{draftFilters.adults ?? 1}</span>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 bg-white" onClick={() => setDraftFilters({ ...draftFilters, adults: (draftFilters.adults ?? 1) + 1 })} aria-label="Add one adult"><Plus className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
            <Label className="text-sm font-medium text-slate-700">Children</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 bg-white" onClick={() => setDraftFilters({ ...draftFilters, children: Math.max(0, (draftFilters.children ?? 0) - 1) })} disabled={(draftFilters.children ?? 0) <= 0} aria-label="Remove one child"><Minus className="h-3.5 w-3.5" /></Button>
              <span className="w-5 text-center text-sm font-semibold tabular-nums text-slate-900">{draftFilters.children ?? 0}</span>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 bg-white" onClick={() => setDraftFilters({ ...draftFilters, children: (draftFilters.children ?? 0) + 1 })} aria-label="Add one child"><Plus className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </div>
        <p className="text-caption text-muted-foreground mt-1.5 text-center">{(draftFilters.adults ?? 1) + (draftFilters.children ?? 0)} traveler{(draftFilters.adults ?? 1) + (draftFilters.children ?? 0) !== 1 ? 's' : ''}</p>
      </FilterSection>

{/* Price Range */}
      <FilterSection title="Price Range" icon={DollarSign} expanded={expandedSections.price} onToggle={() => toggleSection("price")} hasChanges={sectionHasChanges('price')}>
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-medium text-gray-700">
            <span>₹{(draftFilters.priceMin ?? 0).toLocaleString("en-IN")}</span>
            <span>₹{(draftFilters.priceMax ?? 1000000).toLocaleString("en-IN")}</span>
          </div>
          <div className="relative">
<Slider
            value={[draftFilters.priceMin ?? 0, draftFilters.priceMax ?? 1000000]}
            onValueChange={(value: number[]) => handlePriceChange(value)}
            max={1000000}
            step={1000}
            className="h-2"
          />
            <div className="flex justify-between mt-1.5 text-caption text-muted-foreground">
              <span>₹0</span>
              <span>₹10L+</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRICE_PRESETS.map((p) => (
              <Button key={p.label} variant="outline" size="sm" className="h-auto rounded-lg border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700" onClick={() => handlePricePreset(p.min, p.max)}>
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Trip Theme */}
      <FilterSection title="Trip Theme" icon={Sparkles} expanded={expandedSections.theme} onToggle={() => toggleSection("theme")} count={draftFilters.theme?.length || 0} hasChanges={sectionHasChanges('theme')}>
        <div className="flex flex-wrap gap-1.5">
          {THEME_OPTIONS.map((theme) => (
            <label
              key={theme}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                draftFilters.theme?.includes(theme)
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
              onClick={() => {
                const current = draftFilters.theme || [];
                setDraftFilters({ ...draftFilters, theme: current.includes(theme) ? current.filter((t: string) => t !== theme) : [...current, theme] });
              }}
            >
              <Checkbox
                checked={!!draftFilters.theme?.includes(theme)}
                onCheckedChange={(checked: boolean) => {
                  const current = draftFilters.theme || [];
                  setDraftFilters({ ...draftFilters, theme: checked ? [...current, theme] : current.filter((t: string) => t !== theme) });
                }}
                className="h-3.5 w-3.5 text-blue-600"
              />
              <span className="text-xs font-medium capitalize">{TRIP_THEME_LABELS[theme]}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Duration */}
      <FilterSection title="Duration" icon={Clock} expanded={expandedSections.duration} onToggle={() => toggleSection("duration")} count={draftFilters.durationMin || draftFilters.durationMax ? 1 : 0} hasChanges={sectionHasChanges('duration')}>
        <div className="space-y-2">
          {DURATION_PRESETS.map((p) => (
            <label
              key={p.label}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                draftFilters.durationMin === p.min && draftFilters.durationMax === p.max
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              )}
              onClick={() => handleDurationPreset(p.min, p.max)}
            >
              <Checkbox
                checked={!!(draftFilters.durationMin === p.min && draftFilters.durationMax === p.max)}
                onCheckedChange={() => handleDurationPreset(p.min, p.max)}
                className="h-3.5 w-3.5 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">{p.label}</span>
            </label>
          ))}
          <Separator className="my-1.5" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-slate-500">Minimum days</Label>
              <Input type="number" min="1" max="30" value={draftFilters.durationMin || ""} onChange={(e) => setDraftFilters({ ...draftFilters, durationMin: Number(e.target.value) || undefined })} className="h-10 rounded-lg border-slate-200 text-sm" />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-slate-500">Maximum days</Label>
              <Input type="number" min="1" max="30" value={draftFilters.durationMax || ""} onChange={(e) => setDraftFilters({ ...draftFilters, durationMax: Number(e.target.value) || undefined })} className="h-10 rounded-lg border-slate-200 text-sm" />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Geographic Scope */}
      <FilterSection title="Geographic Scope" icon={Globe} expanded={expandedSections.scope} onToggle={() => toggleSection("scope")} count={draftFilters.geographicScope ? 1 : 0} hasChanges={sectionHasChanges('scope')}>
        <div className="space-y-1.5">
          {(["domestic", "international", "regional"] as GeographicScope[]).map((scope) => (
            <label
              key={scope}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                draftFilters.geographicScope === scope
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              )}
              onClick={() => setDraftFilters({ ...draftFilters, geographicScope: scope })}
            >
              <input
                type="radio"
                name="scope"
                value={scope}
                checked={draftFilters.geographicScope === scope}
                onChange={() => setDraftFilters({ ...draftFilters, geographicScope: scope })}
                className="h-3.5 w-3.5 text-blue-600"
              />
              <span className="text-sm font-medium capitalize text-gray-900">{scope}</span>
            </label>
          ))}
          <label className={cn(
            "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
            !draftFilters.geographicScope
              ? "border-blue-300 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
          )}>
            <input
              type="radio"
              name="scope"
              value=""
              checked={!draftFilters.geographicScope}
              onChange={() => setDraftFilters({ ...draftFilters, geographicScope: undefined })}
              className="h-3.5 w-3.5 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">All</span>
          </label>
        </div>
      </FilterSection>

      {/* Sort By */}
      <FilterSection title="Sort By" icon={Filter} expanded={expandedSections.sort} onToggle={() => toggleSection("sort")} hasChanges={sectionHasChanges('sort')}>
        <Select value={draftFilters.sortBy || "recommended"} onValueChange={(value) => setDraftFilters({ ...draftFilters, sortBy: value as SortOption })}>
          <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 text-sm">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterSection>
    </>
  );
}

export function FilterSidebar({ facets, isMobile = false, onClose, viewType, onViewTypeChange }: { facets?: any; isMobile?: boolean; onClose?: () => void; viewType?: ExploreViewType; onViewTypeChange?: (viewType: ExploreViewType) => void }) {
  const { filters, setFilters, clearFilters, hasActiveFilters } = usePackageFilters();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    contentType: false,
    destination: false,
    dates: false,
    travelers: false,
    price: false,
    theme: false,
    duration: false,
    scope: false,
    sort: false,
  });
  const [draftFilters, setDraftFilters] = useState<PackageFilters>(filters);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const handlePriceChange = ([min, max]: number[]) => {
    setDraftFilters({ ...draftFilters, priceMin: min > 0 ? min : undefined, priceMax: max < 1000000 ? max : undefined });
  };

  const handleDurationPreset = (min: number, max: number) => {
    setDraftFilters({ ...draftFilters, durationMin: min, durationMax: max === 999 ? undefined : max });
  };

  const handlePricePreset = (min: number, max: number) => {
    setDraftFilters({ ...draftFilters, priceMin: min, priceMax: max === Infinity ? undefined : max });
  };

  const applyFilters = useCallback(() => {
    setIsApplying(true);
    setFilters({ ...draftFilters, page: 1 }, true);
    setIsApplying(false);
  }, [draftFilters, setFilters]);

  const resetDraft = useCallback(() => {
    setDraftFilters(filters);
  }, [filters]);

  const hasDraftChanges = JSON.stringify(draftFilters) !== JSON.stringify(filters);

  const activeFilterCount = [
    filters.destinations?.length,
    filters.theme?.length,
    filters.priceMin || filters.priceMax,
    filters.startDate || filters.endDate,
    filters.flexibleDates,
    filters.durationMin || filters.durationMax,
    filters.geographicScope,
  ].filter(Boolean).length;

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in-right">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Refine your search</h2>
              <p className="mt-0.5 text-sm text-slate-500">Choose what matters for your trip</p>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-600">
                  Clear
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close filters">
                <X className="h-4 w-4 text-slate-600" />
              </Button>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4">
            <FilterContent
              filters={filters}
              draftFilters={draftFilters}
              setDraftFilters={setDraftFilters}
              setFilters={setFilters}
              facets={facets}
              clearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              expandedSections={expandedSections}
              setExpandedSections={setExpandedSections}
              isApplying={isApplying}
              viewType={viewType}
              onViewTypeChange={onViewTypeChange}
            />
          </div>
          <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
            <div className="flex gap-3">
              <Button variant="outline" className="h-11 flex-1 rounded-lg" onClick={() => setDraftFilters(filters)} disabled={isApplying}>
                Reset
              </Button>
              <Button className="h-11 flex-1 rounded-lg bg-blue-600 font-medium text-white hover:bg-blue-700" onClick={applyFilters} disabled={!hasDraftChanges || isApplying}>
                {isApplying ? <Spinner label="Loading packages" size="sm" className="mr-1.5" /> : <>Show packages <Check className="ml-2 h-4 w-4" /></>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden w-68 flex-shrink-0 md:block">
      <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2 px-1 py-1">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <svg className="h-4 w-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            </div>
            Filters
          </h2>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs text-slate-500 hover:text-blue-700">
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
        <div className="space-y-2.5">
          <FilterContent
            filters={filters}
            draftFilters={draftFilters}
            setDraftFilters={setDraftFilters}
            setFilters={setFilters}
            facets={facets}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            expandedSections={expandedSections}
            setExpandedSections={setExpandedSections}
            isApplying={isApplying}
            viewType={viewType}
            onViewTypeChange={onViewTypeChange}
          />
        </div>
        {hasDraftChanges && (
          <div className="mt-3 border-t border-slate-200 pt-3">
            <div className="flex gap-2">
              <Button variant="outline" className="h-10 flex-1 rounded-lg text-sm" onClick={() => setDraftFilters(filters)} disabled={isApplying}>
                Reset
              </Button>
              <Button className="h-10 flex-1 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700" onClick={applyFilters} disabled={!hasDraftChanges || isApplying}>
                {isApplying ? <Spinner label="Applying filters" size="sm" className="mr-1" /> : <>Apply filters <Check className="ml-1.5 h-4 w-4" /></>}
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}