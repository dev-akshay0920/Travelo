"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";

import { Button, IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Plus, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

import { createPackageApi, updatePackageApi } from "@/features/packages/api/package.api";
import type { TravelPackage, CreatePackageInput, GeographicScope, TripTheme, PackageVisibility } from "@/features/packages/types/package.types";
import { GEOGRAPHIC_SCOPE_OPTIONS, TRIP_THEME_OPTIONS, PACKAGE_VISIBILITY_OPTIONS, PRICE_TYPE_OPTIONS } from "@/features/packages/types/package.types";
import { TagInput } from "@/features/packages/components/tag-input";
import { TemplateSelect } from "@/features/packages/components/template-select";
import { PackageImageUpload } from "@/features/packages/components/package-image-upload";

type PackageFormMode = "create" | "edit";

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

function getFormFromPackage(pkg: TravelPackage): CreatePackageInput {
  return {
    name: pkg.name,
    description: pkg.description ?? "",
    destination: pkg.destination,
    destinations: pkg.destinations,
    geographicScope: pkg.geographicScope,
    tripTheme: pkg.tripTheme,
    durationDays: pkg.durationDays,
    durationNights: pkg.durationNights,
    startDate: pkg.startDate,
    endDate: pkg.endDate,
    bookingDeadline: pkg.bookingDeadline,
    price: pkg.price,
    currency: pkg.currency,
    priceType: pkg.priceType,
    minTravelers: pkg.minTravelers,
    maxTravelers: pkg.maxTravelers,
    availableSeats: pkg.availableSeats,
    inclusions: pkg.inclusions,
    exclusions: pkg.exclusions,
    itinerary: pkg.itinerary,
    images: pkg.images,
    highlights: pkg.highlights,
    termsAndConditions: pkg.termsAndConditions ?? "",
    cancellationPolicy: pkg.cancellationPolicy ?? "",
    visibility: pkg.visibility,
    isFeatured: pkg.isFeatured,
    slug: pkg.slug,
  };
}

type PackageFormProps = {
  mode: PackageFormMode;
  package?: TravelPackage | null;
  onSuccess: (pkg: TravelPackage) => void;
  onCancel: () => void;
  agencyId?: string;
  modalLayout?: boolean;
};

export function PackageForm({ mode, package: pkg, onSuccess, onCancel, agencyId, modalLayout = false }: PackageFormProps) {
  const [form, setForm] = useState<CreatePackageInput>(() =>
    mode === "edit" && pkg ? getFormFromPackage(pkg) : emptyForm
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugError, setSlugError] = useState("");
  const slugRegex = /^[a-z0-9-]+$/;
  const imageUploadRef = useRef<{ uploadAllPending: () => Promise<void> }>(null);

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

  const validate = (): { field: string; message: string } | null => {
    const name = form.name.trim();
    if (name.length < 2) {
      return { field: "name", message: "Package name must be at least 2 characters." };
    }
    if (name.length > 100) {
      return { field: "name", message: "Package name cannot exceed 100 characters." };
    }

    const slug = form.slug.trim();
    if (slug.length < 6) {
      return { field: "slug", message: "Slug must be at least 6 characters." };
    }
    if (slug.length > 30) {
      return { field: "slug", message: "Slug cannot exceed 30 characters." };
    }
    if (!/^[a-z]/.test(slug)) {
      return { field: "slug", message: "Slug must start with a letter." };
    }
    if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
      return { field: "slug", message: "Slug can only contain lowercase letters, numbers, and hyphens." };
    }

    const destination = (form.destinations?.[0]?.city?.trim() || form.destination?.trim() || "");
    if (destination.length < 2) {
      return { field: "destination", message: "Destination is required and must be at least 2 characters." };
    }
    if (destination.length > 100) {
      return { field: "destination", message: "Destination cannot exceed 100 characters." };
    }

    if (!form.destinations?.length) {
      return { field: "destinations", message: "At least one destination is required." };
    }
    if (form.destinations.length > 20) {
      return { field: "destinations", message: "Maximum 20 destinations allowed." };
    }
    const invalidDestination = form.destinations.find((d) => !d.city.trim());
    if (invalidDestination) {
      return { field: "destinations", message: "City is required for each destination." };
    }

    if (!form.geographicScope) {
      return { field: "geographicScope", message: "Please select a geographic scope." };
    }

    if (!form.tripTheme) {
      return { field: "tripTheme", message: "Please select a trip theme." };
    }

    if (!form.startDate) {
      return { field: "startDate", message: "Start date is required." };
    }
    if (!form.endDate) {
      return { field: "endDate", message: "End date is required." };
    }
    if (form.startDate && form.endDate && form.startDate >= form.endDate) {
      return { field: "endDate", message: "End date must be after start date." };
    }

    if (!form.bookingDeadline) {
      return { field: "bookingDeadline", message: "Booking deadline is required." };
    }
    if (form.bookingDeadline && form.startDate && form.bookingDeadline > form.startDate) {
      return { field: "bookingDeadline", message: "Booking deadline must be before or equal to the start date." };
    }

    if (form.price <= 0) {
      return { field: "price", message: "Price must be a positive number." };
    }

    if (form.currency.length !== 3) {
      return { field: "currency", message: "Currency code must be 3 characters (e.g., INR, USD)." };
    }

    if (form.minTravelers < 1) {
      return { field: "minTravelers", message: "Min travelers must be at least 1." };
    }
    if (form.maxTravelers !== undefined && form.maxTravelers < form.minTravelers) {
      return { field: "maxTravelers", message: "Max travelers cannot be less than min travelers." };
    }
    if (form.availableSeats < 0) {
      return { field: "availableSeats", message: "Available seats cannot be negative." };
    }

    if (form.durationDays < 1) {
      return { field: "durationDays", message: "Duration must be at least 1 day." };
    }
    if (form.durationDays > 365) {
      return { field: "durationDays", message: "Duration cannot exceed 365 days." };
    }
    if (form.durationNights < 0) {
      return { field: "durationNights", message: "Nights cannot be negative." };
    }
    if (form.durationNights > 364) {
      return { field: "durationNights", message: "Nights cannot exceed 364." };
    }

    if (!form.visibility) {
      return { field: "visibility", message: "Please select visibility." };
    }

    const terms = form.termsAndConditions?.trim() || "";
    if (terms.length > 5000) {
      return { field: "termsAndConditions", message: "Terms & Conditions cannot exceed 5000 characters." };
    }

    const cancellation = form.cancellationPolicy?.trim() || "";
    if (cancellation.length > 5000) {
      return { field: "cancellationPolicy", message: "Cancellation Policy cannot exceed 5000 characters." };
    }

    const itinerary = form.itinerary || [];
    if (itinerary.length > 60) {
      return { field: "itinerary", message: "Itinerary cannot exceed 60 days." };
    }

    for (const day of itinerary) {
      if (!day.title?.trim()) {
        return { field: "itinerary", message: `Day ${day.day} is missing a title.` };
      }
      if (!day.description?.trim()) {
        return { field: "itinerary", message: `Day ${day.day} is missing a description.` };
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idMap: Record<string, string> = {
      name: "name",
      slug: "slug",
      destination: "destination",
      destinations: "destinations",
      geographicScope: "geographicScope",
      tripTheme: "tripTheme",
      startDate: "startDate",
      endDate: "endDate",
      bookingDeadline: "bookingDeadline",
      price: "price",
      currency: "currency",
      priceType: "priceType",
      minTravelers: "minTravelers",
      maxTravelers: "maxTravelers",
      availableSeats: "availableSeats",
      durationDays: "durationDays",
      durationNights: "durationNights",
      visibility: "visibility",
      termsAndConditions: "termsAndConditions",
      cancellationPolicy: "cancellationPolicy",
    };

    const error = validate();
    setErrors(error ? { [error.field]: error.message } : {});

    if (error) {
      setTimeout(() => {
        const targetId = idMap[error.field];
        if (targetId) {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.focus({ preventScroll: true });
          }
        }
      }, 100);
      return;
    }
    setIsSaving(true);
    try {
      // Upload pending images first
      if (imageUploadRef.current?.uploadAllPending) {
        await imageUploadRef.current.uploadAllPending();
      }

      const payload = {
        ...form,
        destination: form.destinations?.[0]?.city?.trim() || form.destination,
      };
      if (mode === "create") {
        const response = await createPackageApi(payload, agencyId);
        toast.success("Package created successfully.");
        onSuccess(response.package);
      } else if (pkg) {
        const response = await updatePackageApi(pkg.id, payload);
        toast.success("Package updated successfully.");
        onSuccess(response.package);
      }
    } catch (err) {
      const apiError = err as { response?: { data?: { error?: { message?: string } } } };
      const backendMessage = apiError?.response?.data?.error?.message;
      if (typeof backendMessage === "string") {
        try {
          const parsed = JSON.parse(backendMessage);
          const first = Array.isArray(parsed) ? parsed[0] : parsed;
          if (first && typeof first.message === "string") {
            const fieldMap: Record<string, string> = {
              name: "name",
              slug: "slug",
              destination: "destination",
              destinations: "destinations",
              geographicScope: "geographicScope",
              tripTheme: "tripTheme",
              startDate: "startDate",
              endDate: "endDate",
              bookingDeadline: "bookingDeadline",
              price: "price",
              currency: "currency",
              priceType: "priceType",
              minTravelers: "minTravelers",
              maxTravelers: "maxTravelers",
              availableSeats: "availableSeats",
              durationDays: "durationDays",
              durationNights: "durationNights",
              visibility: "visibility",
              termsAndConditions: "termsAndConditions",
              cancellationPolicy: "cancellationPolicy",
              "itinerary.0.title": "itinerary",
              "itinerary.0.description": "itinerary",
            };
            const rawField = Array.isArray(first.path) ? first.path.join(".") : "";
            const targetField = fieldMap[rawField] || first.field || "form";
            const friendlyMessage = first.message || "Please check the form and try again.";
            setErrors({ [targetField]: friendlyMessage });
            setTimeout(() => {
              const targetId = idMap[targetField];
              if (targetId) {
                const element = document.getElementById(targetId);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "center" });
                  element.focus({ preventScroll: true });
                }
              }
            }, 100);
            return;
          }
        } catch {
          // ignore parse errors
        }
      }
      toast.error(err instanceof Error ? err.message : `Failed to ${mode} package.`);
    } finally {
      setIsSaving(false);
    }
  };

  const addItineraryDay = () => {
    const nextDay = (form.itinerary?.length || 0) + 1;
    updateField("itinerary", [
      ...(form.itinerary || []),
      { day: nextDay, title: "", description: "", accommodation: "", meals: [], highlights: [], distance: "" },
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

  return (
    <div className={modalLayout ? "flex min-h-0 flex-1 flex-col" : "flex h-full flex-col gap-6"}>
      <form
        onSubmit={handleSubmit}
        className={modalLayout ? "flex min-h-0 flex-1 flex-col" : "grid gap-6"}
        noValidate
      >
        <div className={modalLayout ? "min-h-0 flex-1 space-y-6 overflow-y-auto p-6" : "contents"}>
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="destination">Destination<span className="text-destructive">*</span></Label>
              <Input
                id="destination"
                value={form.destination}
                onChange={(e) => updateField("destination", e.target.value)}
                placeholder="e.g., Goa, India"
                maxLength={100}
                className={errors.destination ? "border-destructive" : ""}
              />
              {errors.destination && <p className="text-xs text-destructive">{errors.destination}</p>}
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

            <div id="destinations" className="space-y-2 md:col-span-2" tabIndex={-1}>
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
                      <IconButton
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          const next = (form.destinations || []).filter((_, i) => i !== index);
                          updateField("destinations", next);
                        }}
                        label={`Remove destination ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </IconButton>
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
              {errors.geographicScope && <p className="text-xs text-destructive">{errors.geographicScope}</p>}

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
              {errors.tripTheme && <p className="text-xs text-destructive">{errors.tripTheme}</p>}
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
                {errors.priceType && <p className="text-xs text-destructive">{errors.priceType}</p>}
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

        <PackageImageUpload
          ref={imageUploadRef}
          packageId={pkg?.id || ""}
          initialImages={form.images || []}
          onImagesChange={(images) => updateField("images", images)}
          disabled={!pkg?.id && mode === "create"}
        />

        <Card size="sm">
          <CardHeader>
            <CardTitle>Policies</CardTitle>
            <CardDescription>Set terms and cancellation policy.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
                <TemplateSelect type="terms" value={form.termsAndConditions ?? ""} onChange={(value) => updateField("termsAndConditions", value)} />
              </div>
              <Textarea
                id="termsAndConditions"
                value={form.termsAndConditions ?? ""}
                onChange={(e) => updateField("termsAndConditions", e.target.value)}
                placeholder="Enter terms and conditions..."
                rows={3}
                maxLength={5000}
                className={errors.termsAndConditions ? "border-destructive" : ""}
              />
              {errors.termsAndConditions && <p className="text-xs text-destructive">{errors.termsAndConditions}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                <TemplateSelect type="cancellation" value={form.cancellationPolicy ?? ""} onChange={(value) => updateField("cancellationPolicy", value)} />
              </div>
              <Textarea
                id="cancellationPolicy"
                value={form.cancellationPolicy ?? ""}
                onChange={(e) => updateField("cancellationPolicy", e.target.value)}
                placeholder="Enter cancellation policy..."
                rows={3}
                maxLength={5000}
                className={errors.cancellationPolicy ? "border-destructive" : ""}
              />
              {errors.cancellationPolicy && <p className="text-xs text-destructive">{errors.cancellationPolicy}</p>}
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Itinerary</CardTitle>
            <CardDescription>Day-wise schedule for the package.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {errors.itinerary && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {errors.itinerary}
              </div>
            )}
            {(form.itinerary || []).map((day, index) => (
              <div key={index} className="grid gap-3 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    Day {day.day}
                  </span>
                  <IconButton
                    type="button"
                    variant="ghost"
                    onClick={() => removeItineraryDay(index)}
                    label={`Remove itinerary day ${day.day}`}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 />
                  </IconButton>
                </div>
                <div className="grid gap-2">
                  <Input
                    value={day.title}
                    onChange={(e) => updateItineraryDay(index, "title", e.target.value)}
                    placeholder="Day title"
                  />
                  <Textarea
                    value={day.description}
                    onChange={(e) => updateItineraryDay(index, "description", e.target.value)}
                    placeholder="Day description"
                    rows={2}
                  />
                  <Input
                    value={day.accommodation || ""}
                    onChange={(e) => updateItineraryDay(index, "accommodation", e.target.value)}
                    placeholder="Accommodation"
                  />
                  <Input
                    value={day.distance || ""}
                    onChange={(e) => updateItineraryDay(index, "distance", e.target.value)}
                    placeholder="Distance (e.g., 120 km by road)"
                  />
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Meals</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Breakfast", "Lunch", "Dinner"].map((meal) => {
                        const selected = (day.meals || []).includes(meal);
                        return (
                          <button
                            key={meal}
                            type="button"
                            onClick={() => {
                              const current = day.meals || [];
                              const next = selected
                                ? current.filter((item) => item !== meal)
                                : [...current, meal];
                              updateItineraryDay(index, "meals", next);
                            }}
                            className={`inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                              selected
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {meal}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Highlights</Label>
                    <TagInput
                      value={day.highlights || []}
                      onChange={(highlights) => updateItineraryDay(index, "highlights", highlights)}
                      placeholder="e.g., Scuba diving, Dinner cruise"
                      maxItems={5}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addItineraryDay}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              Add Day
            </button>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Visibility and featured status for this package.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
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
                {errors.visibility && <p className="text-xs text-destructive">{errors.visibility}</p>}
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
            </div>
          </CardContent>
        </Card>

        </div>
        <div className={modalLayout
          ? "flex shrink-0 justify-end gap-3 border-t border-border bg-muted/50 px-6 py-4"
          : "mb-2 flex justify-end gap-3"}
        >
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Spinner label="Saving package" size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            {mode === "create" ? "Create Package" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
