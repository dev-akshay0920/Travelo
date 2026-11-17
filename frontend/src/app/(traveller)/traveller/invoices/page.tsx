"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText } from "lucide-react";

import { listMyInvoicesApi } from "@/features/traveller/api/traveller.api";
import { formatDateTime } from "@/features/agency/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageStack } from "@/components/shared/page-container";

interface TravellerInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  paidAmount: number;
  currency: string;
  type: string;
  dueDate?: string;
  createdAt: string;
}

interface InvoicesResponse {
  items: TravellerInvoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function TravellerInvoicesPage() {
  const [invoices, setInvoices] = useState<TravellerInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data: InvoicesResponse = await listMyInvoicesApi({ page });
      setInvoices(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your invoices.");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      unpaid: "Unpaid",
      partial: "Partially Paid",
      paid: "Paid",
      overdue: "Overdue",
      cancelled: "Cancelled",
    };
    return map[status] ?? status;
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "secondary";
      case "partial":
        return "default";
      case "overdue":
        return "destructive";
      case "cancelled":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <PageStack>
      <PageHeader
        title="My Invoices"
        description="View and track your trip invoices and payments."
      />
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState title="Unable to load invoices" description={error} />
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="You don’t have any invoices. Invoices are created when your booking is confirmed."
        />
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} size="sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold leading-none">
                  {invoice.invoiceNumber}
                </CardTitle>
                <Badge variant={statusVariant(invoice.status)} className="capitalize">
                  {statusLabel(invoice.status)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex flex-col gap-1">
                    <span className="text-caption text-muted-foreground">Type</span>
                    <span className="font-medium">{invoice.type.replace("_", " ")}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-caption text-muted-foreground">Total</span>
                    <span className="font-medium">
                      {invoice.currency === "INR" ? `₹${invoice.total.toLocaleString("en-IN")}` : `${invoice.currency} ${invoice.total.toLocaleString("en-US")}`}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-caption text-muted-foreground">Paid</span>
                    <span className="font-medium">
                      {invoice.paidAmount === 0 ? "—" : invoice.currency === "INR" ? `₹${invoice.paidAmount.toLocaleString("en-IN")}` : `${invoice.currency} ${invoice.paidAmount.toLocaleString("en-US")}`}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-caption text-muted-foreground">Due</span>
                    <span className="font-medium">
                      {invoice.dueDate ? formatDateTime(invoice.dueDate) : "—"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-body-sm text-muted-foreground">
                      {formatDateTime(invoice.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <span className="text-caption text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </PageStack>
  );
}
