"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Map, Plus, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageStack } from "@/components/shared/page-container";
import { Pagination } from "@/components/ui/pagination";
import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { StatCard } from "@/features/agency/components/crm-ui";
import { listItinerariesApi } from "@/features/agency/api/crm.api";
import { formatCurrency, formatDate } from "@/features/agency/lib/format";
import type { Itinerary } from "@/features/agency/types/crm.types";

export default function AgencyItinerariesPage() {
  const [items, setItems] = useState<Itinerary[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<"all" | "templates" | "leads">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listItinerariesApi({
        page,
        limit: 20,
        search: search || undefined,
        isTemplate: scope === "templates" ? true : undefined,
        leadId: undefined,
      });
      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load itineraries.");
    } finally {
      setIsLoading(false);
    }
  }, [page, scope, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const visible = scope === "leads" ? items.filter((item) => item.leadId) : items;
  const templates = items.filter((item) => item.isTemplate).length;
  const aiGenerated = items.filter((item) => item.aiGenerated).length;

  return (
    <AgencyModulePage
      tab="itineraries"
      title="Itineraries"
      description="Draft day-by-day plans, save templates and reuse what works."
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/agency/itineraries/new?ai=1">
              <Sparkles className="size-4" aria-hidden="true" />
              Generate with AI
            </Link>
          </Button>
          <Button asChild>
            <Link href="/agency/itineraries/new">
              <Plus className="size-4" aria-hidden="true" />
              New itinerary
            </Link>
          </Button>
        </>
      }
    >
      <PageStack>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Itineraries" value={total} icon={Map} />
          <StatCard label="Templates" value={templates} />
          <StatCard label="AI generated" value={aiGenerated} />
        </div>

        <Card>
          <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>All itineraries</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      setPage(1);
                      setSearch(searchInput.trim());
                    }
                  }}
                  placeholder="Search name or destination"
                  className="pl-9 sm:w-64"
                />
              </div>
              <Select
                value={scope}
                onValueChange={(value) => {
                  setPage(1);
                  setScope(value as "all" | "templates" | "leads");
                }}
              >
                <SelectTrigger className="sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All itineraries</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                  <SelectItem value="leads">Linked to leads</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState variant="inline" />
            ) : error ? (
              <ErrorState
                title="Could not load itineraries"
                description={error}
                action={
                  <Button variant="outline" onClick={load}>
                    Retry
                  </Button>
                }
              />
            ) : visible.length === 0 ? (
              <EmptyState
                icon={<Map />}
                title="No itineraries yet"
                description="Create one from scratch or let AI draft the first version."
                action={
                  <Button asChild>
                    <Link href="/agency/itineraries/new">New itinerary</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {visible.map((itinerary) => (
                    <Link
                      key={itinerary.id}
                      href={`/agency/itineraries/${itinerary.id}`}
                      className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{itinerary.name}</p>
                          <p className="truncate text-caption text-muted-foreground">
                            {itinerary.destination}
                          </p>
                        </div>
                        <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
                        <span className="rounded bg-muted px-1.5 py-0.5">
                          {itinerary.durationDays}D / {itinerary.durationNights}N
                        </span>
                        {itinerary.isTemplate && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">
                            Template
                          </span>
                        )}
                        {itinerary.aiGenerated && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">
                            AI
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                        <span className="text-body-sm font-medium">
                          {formatCurrency(itinerary.totalPrice, itinerary.currency)}
                        </span>
                        <span className="text-caption text-muted-foreground">
                          {formatDate(itinerary.updatedAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </CardContent>
        </Card>
      </PageStack>
    </AgencyModulePage>
  );
}
