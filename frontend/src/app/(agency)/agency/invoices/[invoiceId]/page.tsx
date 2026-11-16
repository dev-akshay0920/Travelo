"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  ExternalLink,
  Loader2,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  deleteInvoiceApi,
  getInvoiceApi,
  recordInvoicePaymentApi,
  updateInvoiceApi,
  updateInvoiceStatusApi,
} from "@/features/agency/api/crm.api";
import { formatCurrency, formatDate, formatDateTime, toDateInputValue } from "@/features/agency/lib/format";
import {
  INVOICE_STATUSES,
  INVOICE_TYPES,
  PAYMENT_METHODS,
  type Invoice,
  type InvoiceStatus,
  type InvoiceType,
  type PaymentMethod,
  titleCase,
} from "@/features/agency/types/crm.types";

const toIso = (value: string) =>
  value ? new Date(`${value}T23:59:59.000Z`).toISOString() : undefined;

export default function InvoiceDetailPage() {
  const params = useParams<{ invoiceId: string }>();
  const invoiceId = String(params.invoiceId ?? "");
  const router = useRouter();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [form, setForm] = useState({
    type: "proforma" as InvoiceType,
    status: "unpaid" as InvoiceStatus,
    subtotal: "",
    taxAmount: "",
    taxPercentage: "",
    total: "",
    currency: "INR",
    gstin: "",
    dueDate: "",
    paidAmount: "",
    notes: "",
    termsAndConditions: "",
  });
  const [payment, setPayment] = useState({
    amount: "",
    method: "cash" as PaymentMethod,
    transactionId: "",
    notes: "",
  });

  const load = useCallback(async () => {
    if (!invoiceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const value = await getInvoiceApi(invoiceId);
      setInvoice(value);
      setForm({
        type: value.type,
        status: value.status,
        subtotal: String(value.subtotal),
        taxAmount: String(value.taxAmount),
        taxPercentage: String(value.taxPercentage),
        total: String(value.total),
        currency: value.currency,
        gstin: value.gstin ?? "",
        dueDate: toDateInputValue(value.dueDate),
        paidAmount: String(value.paidAmount),
        notes: value.notes ?? "",
        termsAndConditions: value.termsAndConditions ?? "",
      });
      setPayment((current) => ({
        ...current,
        amount: String(Math.max(value.total - value.paidAmount, 0)),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load invoice.");
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateInvoiceApi(invoiceId, {
        type: form.type,
        subtotal: Number(form.subtotal) || 0,
        taxAmount: Number(form.taxAmount) || 0,
        taxPercentage: Number(form.taxPercentage) || 0,
        total: Number(form.total) || 0,
        currency: form.currency.toUpperCase(),
        gstin: form.gstin.trim() || undefined,
        dueDate: toIso(form.dueDate),
        paidAmount: Number(form.paidAmount) || 0,
        notes: form.notes.trim() || undefined,
        termsAndConditions: form.termsAndConditions.trim() || undefined,
      });
      if (form.status !== invoice?.status) {
        await updateInvoiceStatusApi(invoiceId, form.status);
      }
      toast.success("Invoice updated.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update invoice.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecordPayment = async () => {
    const amount = Number(payment.amount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid payment amount.");
      return;
    }
    setIsRecording(true);
    try {
      await recordInvoicePaymentApi(invoiceId, {
        amount,
        method: payment.method,
        transactionId: payment.transactionId.trim() || undefined,
        notes: payment.notes.trim() || undefined,
      });
      toast.success("Payment recorded.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record payment.");
    } finally {
      setIsRecording(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this invoice? This cannot be undone.")) return;
    try {
      await deleteInvoiceApi(invoiceId);
      toast.success("Invoice deleted.");
      router.push("/agency/invoices");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete invoice.");
    }
  };

  if (isLoading) {
    return (
      <AgencyModulePage tab="invoices" title="Invoice">
        <LoadingState />
      </AgencyModulePage>
    );
  }

  if (error || !invoice) {
    return (
      <AgencyModulePage tab="invoices" title="Invoice">
        <ErrorState
          title="Could not load this invoice"
          description={error ?? "Invoice not found."}
          action={
            <Button variant="outline" onClick={() => router.push("/agency/invoices")}>
              Back to invoices
            </Button>
          }
        />
      </AgencyModulePage>
    );
  }

  const subtotal = Number(form.subtotal) || 0;
  const taxAmount = Number(form.taxAmount) || 0;
  const expectedTotal = subtotal + taxAmount;
  const balance = invoice.total - invoice.paidAmount;

  return (
    <AgencyModulePage
      tab="invoices"
      title={`Invoice ${invoice.invoiceNumber}`}
      description={`${titleCase(invoice.type)} - issued ${formatDate(invoice.createdAt)}`}
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/agency/invoices">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
          {invoice.pdfUrl && (
            <Button variant="outline" asChild>
              <a href={invoice.pdfUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" aria-hidden="true" />
                PDF
              </a>
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            Save
          </Button>
        </>
      }
    >
      <PageStack>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-caption uppercase text-muted-foreground">Status</p>
              <div className="mt-2">
                <StatusPill status={invoice.status} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-caption uppercase text-muted-foreground">Total</p>
              <p className="mt-2 text-xl font-semibold">
                {formatCurrency(invoice.total, invoice.currency)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-caption uppercase text-muted-foreground">Paid</p>
              <p className="mt-2 text-xl font-semibold">
                {formatCurrency(invoice.paidAmount, invoice.currency)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-caption uppercase text-muted-foreground">Balance</p>
              <p className="mt-2 text-xl font-semibold">
                {formatCurrency(balance, invoice.currency)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <SectionCard title="Invoice details">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, type: value as InvoiceType }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVOICE_TYPES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {titleCase(item)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, status: value as InvoiceStatus }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVOICE_STATUSES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {titleCase(item)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invoice-subtotal">Subtotal</Label>
                  <Input
                    id="invoice-subtotal"
                    type="number"
                    min={0}
                    value={form.subtotal}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, subtotal: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invoice-currency">Currency</Label>
                  <Input
                    id="invoice-currency"
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
                  <Label htmlFor="invoice-tax-percent">Tax (%)</Label>
                  <Input
                    id="invoice-tax-percent"
                    type="number"
                    min={0}
                    max={100}
                    value={form.taxPercentage}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        taxPercentage: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invoice-tax">Tax amount</Label>
                  <Input
                    id="invoice-tax"
                    type="number"
                    min={0}
                    value={form.taxAmount}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, taxAmount: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invoice-total">Total</Label>
                  <Input
                    id="invoice-total"
                    type="number"
                    min={0}
                    value={form.total}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, total: event.target.value }))
                    }
                  />
                  {Number(form.total) !== expectedTotal && (
                    <Button
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
                  <Label htmlFor="invoice-paid">Paid amount</Label>
                  <Input
                    id="invoice-paid"
                    type="number"
                    min={0}
                    value={form.paidAmount}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, paidAmount: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invoice-due">Due date</Label>
                  <Input
                    id="invoice-due"
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, dueDate: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invoice-gstin">GSTIN</Label>
                  <Input
                    id="invoice-gstin"
                    value={form.gstin}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, gstin: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="invoice-notes">Notes</Label>
                  <textarea
                    id="invoice-notes"
                    rows={3}
                    value={form.notes}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, notes: event.target.value }))
                    }
                    className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="invoice-terms">Terms</Label>
                  <textarea
                    id="invoice-terms"
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

            {balance > 0 && (
              <SectionCard title="Record payment" description="Apply a payment to this invoice.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="payment-amount">Amount</Label>
                    <Input
                      id="payment-amount"
                      type="number"
                      min={0}
                      value={payment.amount}
                      onChange={(event) =>
                        setPayment((current) => ({ ...current, amount: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Method</Label>
                    <Select
                      value={payment.method}
                      onValueChange={(value) =>
                        setPayment((current) => ({ ...current, method: value as PaymentMethod }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {titleCase(method)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="payment-transaction">Transaction ID</Label>
                    <Input
                      id="payment-transaction"
                      value={payment.transactionId}
                      onChange={(event) =>
                        setPayment((current) => ({
                          ...current,
                          transactionId: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full" onClick={handleRecordPayment} disabled={isRecording}>
                      {isRecording ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <CreditCard className="size-4" aria-hidden="true" />
                      )}
                      Record payment
                    </Button>
                  </div>
                </div>
              </SectionCard>
            )}
          </div>

          <div className="space-y-5">
            <SectionCard title="Linked records">
              <DetailRow label="Booking" value={invoice.bookingId ?? "-"} />
              <DetailRow label="Lead" value={invoice.leadId ?? "-"} />
              <DetailRow label="Due date" value={formatDate(invoice.dueDate)} />
              <DetailRow label="Created" value={formatDateTime(invoice.createdAt)} />
              <DetailRow label="Updated" value={formatDateTime(invoice.updatedAt)} />
              {invoice.paymentLinkUrl && (
                <Button variant="outline" className="mt-3 w-full" asChild>
                  <a href={invoice.paymentLinkUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" aria-hidden="true" />
                    Open payment link
                  </a>
                </Button>
              )}
            </SectionCard>

            <SectionCard title="Actions">
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => updateInvoiceStatusApi(invoiceId, "paid").then(load)}
                >
                  <Send className="size-4" aria-hidden="true" />
                  Mark as paid
                </Button>
                <Button
                  variant="outline"
                  className="justify-start text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete invoice
                </Button>
              </div>
            </SectionCard>
          </div>
        </div>
      </PageStack>
    </AgencyModulePage>
  );
}
