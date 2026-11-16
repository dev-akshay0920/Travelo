"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageStack } from "@/components/shared/page-container";
import { AgencyModulePage } from "@/features/agency/components/agency-module-page";
import { createInvoiceApi, listBookingsApi, listLeadsApi } from "@/features/agency/api/crm.api";
import { formatCurrency } from "@/features/agency/lib/format";
import { INVOICE_TYPES, type InvoiceType, titleCase } from "@/features/agency/types/crm.types";
import type { Booking } from "@/features/agency/types/crm.types";
import type { Lead } from "@/features/leads/types/lead.types";

const toIso = (value: string) =>
  value ? new Date(`${value}T23:59:59.000Z`).toISOString() : undefined;

export default function NewInvoicePage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    bookingId: "",
    leadId: "",
    type: "proforma" as InvoiceType,
    subtotal: "",
    taxPercentage: "0",
    taxAmount: "0",
    currency: "INR",
    gstin: "",
    dueDate: "",
    paidAmount: "0",
    notes: "",
    termsAndConditions: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subtotal = params.get("subtotal") ?? "";
    const tax = params.get("tax") ?? "0";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((current) => ({
      ...current,
      bookingId: params.get("bookingId") ?? "",
      leadId: params.get("leadId") ?? "",
      subtotal,
      taxAmount: tax,
    }));
    listBookingsApi({ page: 1, limit: 100 })
      .then((value) => setBookings(value.items))
      .catch(() => undefined);
    listLeadsApi({ page: 1, limit: 50 })
      .then((value) => setLeads(value.items))
      .catch(() => undefined);
  }, []);

  const subtotal = Number(form.subtotal) || 0;
  const taxAmount = Number(form.taxAmount) || 0;
  const total = subtotal + taxAmount;

  const applyTaxPercentage = (percentage: string) => {
    const value = Number(percentage) || 0;
    setForm((current) => ({
      ...current,
      taxPercentage: percentage,
      taxAmount: String(Math.round((subtotal * value) / 100)),
    }));
  };

  const handleSave = async () => {
    if (!form.subtotal || subtotal <= 0) {
      toast.error("Enter a subtotal greater than zero.");
      return;
    }
    setIsSaving(true);
    try {
      const created = await createInvoiceApi({
        bookingId: form.bookingId || undefined,
        leadId: form.leadId || undefined,
        type: form.type,
        subtotal,
        taxAmount,
        total,
        currency: form.currency.toUpperCase(),
        gstin: form.gstin.trim() || undefined,
        taxPercentage: Number(form.taxPercentage) || 0,
        dueDate: toIso(form.dueDate),
        paidAmount: Number(form.paidAmount) || 0,
        notes: form.notes.trim() || undefined,
        termsAndConditions: form.termsAndConditions.trim() || undefined,
      });
      toast.success("Invoice created.");
      router.push(`/agency/invoices/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create invoice.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AgencyModulePage
      tab="invoices"
      title="New invoice"
      description="Issue a proforma invoice, tax invoice or receipt."
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/agency/invoices">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Create invoice
          </Button>
        </>
      }
    >
      <PageStack>
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Invoice details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
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
                <Label>Booking</Label>
                <Select
                  value={form.bookingId || "none"}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      bookingId: value === "none" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No booking</SelectItem>
                    {bookings.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {booking.bookingNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Lead</Label>
                <Select
                  value={form.leadId || "none"}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, leadId: value === "none" ? "" : value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No lead</SelectItem>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.travelerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-gstin">GSTIN</Label>
                <Input
                  id="invoice-gstin"
                  value={form.gstin}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, gstin: event.target.value }))
                  }
                  placeholder="Optional"
                />
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
                  onChange={(event) => applyTaxPercentage(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-tax-amount">Tax amount</Label>
                <Input
                  id="invoice-tax-amount"
                  type="number"
                  min={0}
                  value={form.taxAmount}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, taxAmount: event.target.value }))
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
                <Label htmlFor="invoice-paid">Already paid</Label>
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
                <Label htmlFor="invoice-terms">Terms and conditions</Label>
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
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-body-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal, form.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(taxAmount, form.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total, form.currency)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageStack>
    </AgencyModulePage>
  );
}
