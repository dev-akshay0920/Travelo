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
import {
  createQuotationApi,
  listItinerariesApi,
  listLeadsApi,
} from "@/features/agency/api/crm.api";
import { formatCurrency } from "@/features/agency/lib/format";
import type { Itinerary } from "@/features/agency/types/crm.types";
import type { Lead } from "@/features/leads/types/lead.types";

export default function NewQuotationPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    leadId: "",
    itineraryId: "",
    subtotal: "",
    taxAmount: "0",
    discountAmount: "0",
    currency: "INR",
    validUntil: "",
    notes: "",
    termsAndConditions: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const leadId = params.get("leadId") ?? "";
    const itineraryId = params.get("itineraryId") ?? "";
    const defaultValidity = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((current) => ({
      ...current,
      leadId,
      itineraryId,
      validUntil: defaultValidity,
    }));

    listLeadsApi({ page: 1, limit: 50 })
      .then((value) => setLeads(value.items))
      .catch(() => undefined);
    listItinerariesApi({ page: 1, limit: 100, leadId: leadId || undefined })
      .then((value) => setItineraries(value.items))
      .catch(() => undefined);
  }, []);

  const loadItineraries = (leadId: string) => {
    listItinerariesApi({ page: 1, limit: 100, leadId: leadId || undefined })
      .then((value) => setItineraries(value.items))
      .catch(() => undefined);
  };

  const selectItinerary = (itineraryId: string) => {
    const itinerary = itineraries.find((item) => item.id === itineraryId);
    setForm((current) => ({
      ...current,
      itineraryId,
      subtotal: itinerary ? String(itinerary.totalPrice) : current.subtotal,
      currency: itinerary?.currency ?? current.currency,
    }));
  };

  const subtotal = Number(form.subtotal) || 0;
  const taxAmount = Number(form.taxAmount) || 0;
  const discountAmount = Number(form.discountAmount) || 0;
  const total = Math.max(subtotal + taxAmount - discountAmount, 0);

  const handleSave = async () => {
    if (!form.leadId) {
      toast.error("Select a lead for this quotation.");
      return;
    }
    if (!form.validUntil) {
      toast.error("Set a validity date.");
      return;
    }
    if (subtotal <= 0) {
      toast.error("Enter a subtotal greater than zero.");
      return;
    }
    setIsSaving(true);
    try {
      const created = await createQuotationApi({
        leadId: form.leadId,
        itineraryId: form.itineraryId || undefined,
        subtotal,
        taxAmount,
        discountAmount,
        total,
        currency: form.currency.toUpperCase(),
        validUntil: new Date(`${form.validUntil}T23:59:59.000Z`).toISOString(),
        notes: form.notes.trim() || undefined,
        termsAndConditions: form.termsAndConditions.trim() || undefined,
      });
      toast.success("Quotation created.");
      router.push(`/agency/quotations/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create quotation.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AgencyModulePage
      tab="quotations"
      title="New quotation"
      description="Price the trip and send a shareable proposal."
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/agency/quotations">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Create quotation
          </Button>
        </>
      }
    >
      <PageStack>
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Proposal details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Lead</Label>
                <Select
                  value={form.leadId || "none"}
                  onValueChange={(value) => {
                    const leadId = value === "none" ? "" : value;
                    setForm((current) => ({ ...current, leadId, itineraryId: "" }));
                    if (leadId) loadItineraries(leadId);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select a lead</SelectItem>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.travelerName} - {lead.travelerEmail}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Itinerary</Label>
                <Select
                  value={form.itineraryId || "none"}
                  onValueChange={(value) =>
                    selectItinerary(value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No itinerary</SelectItem>
                    {itineraries.map((itinerary) => (
                      <SelectItem key={itinerary.id} value={itinerary.id}>
                        {itinerary.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quote-subtotal">Subtotal</Label>
                <Input
                  id="quote-subtotal"
                  type="number"
                  min={0}
                  value={form.subtotal}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, subtotal: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quote-currency">Currency</Label>
                <Input
                  id="quote-currency"
                  maxLength={3}
                  value={form.currency}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quote-tax">Tax amount</Label>
                <Input
                  id="quote-tax"
                  type="number"
                  min={0}
                  value={form.taxAmount}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, taxAmount: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quote-discount">Discount</Label>
                <Input
                  id="quote-discount"
                  type="number"
                  min={0}
                  value={form.discountAmount}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, discountAmount: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quote-valid">Valid until</Label>
                <Input
                  id="quote-valid"
                  type="date"
                  value={form.validUntil}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, validUntil: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="quote-notes">Notes</Label>
                <textarea
                  id="quote-notes"
                  rows={3}
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="quote-terms">Terms and conditions</Label>
                <textarea
                  id="quote-terms"
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>-{formatCurrency(discountAmount, form.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total, form.currency)}</span>
              </div>
              <p className="pt-2 text-caption text-muted-foreground">
                After saving, a public share link is generated automatically.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageStack>
    </AgencyModulePage>
  );
}
