"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, FileText, Loader2, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { acceptPublicQuotationApi, getPublicQuotationApi } from "@/features/agency/api/crm.api";
import { formatCurrency, formatDate } from "@/features/agency/lib/format";
import type { Quotation } from "@/features/agency/types/crm.types";
import { StatusPill } from "@/features/agency/components/crm-ui";

export default function PublicQuotationPage() {
  const params = useParams<{ token: string }>();
  const token = String(params.token ?? "");
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const value = await getPublicQuotationApi(token);
      setQuotation(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "This quotation link is not available.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const value = await acceptPublicQuotationApi(token);
      setQuotation(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not accept this quotation.");
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10">
      {isLoading ? (
        <div className="w-full">
          <LoadingState />
        </div>
      ) : error ? (
        <div className="w-full">
          <ErrorState
            title="Quotation unavailable"
            description={error}
            action={
              <Button variant="outline" onClick={load}>
                Try again
              </Button>
            }
          />
        </div>
      ) : quotation ? (
        <Card className="w-full">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <p className="text-caption font-medium uppercase tracking-wide text-muted-foreground">
                Travel quotation
              </p>
              <CardTitle className="mt-1 text-2xl">{quotation.quotationNumber}</CardTitle>
              <p className="mt-1 text-body-sm text-muted-foreground">
                Valid until {formatDate(quotation.validUntil)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusPill status={quotation.status} />
              <Button variant="ghost" size="sm" onClick={() => window.print()}>
                <Printer className="size-4" aria-hidden="true" />
                Print
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 rounded-lg border border-border p-4">
              <div className="flex justify-between text-body-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(quotation.subtotal, quotation.currency)}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(quotation.taxAmount, quotation.currency)}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-muted-foreground">Discount</span>
                <span>-{formatCurrency(quotation.discountAmount, quotation.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(quotation.total, quotation.currency)}</span>
              </div>
            </div>

            {quotation.notes && (
              <section className="space-y-1">
                <h2 className="font-heading text-card-title font-semibold">Notes</h2>
                <p className="whitespace-pre-line text-body-sm text-muted-foreground">
                  {quotation.notes}
                </p>
              </section>
            )}

            {quotation.termsAndConditions && (
              <section className="space-y-1">
                <h2 className="font-heading text-card-title font-semibold">Terms and conditions</h2>
                <p className="whitespace-pre-line text-body-sm text-muted-foreground">
                  {quotation.termsAndConditions}
                </p>
              </section>
            )}

            {quotation.status === "accepted" || quotation.status === "converted" ? (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-4 text-body-sm text-emerald-700 dark:text-emerald-300">
                <BadgeCheck className="size-5" aria-hidden="true" />
                This quotation has been accepted. The travel agency will be in touch.
              </div>
            ) : (
              <div className="flex flex-col items-start gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-body-sm text-muted-foreground">
                  <FileText className="size-4" aria-hidden="true" />
                  Accepting confirms you want to proceed with this plan.
                </p>
                <Button onClick={handleAccept} disabled={isAccepting}>
                  {isAccepting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  Accept quotation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}
