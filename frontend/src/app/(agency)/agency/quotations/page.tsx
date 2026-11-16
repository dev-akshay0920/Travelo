"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Copy, FileText, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageStack } from "@/components/shared/page-container";
import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { StatCard, StatusPill } from "@/features/agency/components/crm-ui";
import {
  getQuotationStatusCountsApi,
  listQuotationsApi,
} from "@/features/agency/api/crm.api";
import { formatCurrency, formatDate } from "@/features/agency/lib/format";
import {
  QUOTATION_STATUSES,
  type Quotation,
  type QuotationStatus,
} from "@/features/agency/types/crm.types";

export default function AgencyQuotationsPage() {
  const [items, setItems] = useState<Quotation[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<QuotationStatus | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listQuotationsApi({
        page,
        limit: 20,
        search: search || undefined,
        status: status === "all" ? undefined : status,
      });
      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load quotations.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    getQuotationStatusCountsApi()
      .then((value) => {
        if (!cancelled) setCounts(value);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const copyLink = async (quotation: Quotation) => {
    const link = `${window.location.origin}/quotation/${quotation.publicShareLink}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Public link copied.");
    } catch {
      toast.error(link);
    }
  };

  return (
    <AgencyModulePage
      tab="quotations"
      title="Quotations"
      description="Price the trip, share a link and track acceptance."
      actions={
        <Button asChild>
          <Link href="/agency/quotations/new">
            <Plus className="size-4" aria-hidden="true" />
            New quotation
          </Link>
        </Button>
      }
    >
      <PageStack>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total" value={total} icon={FileText} />
          <StatCard label="Sent" value={counts.sent ?? 0} />
          <StatCard label="Accepted" value={counts.accepted ?? 0} tone="success" />
          <StatCard label="Expired" value={counts.expired ?? 0} tone="danger" />
        </div>

        <Card>
          <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>All quotations</CardTitle>
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
                  placeholder="Search number"
                  className="pl-9 sm:w-56"
                />
              </div>
              <Select
                value={status}
                onValueChange={(value) => {
                  setPage(1);
                  setStatus(value as QuotationStatus | "all");
                }}
              >
                <SelectTrigger className="sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {QUOTATION_STATUSES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState variant="inline" />
            ) : error ? (
              <ErrorState
                title="Could not load quotations"
                description={error}
                action={
                  <Button variant="outline" onClick={load}>
                    Retry
                  </Button>
                }
              />
            ) : items.length === 0 ? (
              <EmptyState
                icon={<FileText />}
                title="No quotations yet"
                description="Create a quotation from a lead or itinerary to share pricing."
                action={
                  <Button asChild>
                    <Link href="/agency/quotations/new">New quotation</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Valid until</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((quotation) => (
                      <TableRow key={quotation.id}>
                        <TableCell className="font-medium">{quotation.quotationNumber}</TableCell>
                        <TableCell>
                          <StatusPill status={quotation.status} />
                        </TableCell>
                        <TableCell>{formatCurrency(quotation.total, quotation.currency)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(quotation.validUntil)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(quotation.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => copyLink(quotation)}>
                              <Copy className="size-4" aria-hidden="true" />
                              Link
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/agency/quotations/${quotation.id}`}>
                                Open
                                <ArrowUpRight className="size-4" aria-hidden="true" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </CardContent>
        </Card>
      </PageStack>
    </AgencyModulePage>
  );
}
