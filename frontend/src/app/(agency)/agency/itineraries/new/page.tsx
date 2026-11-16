"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { createItineraryApi, generateAiItineraryApi } from "@/features/agency/api/crm.api";
import { ITINERARY_TAX_TYPES, type ItineraryDay, type ItineraryTaxType } from "@/features/agency/types/crm.types";

interface DayForm extends ItineraryDay {
  localId: string;
}

function makeLocalId() {
  return Math.random().toString(36).slice(2);
}

function emptyDay(dayNumber: number): DayForm {
  return {
    localId: makeLocalId(),
    day: dayNumber,
    title: "",
    description: "",
    accommodation: "",
    transport: "",
  };
}

export default function NewItineraryPage() {
  const router = useRouter();
  const [leadId, setLeadId] = useState("");
  const [form, setForm] = useState({
    name: "",
    destination: "",
    durationDays: "5",
    durationNights: "4",
    totalPrice: "",
    currency: "INR",
    taxType: "none" as ItineraryTaxType,
    taxPercentage: "0",
    advancePercentage: "0",
    templateCategory: "",
    isTemplate: false,
    aiGenerated: false,
  });
  const [days, setDays] = useState<DayForm[]>([emptyDay(1)]);
  const [isSaving, setIsSaving] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({
    destination: "",
    durationDays: "5",
    travelerCount: "2",
    budget: "",
    currency: "INR",
    style: "",
    interests: "",
    notes: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lead = params.get("leadId");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (lead) setLeadId(lead);
    if (params.get("ai") === "1") setAiOpen(true);
  }, []);

  const updateForm = (key: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateDay = (
    localId: string,
    key: keyof ItineraryDay,
    value: ItineraryDay[keyof ItineraryDay],
  ) => {
    setDays((current) =>
      current.map((day) => (day.localId === localId ? { ...day, [key]: value } : day)),
    );
  };

  const addDay = () => {
    setDays((current) => [...current, emptyDay(current.length + 1)]);
  };

  const removeDay = (localId: string) => {
    setDays((current) =>
      current
        .filter((day) => day.localId !== localId)
        .map((day, index) => ({ ...day, day: index + 1 })),
    );
  };

  const applyDraft = (draft: {
    name: string;
    destination: string;
    days: ItineraryDay[];
    estimatedTotalPrice?: number;
  }) => {
    setForm((current) => ({
      ...current,
      name: draft.name,
      destination: draft.destination,
      durationDays: String(draft.days.length),
      durationNights: String(Math.max(draft.days.length - 1, 0)),
      totalPrice: draft.estimatedTotalPrice ? String(draft.estimatedTotalPrice) : current.totalPrice,
      aiGenerated: true,
    }));
    setDays(
      draft.days.map((day) => ({
        ...day,
        description: day.description ?? "",
        accommodation: day.accommodation ?? "",
        transport: day.transport ?? "",
        localId: makeLocalId(),
      })),
    );
  };

  const handleGenerate = async () => {
    if (!aiForm.destination.trim()) {
      toast.error("Destination is required.");
      return;
    }
    setIsGenerating(true);
    try {
      const draft = await generateAiItineraryApi({
        destination: aiForm.destination.trim(),
        durationDays: Number(aiForm.durationDays) || 5,
        travelerCount: aiForm.travelerCount ? Number(aiForm.travelerCount) : undefined,
        budget: aiForm.budget ? Number(aiForm.budget) : undefined,
        currency: aiForm.currency,
        style: aiForm.style.trim() || undefined,
        interests: aiForm.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        notes: aiForm.notes.trim() || undefined,
      });
      applyDraft(draft);
      setAiOpen(false);
      toast.success("Draft generated. Review the details before saving.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.destination.trim()) {
      toast.error("Name and destination are required.");
      return;
    }
    const validDays = days.filter((day) => day.title.trim());
    if (validDays.length === 0) {
      toast.error("Add at least one day with a title.");
      return;
    }
    setIsSaving(true);
    try {
      const created = await createItineraryApi({
        leadId: leadId || undefined,
        name: form.name.trim(),
        destination: form.destination.trim(),
        durationDays: Number(form.durationDays) || validDays.length,
        durationNights: Number(form.durationNights) || Math.max(validDays.length - 1, 0),
        days: validDays.map(({ localId, ...day }) => {
          void localId;
          return {
            ...day,
            day: Number(day.day),
            meals: day.meals ?? undefined,
            sightseeing: day.sightseeing ?? undefined,
            highlights: day.highlights ?? undefined,
          };
        }),
        totalPrice: form.totalPrice ? Number(form.totalPrice) : undefined,
        currency: form.currency.toUpperCase(),
        taxType: form.taxType,
        taxPercentage: Number(form.taxPercentage) || 0,
        advancePercentage: Number(form.advancePercentage) || 0,
        isTemplate: form.isTemplate,
        templateCategory: form.templateCategory.trim() || undefined,
        aiGenerated: form.aiGenerated,
      });
      toast.success("Itinerary saved.");
      router.push(`/agency/itineraries/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save itinerary.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AgencyModulePage
      tab="itineraries"
      title="New itinerary"
      description="Build the day-by-day plan and set pricing."
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/agency/itineraries">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Save itinerary
          </Button>
        </>
      }
    >
      <PageStack>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Overview</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => setAiOpen(true)}>
              <Sparkles className="size-4" aria-hidden="true" />
              Generate with AI
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="itinerary-name">Itinerary name</Label>
              <Input
                id="itinerary-name"
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="Bali honeymoon - 6 days"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="itinerary-destination">Destination</Label>
              <Input
                id="itinerary-destination"
                value={form.destination}
                onChange={(event) => updateForm("destination", event.target.value)}
                placeholder="Bali, Indonesia"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="itinerary-days">Days</Label>
              <Input
                id="itinerary-days"
                type="number"
                min={1}
                value={form.durationDays}
                onChange={(event) => updateForm("durationDays", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="itinerary-nights">Nights</Label>
              <Input
                id="itinerary-nights"
                type="number"
                min={0}
                value={form.durationNights}
                onChange={(event) => updateForm("durationNights", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="itinerary-price">Total price</Label>
              <Input
                id="itinerary-price"
                type="number"
                min={0}
                value={form.totalPrice}
                onChange={(event) => updateForm("totalPrice", event.target.value)}
                placeholder="85000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="itinerary-currency">Currency</Label>
              <Input
                id="itinerary-currency"
                maxLength={3}
                value={form.currency}
                onChange={(event) => updateForm("currency", event.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tax type</Label>
              <Select
                value={form.taxType}
                onValueChange={(value) => updateForm("taxType", value as ItineraryTaxType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITINERARY_TAX_TYPES.map((taxType) => (
                    <SelectItem key={taxType} value={taxType}>
                      {taxType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="itinerary-tax">Tax (%)</Label>
              <Input
                id="itinerary-tax"
                type="number"
                min={0}
                max={100}
                value={form.taxPercentage}
                onChange={(event) => updateForm("taxPercentage", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="itinerary-advance">Advance (%)</Label>
              <Input
                id="itinerary-advance"
                type="number"
                min={0}
                max={100}
                value={form.advancePercentage}
                onChange={(event) => updateForm("advancePercentage", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="itinerary-category">Template category</Label>
              <Input
                id="itinerary-category"
                value={form.templateCategory}
                onChange={(event) => updateForm("templateCategory", event.target.value)}
                placeholder="Honeymoon, Adventure"
              />
            </div>
            <label className="flex items-center gap-2 text-body-sm">
              <input
                type="checkbox"
                checked={form.isTemplate}
                onChange={(event) => updateForm("isTemplate", event.target.checked)}
                className="size-4 rounded border-input"
              />
              Save as template
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Day plan</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addDay}>
              <Plus className="size-4" aria-hidden="true" />
              Add day
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {days.map((day, index) => (
              <div key={day.localId} className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-body-sm font-semibold">Day {index + 1}</p>
                  {days.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDay(day.localId)}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`day-title-${day.localId}`}>Title</Label>
                    <Input
                      id={`day-title-${day.localId}`}
                      value={day.title}
                      onChange={(event) => updateDay(day.localId, "title", event.target.value)}
                      placeholder="Arrival and check-in"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`day-stay-${day.localId}`}>Accommodation</Label>
                    <Input
                      id={`day-stay-${day.localId}`}
                      value={day.accommodation ?? ""}
                      onChange={(event) =>
                        updateDay(day.localId, "accommodation", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor={`day-description-${day.localId}`}>Description</Label>
                    <textarea
                      id={`day-description-${day.localId}`}
                      rows={2}
                      value={day.description ?? ""}
                      onChange={(event) =>
                        updateDay(day.localId, "description", event.target.value)
                      }
                      className="flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`day-transport-${day.localId}`}>Transport</Label>
                    <Input
                      id={`day-transport-${day.localId}`}
                      value={day.transport ?? ""}
                      onChange={(event) => updateDay(day.localId, "transport", event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`day-meals-${day.localId}`}>Meals (comma separated)</Label>
                    <Input
                      id={`day-meals-${day.localId}`}
                      value={(day.meals ?? []).join(", ")}
                      onChange={(event) =>
                        updateDay(
                          day.localId,
                          "meals",
                          event.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean),
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            {days.length === 0 && (
              <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-body-sm text-muted-foreground">
                No days yet. Add the first day to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </PageStack>

      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate itinerary with AI</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ai-destination">Destination</Label>
              <Input
                id="ai-destination"
                value={aiForm.destination}
                onChange={(event) =>
                  setAiForm((current) => ({ ...current, destination: event.target.value }))
                }
                placeholder="Bali, Indonesia"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-days">Days</Label>
              <Input
                id="ai-days"
                type="number"
                min={1}
                max={30}
                value={aiForm.durationDays}
                onChange={(event) =>
                  setAiForm((current) => ({ ...current, durationDays: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-travelers">Travelers</Label>
              <Input
                id="ai-travelers"
                type="number"
                min={1}
                value={aiForm.travelerCount}
                onChange={(event) =>
                  setAiForm((current) => ({ ...current, travelerCount: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-budget">Budget</Label>
              <Input
                id="ai-budget"
                type="number"
                min={0}
                value={aiForm.budget}
                onChange={(event) =>
                  setAiForm((current) => ({ ...current, budget: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-currency">Currency</Label>
              <Input
                id="ai-currency"
                maxLength={3}
                value={aiForm.currency}
                onChange={(event) =>
                  setAiForm((current) => ({
                    ...current,
                    currency: event.target.value.toUpperCase(),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-style">Travel style</Label>
              <Input
                id="ai-style"
                value={aiForm.style}
                onChange={(event) =>
                  setAiForm((current) => ({ ...current, style: event.target.value }))
                }
                placeholder="Luxury, relaxed"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-interests">Interests (comma separated)</Label>
              <Input
                id="ai-interests"
                value={aiForm.interests}
                onChange={(event) =>
                  setAiForm((current) => ({ ...current, interests: event.target.value }))
                }
                placeholder="Beaches, food, culture"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ai-notes">Notes</Label>
              <textarea
                id="ai-notes"
                rows={3}
                value={aiForm.notes}
                onChange={(event) =>
                  setAiForm((current) => ({ ...current, notes: event.target.value }))
                }
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAiOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="size-4" aria-hidden="true" />
              )}
              Generate draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgencyModulePage>
  );
}
