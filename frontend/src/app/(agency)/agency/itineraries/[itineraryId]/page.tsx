"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Copy,
  FileText,
  Loader2,
  Plus,
  Save,
  Sparkles,
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
import { DetailRow, SectionCard } from "@/features/agency/components/crm-ui";
import {
  deleteItineraryApi,
  duplicateItineraryApi,
  getItineraryApi,
  updateItineraryApi,
} from "@/features/agency/api/crm.api";
import { formatCurrency, formatDateTime } from "@/features/agency/lib/format";
import {
  ITINERARY_TAX_TYPES,
  type Itinerary,
  type ItineraryDay,
  type ItineraryTaxType,
} from "@/features/agency/types/crm.types";

interface DayForm extends ItineraryDay {
  localId: string;
}

const makeLocalId = () => Math.random().toString(36).slice(2);

const toDayForm = (day: ItineraryDay): DayForm => ({ ...day, localId: makeLocalId() });

const emptyDay = (dayNumber: number): DayForm => ({
  localId: makeLocalId(),
  day: dayNumber,
  title: "",
  description: "",
  accommodation: "",
  transport: "",
});

export default function ItineraryDetailPage() {
  const params = useParams<{ itineraryId: string }>();
  const itineraryId = String(params.itineraryId ?? "");
  const router = useRouter();

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    destination: "",
    durationDays: "1",
    durationNights: "0",
    totalPrice: "",
    currency: "INR",
    taxType: "none" as ItineraryTaxType,
    taxPercentage: "0",
    advancePercentage: "0",
    templateCategory: "",
    isTemplate: false,
  });
  const [days, setDays] = useState<DayForm[]>([]);

  const load = useCallback(async () => {
    if (!itineraryId) return;
    setIsLoading(true);
    setError(null);
    try {
      const value = await getItineraryApi(itineraryId);
      setItinerary(value);
      setForm({
        name: value.name,
        destination: value.destination,
        durationDays: String(value.durationDays),
        durationNights: String(value.durationNights),
        totalPrice: String(value.totalPrice ?? ""),
        currency: value.currency,
        taxType: value.taxType,
        taxPercentage: String(value.taxPercentage ?? 0),
        advancePercentage: String(value.advancePercentage ?? 0),
        templateCategory: value.templateCategory ?? "",
        isTemplate: value.isTemplate,
      });
      setDays(value.days.map(toDayForm));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load itinerary.");
    } finally {
      setIsLoading(false);
    }
  }, [itineraryId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateItineraryApi(itineraryId, {
        name: form.name.trim(),
        destination: form.destination.trim(),
        durationDays: Number(form.durationDays) || days.length,
        durationNights: Number(form.durationNights) || Math.max(days.length - 1, 0),
        days: days.map(({ localId, ...day }) => {
          void localId;
          return day;
        }),
        totalPrice: form.totalPrice ? Number(form.totalPrice) : undefined,
        currency: form.currency.toUpperCase(),
        taxType: form.taxType,
        taxPercentage: Number(form.taxPercentage) || 0,
        advancePercentage: Number(form.advancePercentage) || 0,
        isTemplate: form.isTemplate,
        templateCategory: form.templateCategory.trim() || undefined,
      });
      toast.success("Itinerary saved.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save itinerary.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async () => {
    const name = window.prompt("Name for the copied itinerary", `${itinerary?.name ?? "Itinerary"} (copy)`);
    if (!name) return;
    try {
      const copy = await duplicateItineraryApi(itineraryId, name);
      toast.success("Itinerary duplicated.");
      router.push(`/agency/itineraries/${copy.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to duplicate.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this itinerary? This cannot be undone.")) return;
    try {
      await deleteItineraryApi(itineraryId);
      toast.success("Itinerary deleted.");
      router.push("/agency/itineraries");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete itinerary.");
    }
  };

  if (isLoading) {
    return (
      <AgencyModulePage tab="itineraries" title="Itinerary">
        <LoadingState />
      </AgencyModulePage>
    );
  }

  if (error || !itinerary) {
    return (
      <AgencyModulePage tab="itineraries" title="Itinerary">
        <ErrorState
          title="Could not load this itinerary"
          description={error ?? "Itinerary not found."}
          action={
            <Button variant="outline" onClick={() => router.push("/agency/itineraries")}>
              Back to itineraries
            </Button>
          }
        />
      </AgencyModulePage>
    );
  }

  return (
    <AgencyModulePage
      tab="itineraries"
      title={itinerary.name}
      description={`${itinerary.destination} - ${itinerary.durationDays} days`}
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/agency/itineraries">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="size-4" aria-hidden="true" />
            Duplicate
          </Button>
          {itinerary.leadId && (
            <Button asChild>
              <Link
                href={`/agency/quotations/new?leadId=${itinerary.leadId}&itineraryId=${itinerary.id}`}
              >
                <FileText className="size-4" aria-hidden="true" />
                Create quotation
              </Link>
            </Button>
          )}
        </>
      }
    >
      <PageStack>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <SectionCard
              title="Day plan"
              description="Edit each day, add activities and keep the flow realistic."
              action={
                <Button size="sm" variant="outline" onClick={addDay}>
                  <Plus className="size-4" aria-hidden="true" />
                  Add day
                </Button>
              }
            >
              {days.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-body-sm text-muted-foreground">
                  No days yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {days.map((day, index) => (
                    <div key={day.localId} className="rounded-lg border border-border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-body-sm font-semibold">Day {index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => removeDay(day.localId)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Remove
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor={`title-${day.localId}`}>Title</Label>
                          <Input
                            id={`title-${day.localId}`}
                            value={day.title}
                            onChange={(event) => updateDay(day.localId, "title", event.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`stay-${day.localId}`}>Accommodation</Label>
                          <Input
                            id={`stay-${day.localId}`}
                            value={day.accommodation ?? ""}
                            onChange={(event) =>
                              updateDay(day.localId, "accommodation", event.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label htmlFor={`description-${day.localId}`}>Description</Label>
                          <textarea
                            id={`description-${day.localId}`}
                            rows={2}
                            value={day.description ?? ""}
                            onChange={(event) =>
                              updateDay(day.localId, "description", event.target.value)
                            }
                            className="flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`transport-${day.localId}`}>Transport</Label>
                          <Input
                            id={`transport-${day.localId}`}
                            value={day.transport ?? ""}
                            onChange={(event) =>
                              updateDay(day.localId, "transport", event.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`meals-${day.localId}`}>Meals (comma separated)</Label>
                          <Input
                            id={`meals-${day.localId}`}
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
                        <div className="space-y-1.5">
                          <Label htmlFor={`sightseeing-${day.localId}`}>
                            Sightseeing (comma separated)
                          </Label>
                          <Input
                            id={`sightseeing-${day.localId}`}
                            value={(day.sightseeing ?? []).join(", ")}
                            onChange={(event) =>
                              updateDay(
                                day.localId,
                                "sightseeing",
                                event.target.value
                                  .split(",")
                                  .map((item) => item.trim())
                                  .filter(Boolean),
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`highlights-${day.localId}`}>
                            Highlights (comma separated)
                          </Label>
                          <Input
                            id={`highlights-${day.localId}`}
                            value={(day.highlights ?? []).join(", ")}
                            onChange={(event) =>
                              updateDay(
                                day.localId,
                                "highlights",
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
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-5">
            <SectionCard title="Overview">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="detail-name">Name</Label>
                  <Input
                    id="detail-name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="detail-destination">Destination</Label>
                  <Input
                    id="detail-destination"
                    value={form.destination}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, destination: event.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="detail-days">Days</Label>
                    <Input
                      id="detail-days"
                      type="number"
                      min={1}
                      value={form.durationDays}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, durationDays: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="detail-nights">Nights</Label>
                    <Input
                      id="detail-nights"
                      type="number"
                      min={0}
                      value={form.durationNights}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, durationNights: event.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="detail-price">Total price</Label>
                    <Input
                      id="detail-price"
                      type="number"
                      min={0}
                      value={form.totalPrice}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, totalPrice: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="detail-currency">Currency</Label>
                    <Input
                      id="detail-currency"
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
                </div>
                <div className="space-y-1.5">
                  <Label>Tax type</Label>
                  <Select
                    value={form.taxType}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, taxType: value as ItineraryTaxType }))
                    }
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="detail-tax">Tax (%)</Label>
                    <Input
                      id="detail-tax"
                      type="number"
                      min={0}
                      max={100}
                      value={form.taxPercentage}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, taxPercentage: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="detail-advance">Advance (%)</Label>
                    <Input
                      id="detail-advance"
                      type="number"
                      min={0}
                      max={100}
                      value={form.advancePercentage}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          advancePercentage: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="detail-category">Template category</Label>
                  <Input
                    id="detail-category"
                    value={form.templateCategory}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, templateCategory: event.target.value }))
                    }
                  />
                </div>
                <label className="flex items-center gap-2 text-body-sm">
                  <input
                    type="checkbox"
                    checked={form.isTemplate}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, isTemplate: event.target.checked }))
                    }
                    className="size-4 rounded border-input"
                  />
                  Save as template
                </label>
                <Button type="button" className="w-full" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="size-4" aria-hidden="true" />
                  )}
                  Save changes
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Meta">
              <DetailRow
                label="Total"
                value={formatCurrency(Number(form.totalPrice) || itinerary.totalPrice, form.currency)}
              />
              <DetailRow label="AI generated" value={itinerary.aiGenerated ? "Yes" : "No"} />
              <DetailRow
                label="Created"
                value={<span className="inline-flex items-center gap-1"><Sparkles className="size-3" aria-hidden="true" />{formatDateTime(itinerary.createdAt)}</span>}
              />
              <DetailRow label="Updated" value={formatDateTime(itinerary.updatedAt)} />
              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete itinerary
              </Button>
            </SectionCard>
          </div>
        </div>
      </PageStack>
    </AgencyModulePage>
  );
}
