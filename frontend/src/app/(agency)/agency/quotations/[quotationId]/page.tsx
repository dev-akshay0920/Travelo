"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Receipt,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageStack } from "@/components/shared/page-container";
import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { DetailRow, SectionCard, StatusPill } from "@/features/agency/components/crm-ui";
import {
  acceptQuotationApi,
  deleteQuotationApi,
  getQuotationApi,
  sendQuotationApi,
  updateQuotationApi,
} from "@/features/agency/api/crm.api";
import { formatCurrency, formatDate, formatDateTime, toDateInputValue } from "@/features/agency/lib/format";
import {
  QUOTATION_STATUSES,
  type Quotation,
  type QuotationStatus,
} from "@/features/agency/types/crm.types";

export default function QuotationDetailPage() {
  const params = useParams<{ quotationId: string }>();
  const quotationId = String(params.quotationId ?? "");
  const router = useRouter();

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isActing, setIsActing] = useState(false);
  const [form, setForm] = useState({
    status: "draft" as QuotationStatus,
    subtotal: "",
    taxAmount: "",
    discountAmount: "",
    total: "",
    currency: "INR",
    validUntil: "",
    notes: "",
    termsAndConditions: "",
  });

  const load = useCallback(async () => {
    if (!quotationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const value = await getQuotationApi(quotationId);
      setQuotation(value);
      setForm({
        status: value.status,
        subtotal: String(value.subtotal),
        taxAmount: String(value.taxAmount),
        discountAmount: String(value.discountAmount),
        total: String(value.total),
        currency: value.currency,
        validUntil: toDateInputValue(value.validUntil),
        notes: value.notes ?? "",
        termsAndConditions: value.termsAndConditions ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load quotation.");
    } finally {
      setIsLoading(false);
    }
  }, [quotationId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const publicLink = quotation
    ? `${window.location.origin}/quotation/${quotation.publicShareLink}`
    : "";

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateQuotationApi(quotationId, {
        status: form.status,
        subtotal: Number(form.subtotal) || 0,
        taxAmount: Number(form.taxAmount) || 0,
        discountAmount: Number(form.discountAmount) || 0,
        total: Number(form.total) || 0,
        currency: form.currency.toUpperCase(),
        validUntil: form.validUntil
          ? new Date(`${form.validUntil}T23:59:59.000Z`).toISOString()
          : undefined,
        notes: form.notes.trim() || undefined,
        termsAndConditions: form.termsAndConditions.trim() || undefined,
      });
      toast.success("Quotation updated.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update quotation.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    setIsActing(true);
    try {
      await sendQuotationApi(quotationId);
      toast.success("Quotation marked as sent.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send quotation.");
    } finally {
      setIsActing(false);
    }
  };

  const handleAccept = async () => {
    setIsActing(true);
    try {
      await acceptQuotationApi(quotationId);
      toast.success("Quotation accepted.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to accept quotation.");
    } finally {
      setIsActing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      toast.success("Public link copied.");
    } catch {
      toast.error(publicLink);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this quotation? This cannot be undone.")) return;
    try {
      await deleteQuotationApi(quotationId);
      toast.success("Quotation deleted.");
      router.push("/agency/quotations");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete quotation.");
    }
  };

  if (isLoading) {
    return (
      <AgencyModulePage tab="quotations" title="Quotation">
        <LoadingState />
      </AgencyModulePage>
    );
  }

  if (error || !quotation) {
    return (
      <AgencyModulePage tab="quotations" title="Quotation">
        <ErrorState
          title="Could not load this quotation"
          description={error ?? "Quotation not found."}
          action={
            <Button variant="outline" onClick={() => router.push("/agency/quotations")}>
              Back to quotations
            </Button>
          }
        />
      </AgencyModulePage>
    );
  }

  const subtotal = Number(form.subtotal) || 0;
  const taxAmount = Number(form.taxAmount) || 0;
  const discountAmount = Number(form.discountAmount) || 0;
  const expectedTotal = Math.max(subtotal + taxAmount - discountAmount, 0);

  return (
    <AgencyModulePage
      tab="quotations"
      title={`Quotation ${quotation.quotationNumber}`}
      description={`Issued ${formatDate(quotation.createdAt)} - valid until ${formatDate(quotation.validUntil)}`}
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/agency/quotations">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="size-4" aria-hidden="true" />
            Copy link
          </Button>
          {quotation.status === "draft" && (
            <Button onClick={handleSend} disabled={isActing}>
              <Send className="size-4" aria-hidden="true" />
              Mark sent
            </Button>
          )}
          {quotation.status !== "accepted" && quotation.status !== "converted" && (
            <Button variant="secondary" onClick={handleAccept} disabled={isActing}>
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Accept
            </Button>
          )}
        </>
      }
    >
      <PageStack>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <SectionCard
              title="Public proposal"
              description="Share this link with the traveler. They can review and accept online."
            >
              <div className="flex flex-col gap-2 rounded-lg bg-muted p-3 sm:flex-row sm:items-center sm:justify-between">
                <code className="break-all text-caption text-muted-foreground">{publicLink}</code>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="size-4" aria-hidden="true" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={publicLink} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" aria-hidden="true" />
                      Open
                    </a>
                  </Button>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Pricing" description="Update pricing and validity if the plan changes.">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="quotation-subtotal">Subtotal</Label>
                  <Input
                    id="quotation-subtotal"
                    type="number"
                    min={0}
                    value={form.subtotal}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, subtotal: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quotation-currency">Currency</Label>
                  <Input
                    id="quotation-currency"
                    maxLength={3}
                    value={form.currency}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        currency: event.target.value.toUpperCase(),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quotation-tax">Tax</Label>
                  <Input
                    id="quotation-tax"
                    type="number"
                    min={0}
                    value={form.taxAmount}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, taxAmount: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quotation-discount">Discount</Label>
                  <Input
                    id="quotation-discount"
                    type="number"
                    min={0}
                    value={form.discountAmount}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, discountAmount: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quotation-total">Total</Label>
                  <Input
                    id="quotation-total"
                    type="number"
                    min={0}
                    value={form.total}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, total: event.target.value }))
                    }
                  />
                  {expectedTotal !== Number(form.total) && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="px-0"
                      onClick={() =>
                        setForm((current) => ({ ...current, total: String(expectedTotal) }))
                      }
                    >
                      Use calculated total {formatCurrency(expectedTotal, form.currency)}
                    </Button>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quotation-valid">Valid until</Label>
                  <Input
                    id="quotation-valid"
                    type="date"
                    value={form.validUntil}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, validUntil: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="quotation-notes">Notes</Label>
                  <textarea
                    id="quotation-notes"
                    rows={3}
                    value={form.notes}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, notes: event.target.value }))
                    }
                    className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="quotation-terms">Terms and conditions</Label>
                  <textarea
                    id="quotation-terms"
                    rows={4}
                    value={form.termsAndConditions}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        termsAndConditions: event.target.value,
                      }))
                    }
                    className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-5">
            <SectionCard title="Status">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-muted-foreground">Current</span>
                  <StatusPill status={quotation.status} />
                </div>
                <div className="space-y-1.5">
                  <Label>Update status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, status: value as QuotationStatus }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUOTATION_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="size-4" aria-hidden="true" />
                  )}
                  Save changes
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Details">
              <DetailRow label="Total" value={formatCurrency(quotation.total, quotation.currency)} />
              <DetailRow label="Lead" value={quotation.leadId} />
              <DetailRow label="Itinerary" value={quotation.itineraryId ?? "-"} />
              <DetailRow label="Viewed" value={quotation.viewedAt ? formatDateTime(quotation.viewedAt) : "-"} />
              <DetailRow label="Accepted" value={quotation.acceptedAt ? formatDateTime(quotation.acceptedAt) : "-"} />
              <DetailRow label="Created" value={formatDateTime(quotation.createdAt)} />
            </SectionCard>

            <SectionCard title="Next steps">
              <div className="grid gap-2">
                <Button variant="outline" className="justify-start" asChild>
                  <Link
                    href={`/agency/bookings/new?leadId=${quotation.leadId}&quotationId=${quotation.id}`}
                  >
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    Convert to booking
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link
                    href={`/agency/invoices/new?leadId=${quotation.leadId}&subtotal=${quotation.subtotal}&tax=${quotation.taxAmount}`}
                  >
                    <Receipt className="size-4" aria-hidden="true" />
                    Create invoice
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete quotation
                </Button>
              </div>
            </SectionCard>
          </div>
        </div>
      </PageStack>
    </AgencyModulePage>
  );
}
