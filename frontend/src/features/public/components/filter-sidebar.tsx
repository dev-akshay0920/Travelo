"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronDown, ChevronUp, X, Calendar, Users, DollarSign, MapPin, Sparkles, Clock, Globe, SlidersHorizontal, Filter, Search, ChevronLeft, ChevronRight, Minus, Plus, Loader2, Check } from "lucide-react";
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

const THEME_OPTIONS: TripTheme[] = [
  "honeymoon", "family", "adventure", "pilgrimage", "corporate", "leisure", "weekend", "custom"
];

function FilterSection({ title, icon: Icon, expanded, onToggle, children, count, hasChanges }: { title: string; icon: React.ComponentType<{ className?: string }>; expanded: boolean; onToggle: () => void; children: React.ReactNode; count?: number; hasChanges?: boolean }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2.5 bg-gray-50/50 hover:bg-gray-50 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Icon className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="font-medium text-gray-900 truncate text-sm">{title}</span>
            {count !== undefined && count > 0 && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">{count}</Badge>
            )}
            {hasChanges && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded-full">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                Pending
              </span>
            )}
          </div>
        </div>
        <div className={cn("h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0", expanded && "rotate-180")}>
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>
      {expanded && (
        <div className="p-3 pt-0 animate-slide-down border-t border-gray-100 space-y-2">{children}</div>
      )}
    </div>
  );
}

function FilterContent({ filters, draftFilters, setDraftFilters, setFilters, facets, clearFilters, hasActiveFilters, expandedSections, setExpandedSections, isApplying }: { filters: PackageFilters; draftFilters: PackageFilters; setDraftFilters: (f: PackageFilters) => void; setFilters: (f: Partial<PackageFilters>, replace?: boolean) => void; facets?: any; clearFilters: () => void; hasActiveFilters: boolean; expandedSections: Record<string, boolean>; setExpandedSections: (f: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void; isApplying: boolean }) {
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
      {/* Destination */}
      <FilterSection 
        title="Destination" 
        icon={MapPin} 
        expanded={expandedSections.destination} 
        onToggle={() => toggleSection("destination")}
        count={facets?.destinations?.slice(0, 10).length || 0}
        hasChanges={sectionHasChanges('destination')}
      >
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Search city..."
            className="pl-8 mb-2 h-9 text-sm"
            value={draftFilters.destination || ""}
            onChange={(e) => setDraftFilters({ ...draftFilters, destination: e.target.value || undefined })}
          />
        </div>
        {facets?.destinations?.slice(0, 10).map((d: any) => (
          <label key={d.city} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded px-1.5 transition-colors">
            <Checkbox checked={!!draftFilters.destinations?.includes(d.city)} onCheckedChange={() => {
              const current = draftFilters.destinations || [];
              setDraftFilters({ ...draftFilters, destinations: current.includes(d.city) ? current.filter((c: string) => c !== d.city) : [...current, d.city] });
            }} />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-gray-900 truncate block">{d.city}</span>
              <span className="text-[10px] text-gray-500">{d.count} pkg</span>
            </div>
          </label>
        ))}
        {facets?.destinations && facets.destinations.length > 10 && (
          <Button variant="ghost" size="sm" className="w-full mt-1.5 text-xs text-blue-600 hover:bg-blue-50" onClick={() => toggleSection("destination")}>
            View all {facets.destinations.length} destinations
          </Button>
        )}
      </FilterSection>

      {/* Travel Dates */}
      <FilterSection title="Travel Dates" icon={Calendar} expanded={expandedSections.dates} onToggle={() => toggleSection("dates")} hasChanges={sectionHasChanges('dates')}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Check-in</Label>
            <Input type="date" value={draftFilters.startDate || ""} onChange={(e) => setDraftFilters({ ...draftFilters, startDate: e.target.value || undefined })} className="h-9 text-sm" min={new Date().toISOString().split("T")[0]} />
          </div>
          <div>
            <Label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Check-out</Label>
            <Input type="date" value={draftFilters.endDate || ""} onChange={(e) => setDraftFilters({ ...draftFilters, endDate: e.target.value || undefined })} className="h-9 text-sm" min={draftFilters.startDate || new Date().toISOString().split("T")[0]} />
          </div>
        </div>
        <label className="flex items-center gap-1.5 mt-2 cursor-pointer p-1.5 rounded hover:bg-gray-50 transition-colors">
          <Checkbox checked={!!draftFilters.flexibleDates} onCheckedChange={(checked: boolean) => setDraftFilters({ ...draftFilters, flexibleDates: checked })} />
          <span className="text-xs text-gray-700">Flexible (±3 days)</span>
        </label>
      </FilterSection>

      {/* Travelers */}
      <FilterSection title="Travelers" icon={Users} expanded={expandedSections.travelers} onToggle={() => toggleSection("travelers")} count={(draftFilters.adults ?? 1) + (draftFilters.children ?? 0)} hasChanges={sectionHasChanges('travelers')}>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-gray-50 rounded">
            <Label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Adults</Label>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900 w-10 text-center" style={{ fontFeatureSettings: '"tnum"' }}>{draftFilters.adults ?? 1}</span>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded" onClick={() => setDraftFilters({ ...draftFilters, adults: Math.max(1, (draftFilters.adults ?? 1) - 1) })} disabled={(draftFilters.adults ?? 1) <= 1}><Minus className="h-3.5 w-3.5" /></Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded" onClick={() => setDraftFilters({ ...draftFilters, adults: (draftFilters.adults ?? 1) + 1 })}><Plus className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <Label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Children</Label>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900 w-10 text-center" style={{ fontFeatureSettings: '"tnum"' }}>{draftFilters.children ?? 0}</span>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded" onClick={() => setDraftFilters({ ...draftFilters, children: Math.max(0, (draftFilters.children ?? 0) - 1) })} disabled={(draftFilters.children ?? 0) <= 0}><Minus className="h-3.5 w-3.5" /></Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded" onClick={() => setDraftFilters({ ...draftFilters, children: (draftFilters.children ?? 0) + 1 })}><Plus className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 mt-1.5 text-center">{(draftFilters.adults ?? 1) + (draftFilters.children ?? 0)} traveler{(draftFilters.adults ?? 1) + (draftFilters.children ?? 0) !== 1 ? 's' : ''}</p>
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
            <div className="flex justify-between mt-1.5 text-[10px] text-gray-500">
              <span>₹0</span>
              <span>₹10L+</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRICE_PRESETS.map((p) => (
              <Button key={p.label} variant="outline" size="sm" className="px-2.5 py-1.5 rounded text-xs transition-colors hover:bg-blue-50 hover:border-blue-300" onClick={() => handlePricePreset(p.min, p.max)}>
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
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer",
                draftFilters.theme?.includes(theme)
                  ? "bg-blue-50 border-blue-500 text-blue-700 border shadow-[0_0_0_1px_rgb(37,99,235)]"
                  : "bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-200 border"
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
                "flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors cursor-pointer",
                draftFilters.durationMin === p.min && draftFilters.durationMax === p.max
                  ? "bg-blue-50 border-blue-500 text-blue-700 border shadow-[0_0_0_1px_rgb(37,99,235)]"
                  : "bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-200 border"
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
              <Label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Min Days</Label>
              <Input type="number" min="1" max="30" value={draftFilters.durationMin || ""} onChange={(e) => setDraftFilters({ ...draftFilters, durationMin: Number(e.target.value) || undefined })} className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Max Days</Label>
              <Input type="number" min="1" max="30" value={draftFilters.durationMax || ""} onChange={(e) => setDraftFilters({ ...draftFilters, durationMax: Number(e.target.value) || undefined })} className="h-9 text-sm" />
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
                "flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors cursor-pointer border",
                draftFilters.geographicScope === scope
                  ? "bg-blue-50 border-blue-500 text-blue-700 border shadow-[0_0_0_1px_rgb(37,99,235)]"
                  : "bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-200 border"
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
            "flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors cursor-pointer border",
            !draftFilters.geographicScope
              ? "bg-blue-50 border-blue-500 text-blue-700 border shadow-[0_0_0_1px_rgb(37,99,235)]"
              : "bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-200 border"
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
          <SelectTrigger className="w-full h-9 text-sm">
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

export function FilterSidebar({ facets, isMobile = false, onClose }: { facets?: any; isMobile?: boolean; onClose?: () => void }) {
  const { filters, setFilters, clearFilters, hasActiveFilters } = usePackageFilters();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    destination: true,
    dates: true,
    travelers: true,
    price: true,
    theme: true,
    duration: true,
    scope: true,
    sort: true,
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

  const applyFilters = useCallback(async () => {
    setIsApplying(true);
    try {
      Object.entries(draftFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            if (value.length === 0) {
              setFilters({ [key]: [] });
            } else {
              setFilters({ [key]: value });
            }
          } else {
            setFilters({ [key]: value });
          }
        } else {
          setFilters({ [key]: undefined });
        }
      });
    } finally {
      setIsApplying(false);
    }
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
      <div className="fixed inset-0 z-50 md:hidden">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl flex flex-col animate-slide-in-right">
          <div className="flex items-center justify-between p-3 border-b border-gray-100 sticky top-0 bg-white z-10">
            <h2 className="text-base font-semibold text-gray-900">Filters</h2>
            <div className="flex items-center gap-1.5">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
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
            />
          </div>
          <div className="p-3 border-t border-gray-100 bg-white sticky bottom-0">
            <div className="flex gap-1.5">
              <Button variant="outline" className="flex-1 text-xs py-2" onClick={() => setDraftFilters(filters)} disabled={isApplying}>
                Reset
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm" onClick={applyFilters} disabled={!hasDraftChanges || isApplying}>
                {isApplying ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <>Apply <Check className="ml-1 h-3 w-3" /></>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden md:block w-68 flex-shrink-0">
      <div className="sticky top-20 space-y-4">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-md bg-blue-100 flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            </div>
            Filters
          </h2>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs">
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
        <div className="space-y-3">
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
          />
        </div>
        {hasDraftChanges && (
          <div className="pt-2.5 border-t border-gray-100">
            <div className="flex gap-1.5">
              <Button variant="outline" className="flex-1 text-xs py-2" onClick={() => setDraftFilters(filters)} disabled={isApplying}>
                Reset
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm" onClick={applyFilters} disabled={!hasDraftChanges || isApplying}>
                {isApplying ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <>Apply <Check className="ml-1 h-3 w-3" /></>}
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}