"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ArrowUpRight, Plus, ReceiptText, Search, Wallet } from "lucide-react";

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
  getInvoiceStatusCountsApi,
  listInvoicesApi,
  listOverdueInvoicesApi,
} from "@/features/agency/api/crm.api";
import { formatCurrency, formatDate } from "@/features/agency/lib/format";
import {
  INVOICE_STATUSES,
  INVOICE_TYPES,
  type Invoice,
  type InvoiceStatus,
  type InvoiceType,
  titleCase,
} from "@/features/agency/types/crm.types";

export default function AgencyInvoicesPage() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [overdue, setOverdue] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [type, setType] = useState<InvoiceType | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listInvoicesApi({
        page,
        limit: 20,
        search: search || undefined,
        status: status === "all" ? undefined : status,
        type: type === "all" ? undefined : type,
      });
      setItems(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load invoices.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, type]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    getInvoiceStatusCountsApi()
      .then((value) => {
        if (!cancelled) setCounts(value);
      })
      .catch(() => undefined);
    listOverdueInvoicesApi()
      .then((value) => {
        if (!cancelled) setOverdue(value);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const collected = items.reduce((sum, invoice) => sum + invoice.paidAmount, 0);

  return (
    <AgencyModulePage
      tab="invoices"
      title="Invoices"
      description="Issue proforma invoices, tax invoices and receipts."
      actions={
        <Button asChild>
          <Link href="/agency/invoices/new">
            <Plus className="size-4" aria-hidden="true" />
            New invoice
          </Link>
        </Button>
      }
    >
      <PageStack>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total invoices" value={total} icon={ReceiptText} />
          <StatCard label="Unpaid" value={counts.unpaid ?? 0} tone="warning" />
          <StatCard label="Overdue" value={overdue.length} tone="danger" icon={AlertTriangle} />
          <StatCard label="Paid on page" value={formatCurrency(collected)} icon={Wallet} tone="success" />
        </div>

        {overdue.length > 0 && (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-4" aria-hidden="true" />
                Overdue invoices
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {overdue.slice(0, 6).map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/agency/invoices/${invoice.id}`}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-body-sm hover:border-primary/50"
                >
                  <span className="font-medium">{invoice.invoiceNumber}</span>
                  <span>{formatCurrency(invoice.total - invoice.paidAmount, invoice.currency)}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>All invoices</CardTitle>
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
                  placeholder="Search invoice"
                  className="pl-9 sm:w-52"
                />
              </div>
              <Select
                value={type}
                onValueChange={(value) => {
                  setPage(1);
                  setType(value as InvoiceType | "all");
                }}
              >
                <SelectTrigger className="sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {INVOICE_TYPES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {titleCase(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={status}
                onValueChange={(value) => {
                  setPage(1);
                  setStatus(value as InvoiceStatus | "all");
                }}
              >
                <SelectTrigger className="sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {INVOICE_STATUSES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {titleCase(item)}
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
                title="Could not load invoices"
                description={error}
                action={
                  <Button variant="outline" onClick={load}>
                    Retry
                  </Button>
                }
              />
            ) : items.length === 0 ? (
              <EmptyState
                icon={<ReceiptText />}
                title="No invoices yet"
                description="Create an invoice from a booking or directly from a lead."
                action={
                  <Button asChild>
                    <Link href="/agency/invoices/new">New invoice</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead className="text-right">Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{titleCase(invoice.type)}</TableCell>
                        <TableCell>
                          <StatusPill status={invoice.status} />
                        </TableCell>
                        <TableCell>{formatCurrency(invoice.total, invoice.currency)}</TableCell>
                        <TableCell>{formatCurrency(invoice.paidAmount, invoice.currency)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(invoice.dueDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/agency/invoices/${invoice.id}`}>
                              View
                              <ArrowUpRight className="size-4" aria-hidden="true" />
                            </Link>
                          </Button>
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
