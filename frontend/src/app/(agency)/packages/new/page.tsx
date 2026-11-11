"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

import { createPackageApi } from "@/features/packages/api/package.api";
import type { CreatePackageInput, GeographicScope, TripTheme, PackageVisibility, PackageStatus } from "@/features/packages/types/package.types";
import { GEOGRAPHIC_SCOPE_OPTIONS, TRIP_THEME_OPTIONS, PACKAGE_VISIBILITY_OPTIONS, PACKAGE_STATUS_OPTIONS, PRICE_TYPE_OPTIONS } from "@/features/packages/types/package.types";
import { TagInput } from "@/features/packages/components/tag-input";
import { TemplateSelector } from "@/features/packages/components/template-selector";
import { SaveAsTemplateModal } from "@/features/packages/components/save-as-template-modal";

const emptyForm: CreatePackageInput = {
  name: "",
  description: "",
  destination: "",
  destinations: [],
  geographicScope: "domestic",
  tripTheme: "leisure",
  durationDays: 1,
  durationNights: 0,
  startDate: "",
  endDate: "",
  bookingDeadline: "",
  price: 0,
  currency: "INR",
  priceType: "total",
  minTravelers: 1,
  maxTravelers: undefined,
  availableSeats: 0,
  inclusions: [],
  exclusions: [],
  itinerary: [],
  images: [],
  highlights: [],
  termsAndConditions: "",
  cancellationPolicy: "",
  visibility: "private",
  isFeatured: false,
  slug: "",
};

export default function NewPackagePage() {
  const router = useRouter();
  const [form, setForm] = useState<CreatePackageInput>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugError, setSlugError] = useState("");
  const [isTermsTemplateOpen, setIsTermsTemplateOpen] = useState(false);
  const [isCancellationTemplateOpen, setIsCancellationTemplateOpen] = useState(false);
  const slugRegex = /^[a-z0-9-]+$/;

  const updateField = <K extends keyof CreatePackageInput>(field: K, value: CreatePackageInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateStringArray = (field: "destinations" | "inclusions" | "exclusions" | "highlights", value: string) => {
    const items = value.split(",").map((item) => item.trim()).filter(Boolean);
    updateField(field, items);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Package name is required.";
    if (!form.slug.trim()) {
      newErrors.slug = "Slug is required.";
    } else if (form.slug.length < 6) {
      newErrors.slug = "Slug must be at least 6 characters.";
    } else if (!/^[a-z][a-z0-9-]*$/.test(form.slug)) {
      newErrors.slug = "Slug must start with a letter and can only contain lowercase letters, numbers, and hyphens.";
    }
    if (!form.destinations?.length) {
      newErrors.destinations = "At least one destination is required.";
    } else {
      const invalid = form.destinations.find((d) => !d.city.trim());
      if (invalid) newErrors.destinations = "City is required for each destination.";
    }
    if (!form.startDate) newErrors.startDate = "Start date is required.";
    if (!form.endDate) newErrors.endDate = "End date is required.";
    if (form.startDate && form.endDate && form.startDate >= form.endDate) {
      newErrors.endDate = "End date must be after start date.";
    }
    if (!form.bookingDeadline) {
      newErrors.bookingDeadline = "Booking deadline is required.";
    } else if (form.startDate && form.bookingDeadline > form.startDate) {
      newErrors.bookingDeadline = "Booking deadline must be before start date.";
    }
    if (form.price < 0) newErrors.price = "Price must be a positive number.";
    if (form.minTravelers < 1) newErrors.minTravelers = "Min travelers must be at least 1.";
    if (form.maxTravelers !== undefined && form.maxTravelers < form.minTravelers) {
      newErrors.maxTravelers = "Max travelers cannot be less than min travelers.";
    }
    if (form.availableSeats < 0) newErrors.availableSeats = "Available seats cannot be negative.";
    if (form.durationDays < 1) newErrors.durationDays = "Duration must be at least 1 day.";
    if (form.durationNights < 0) newErrors.durationNights = "Nights cannot be negative.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addItineraryDay = () => {
    const nextDay = (form.itinerary?.length || 0) + 1;
    updateField("itinerary", [
      ...(form.itinerary || []),
      { day: nextDay, title: "", description: "", meals: [], accommodation: "" },
    ]);
  };

  const updateItineraryDay = (index: number, field: string, value: string | string[]) => {
    const updated = (form.itinerary || []).map((day, i) =>
      i === index ? { ...day, [field]: value } : day
    );
    updateField("itinerary", updated);
  };

  const removeItineraryDay = (index: number) => {
    const updated = (form.itinerary || [])
      .filter((_, i) => i !== index)
      .map((day, i) => ({ ...day, day: i + 1 }));
    updateField("itinerary", updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (slugError) {
      toast.error("Please fix the slug errors before submitting.");
      return;
    }
    setIsSaving(true);
    try {
      const response = await createPackageApi(form);
      toast.success("Package created successfully.");
      router.push(`/agency/packages/${response.package.id}/edit`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create package.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClassName = "h-8 w-full rounded-[5px] border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create Package</h1>
          <p className="text-sm text-muted-foreground">Add a new travel package to your agency.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core details about your travel package.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Package Name<span className="text-destructive">*</span></Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Goa Beach Getaway"
                maxLength={100}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug<span className="text-destructive">*</span></Label>
              <Input
                id="slug"
                value={form.slug}
                maxLength={30}
                onChange={(event) => {
                  const value = event.target.value.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
                  updateField("slug", value);
                  if (slugError) setSlugError("");
                }}
                onBlur={() => {
                  const trimmed = form.slug.trim();
                  if (!trimmed) {
                    setSlugError("Slug is required.");
                  } else if (trimmed.length < 6) {
                    setSlugError("Slug must be at least 6 characters.");
                  } else if (!/^[a-z]/.test(trimmed)) {
                    setSlugError("Slug must start with a letter.");
                  } else if (!slugRegex.test(trimmed)) {
                    setSlugError("Slug can only contain lowercase letters, numbers, and hyphens.");
                  }
                }}
                required
                aria-invalid={!!slugError}
              />
              {slugError && <p className="text-xs text-destructive">{slugError}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Destinations<span className="text-destructive">*</span></Label>
              <div className="space-y-2">
                {form.destinations?.map((dest, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-12 sm:col-span-3 space-y-1">
                      <Label htmlFor={`dest-city-${index}`} className="text-xs">City<span className="text-destructive">*</span></Label>
                      <Input
                        id={`dest-city-${index}`}
                        value={dest.city}
                        onChange={(e) => {
                          const next = [...(form.destinations || [])];
                          next[index] = { ...next[index], city: e.target.value };
                          updateField("destinations", next);
                        }}
                        placeholder="City"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3 space-y-1">
                      <Label htmlFor={`dest-state-${index}`} className="text-xs">State</Label>
                      <Input
                        id={`dest-state-${index}`}
                        value={dest.state || ""}
                        onChange={(e) => {
                          const next = [...(form.destinations || [])];
                          next[index] = { ...next[index], state: e.target.value };
                          updateField("destinations", next);
                        }}
                        placeholder="State"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3 space-y-1">
                      <Label htmlFor={`dest-country-${index}`} className="text-xs">Country</Label>
                      <Input
                        id={`dest-country-${index}`}
                        value={dest.country || ""}
                        onChange={(e) => {
                          const next = [...(form.destinations || [])];
                          next[index] = { ...next[index], country: e.target.value };
                          updateField("destinations", next);
                        }}
                        placeholder="Country"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-2 space-y-1">
                      <Label htmlFor={`dest-days-${index}`} className="text-xs">Days</Label>
                      <Input
                        id={`dest-days-${index}`}
                        type="number"
                        min={1}
                        value={dest.days ?? ""}
                        onChange={(e) => {
                          const next = [...(form.destinations || [])];
                          next[index] = { ...next[index], days: e.target.value ? Number(e.target.value) : undefined };
                          updateField("destinations", next);
                        }}
                        placeholder="Days"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const next = (form.destinations || []).filter((_, i) => i !== index);
                          updateField("destinations", next);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateField("destinations", [...(form.destinations || []), { city: "", state: "", country: "", days: undefined }])}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Destination
                </Button>
              </div>
              {errors.destinations && <p className="text-xs text-destructive">{errors.destinations}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Brief summary of the package..."
                rows={3}
                maxLength={1000}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="geographicScope">Geographic Scope<span className="text-destructive">*</span></Label>
                <Select value={form.geographicScope} onValueChange={(value) => updateField("geographicScope", value as GeographicScope)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    {GEOGRAPHIC_SCOPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tripTheme">Trip Theme<span className="text-destructive">*</span></Label>
                <Select value={form.tripTheme} onValueChange={(value) => updateField("tripTheme", value as TripTheme)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIP_THEME_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Dates & Pricing</CardTitle>
            <CardDescription>Set the schedule, duration, and pricing for your package.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date<span className="text-destructive">*</span></Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                className={errors.startDate ? "border-destructive" : ""}
              />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date<span className="text-destructive">*</span></Label>
              <Input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
                className={errors.endDate ? "border-destructive" : ""}
              />
              {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookingDeadline">Booking Deadline</Label>
              <Input
                id="bookingDeadline"
                type="date"
                value={form.bookingDeadline}
                onChange={(e) => updateField("bookingDeadline", e.target.value)}
                className={errors.bookingDeadline ? "border-destructive" : ""}
              />
              {errors.bookingDeadline && <p className="text-xs text-destructive">{errors.bookingDeadline}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationDays">Duration (Days)<span className="text-destructive">*</span></Label>
              <Input
                id="durationDays"
                type="number"
                min={1}
                max={365}
                value={form.durationDays}
                onChange={(e) => updateField("durationDays", parseInt(e.target.value || "0", 10))}
                className={errors.durationDays ? "border-destructive" : ""}
              />
              {errors.durationDays && <p className="text-xs text-destructive">{errors.durationDays}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationNights">Duration (Nights)<span className="text-destructive">*</span></Label>
              <Input
                id="durationNights"
                type="number"
                min={0}
                max={364}
                value={form.durationNights}
                onChange={(e) => updateField("durationNights", parseInt(e.target.value || "0", 10))}
                className={errors.durationNights ? "border-destructive" : ""}
              />
              {errors.durationNights && <p className="text-xs text-destructive">{errors.durationNights}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (INR)<span className="text-destructive">*</span></Label>
              <Input
                id="price"
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => updateField("price", parseFloat(e.target.value || "0"))}
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceType">Price Type<span className="text-destructive">*</span></Label>
              <Select value={form.priceType} onValueChange={(value) => updateField("priceType", value as "per_person" | "total")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price type" />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minTravelers">Min Travelers<span className="text-destructive">*</span></Label>
              <Input
                id="minTravelers"
                type="number"
                min={1}
                value={form.minTravelers}
                onChange={(e) => updateField("minTravelers", parseInt(e.target.value || "1", 10))}
                className={errors.minTravelers ? "border-destructive" : ""}
              />
              {errors.minTravelers && <p className="text-xs text-destructive">{errors.minTravelers}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTravelers">Max Travelers</Label>
              <Input
                id="maxTravelers"
                type="number"
                min={1}
                value={form.maxTravelers ?? ""}
                onChange={(e) => updateField("maxTravelers", e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className={errors.maxTravelers ? "border-destructive" : ""}
              />
              {errors.maxTravelers && <p className="text-xs text-destructive">{errors.maxTravelers}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableSeats">Available Seats<span className="text-destructive">*</span></Label>
              <Input
                id="availableSeats"
                type="number"
                min={0}
                value={form.availableSeats}
                onChange={(e) => updateField("availableSeats", parseInt(e.target.value || "0", 10))}
                className={errors.availableSeats ? "border-destructive" : ""}
              />
              {errors.availableSeats && <p className="text-xs text-destructive">{errors.availableSeats}</p>}
            </div>
           </CardContent>
         </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Add inclusions, exclusions, and highlights.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Inclusions</Label>
              <TagInput
                value={form.inclusions || []}
                onChange={(tags) => updateField("inclusions", tags)}
                maxItems={20}
                placeholder="e.g., Accommodation, Meals, Sightseeing"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Exclusions</Label>
              <TagInput
                value={form.exclusions || []}
                onChange={(tags) => updateField("exclusions", tags)}
                maxItems={20}
                placeholder="e.g., Flights, Personal expenses"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Highlights</Label>
              <TagInput
                value={form.highlights || []}
                onChange={(tags) => updateField("highlights", tags)}
                maxItems={5}
                placeholder="e.g., Beach stay, Mountain trek, City tour"
              />
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Policies</CardTitle>
            <CardDescription>Set terms and cancellation policy.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
                <TemplateSelector type="terms" value={form.termsAndConditions ?? ""} onChange={(value) => updateField("termsAndConditions", value)} />
              </div>
              <Textarea
                id="termsAndConditions"
                value={form.termsAndConditions ?? ""}
                onChange={(e) => updateField("termsAndConditions", e.target.value)}
                placeholder="Enter terms and conditions..."
                rows={3}
                maxLength={5000}
              />
              <button
                type="button"
                onClick={() => setIsTermsTemplateOpen(true)}
                className="inline-flex h-8 items-center rounded-[5px] border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Save as Template
              </button>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                <TemplateSelector type="cancellation" value={form.cancellationPolicy ?? ""} onChange={(value) => updateField("cancellationPolicy", value)} />
              </div>
              <Textarea
                id="cancellationPolicy"
                value={form.cancellationPolicy ?? ""}
                onChange={(e) => updateField("cancellationPolicy", e.target.value)}
                placeholder="Enter cancellation policy..."
                rows={3}
                maxLength={5000}
              />
              <button
                type="button"
                onClick={() => setIsCancellationTemplateOpen(true)}
                className="inline-flex h-8 items-center rounded-[5px] border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Save as Template
              </button>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Itinerary</CardTitle>
            <CardDescription>Day-wise schedule for the package.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {(form.itinerary || []).map((day, index) => (
              <div key={index} className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[auto_1fr]">
                <div className="flex items-center justify-between md:flex-col md:items-start">
                  <span className="text-sm font-medium text-muted-foreground">Day {day.day}</span>
                  <button
                    type="button"
                    onClick={() => removeItineraryDay(index)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`itinerary-title-${index}`}>Title</Label>
                    <Input
                      id={`itinerary-title-${index}`}
                      value={day.title}
                      onChange={(e) => updateItineraryDay(index, "title", e.target.value)}
                      placeholder="Day title"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`itinerary-description-${index}`}>Description</Label>
                    <Textarea
                      id={`itinerary-description-${index}`}
                      value={day.description}
                      onChange={(e) => updateItineraryDay(index, "description", e.target.value)}
                      placeholder="Day description"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`itinerary-accommodation-${index}`}>Accommodation</Label>
                    <Input
                      id={`itinerary-accommodation-${index}`}
                      value={day.accommodation}
                      onChange={(e) => updateItineraryDay(index, "accommodation", e.target.value)}
                      placeholder="Hotel name"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addItineraryDay}
              className="inline-flex h-8 items-center rounded-[5px] border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Day
            </button>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Visibility and visibility for this package.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select value={form.visibility} onValueChange={(value) => updateField("visibility", value as PackageVisibility)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGE_VISIBILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="isFeatured">Featured Package</Label>
              <Select value={form.isFeatured ? "true" : "false"} onValueChange={(value) => updateField("isFeatured", value === "true")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Spinner label="Saving package" size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Save Package
          </Button>
        </div>
      </form>

      <SaveAsTemplateModal
        isOpen={isTermsTemplateOpen}
        onClose={() => setIsTermsTemplateOpen(false)}
        onSaved={() => {}}
        type="terms"
        content={form.termsAndConditions ?? ""}
      />

      <SaveAsTemplateModal
        isOpen={isCancellationTemplateOpen}
        onClose={() => setIsCancellationTemplateOpen(false)}
        onSaved={() => {}}
        type="cancellation"
        content={form.cancellationPolicy ?? ""}
      />
    </div>
  );
}
