"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
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
import { createBookingApi, getQuotationApi, listLeadsApi } from "@/features/agency/api/crm.api";
import type { Lead } from "@/features/leads/types/lead.types";
import {
  BOOKING_STATUSES,
  type BookingStatus,
  type TravellerRoster,
} from "@/features/agency/types/crm.types";

interface TravellerRow extends TravellerRoster {
  localId: string;
}

const makeId = () => Math.random().toString(36).slice(2);

const emptyTraveller = (): TravellerRow => ({ localId: makeId(), name: "" });

const toIso = (value: string) =>
  value ? new Date(`${value}T00:00:00.000Z`).toISOString() : "";

export default function NewBookingPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quotationId, setQuotationId] = useState("");
  const [itineraryId, setItineraryId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [travellers, setTravellers] = useState<TravellerRow[]>([emptyTraveller()]);
  const [form, setForm] = useState({
    leadId: "",
    startDate: "",
    endDate: "",
    departureDate: "",
    status: "enquiry" as BookingStatus,
    totalPrice: "",
    paidAmount: "0",
    currency: "INR",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const leadId = params.get("leadId") ?? "";
    const quotation = params.get("quotationId") ?? "";
    const itinerary = params.get("itineraryId") ?? "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((current) => ({ ...current, leadId }));
    if (quotation) setQuotationId(quotation);
    if (itinerary) setItineraryId(itinerary);

    listLeadsApi({ page: 1, limit: 50 })
      .then((value) => setLeads(value.items))
      .catch(() => undefined);

    if (quotation) {
      getQuotationApi(quotation)
        .then((value) => {
          setForm((current) => ({
            ...current,
            leadId: value.leadId,
            totalPrice: String(value.total),
            currency: value.currency,
          }));
          if (value.itineraryId) setItineraryId(value.itineraryId);
        })
        .catch(() => undefined);
    }
  }, []);

  const updateTraveller = (localId: string, key: keyof TravellerRoster, value: string) => {
    setTravellers((current) =>
      current.map((traveller) =>
        traveller.localId === localId ? { ...traveller, [key]: value } : traveller,
      ),
    );
  };

  const handleSave = async () => {
    const validTravellers = travellers.filter((traveller) => traveller.name.trim());
    if (validTravellers.length === 0) {
      toast.error("Add at least one traveller.");
      return;
    }
    if (!form.startDate || !form.endDate || !form.departureDate) {
      toast.error("Start, end and departure dates are required.");
      return;
    }
    setIsSaving(true);
    try {
      const created = await createBookingApi({
        leadId: form.leadId || undefined,
        quotationId: quotationId || undefined,
        itineraryId: itineraryId || undefined,
        travellers: validTravellers.map(({ localId, ...traveller }) => {
          void localId;
          return {
            ...traveller,
            name: traveller.name.trim(),
            email: traveller.email?.trim() || undefined,
            phone: traveller.phone?.trim() || undefined,
          };
        }),
        startDate: toIso(form.startDate),
        endDate: toIso(form.endDate),
        departureDate: toIso(form.departureDate),
        status: form.status,
        totalPrice: form.totalPrice ? Number(form.totalPrice) : undefined,
        paidAmount: form.paidAmount ? Number(form.paidAmount) : undefined,
        currency: form.currency.toUpperCase(),
      });
      toast.success("Booking created.");
      router.push(`/agency/bookings/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create booking.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AgencyModulePage
      tab="bookings"
      title="New booking"
      description="Confirm the trip, capture travellers and record payment."
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/agency/bookings">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Create booking
          </Button>
        </>
      }
    >
      <PageStack>
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Travellers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {travellers.map((traveller, index) => (
                <div key={traveller.localId} className="rounded-lg border border-border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-body-sm font-medium">Traveller {index + 1}</p>
                    {travellers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() =>
                          setTravellers((current) =>
                            current.filter((item) => item.localId !== traveller.localId),
                          )
                        }
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`name-${traveller.localId}`}>Full name</Label>
                      <Input
                        id={`name-${traveller.localId}`}
                        value={traveller.name}
                        onChange={(event) =>
                          updateTraveller(traveller.localId, "name", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`email-${traveller.localId}`}>Email</Label>
                      <Input
                        id={`email-${traveller.localId}`}
                        type="email"
                        value={traveller.email ?? ""}
                        onChange={(event) =>
                          updateTraveller(traveller.localId, "email", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`phone-${traveller.localId}`}>Phone</Label>
                      <Input
                        id={`phone-${traveller.localId}`}
                        value={traveller.phone ?? ""}
                        onChange={(event) =>
                          updateTraveller(traveller.localId, "phone", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`passport-${traveller.localId}`}>Passport</Label>
                      <Input
                        id={`passport-${traveller.localId}`}
                        value={traveller.passportNumber ?? ""}
                        onChange={(event) =>
                          updateTraveller(traveller.localId, "passportNumber", event.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => setTravellers((current) => [...current, emptyTraveller()])}
              >
                <Plus className="size-4" aria-hidden="true" />
                Add traveller
              </Button>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Trip details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
                <Label htmlFor="booking-start">Start date</Label>
                <Input
                  id="booking-start"
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, startDate: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="booking-end">End date</Label>
                <Input
                  id="booking-end"
                  type="date"
                  value={form.endDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, endDate: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="booking-departure">Departure date</Label>
                <Input
                  id="booking-departure"
                  type="date"
                  value={form.departureDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, departureDate: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, status: value as BookingStatus }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKING_STATUSES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="booking-total">Total</Label>
                  <Input
                    id="booking-total"
                    type="number"
                    min={0}
                    value={form.totalPrice}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, totalPrice: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-paid">Paid</Label>
                  <Input
                    id="booking-paid"
                    type="number"
                    min={0}
                    value={form.paidAmount}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, paidAmount: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="booking-currency">Currency</Label>
                <Input
                  id="booking-currency"
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
            </CardContent>
          </Card>
        </div>
      </PageStack>
    </AgencyModulePage>
  );
}
