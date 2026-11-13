"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Save, Send } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { PageStack } from "@/components/shared/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { YearPickerField } from "@/components/ui/year-picker";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/errors";

import { AgencyShell } from "@/features/agency/components/agency-shell";
import { PackagesTab } from "@/features/agency/components/packages-tab";
import { AgencyOverview } from "@/features/leads/components/agency-overview";
import { InquiryInbox } from "@/features/leads/components/inquiry-inbox";
import SettingsTemplatesTab from "./settings/templates/page";
import {
  getMyAgencyApi,
  createMyAgencyApi,
  updateMyAgencyApi,
  submitMyAgencyApi,
  checkSlugAvailabilityApi,
  uploadMyAgencyLogoApi,
} from "@/features/agencies/api/agency.api";
import type {
  AgencyProfile,
  UpdateAgencyInput,
  AgencyService,
} from "@/features/agencies/types/agency.types";
import { AGENCY_SERVICE_OPTIONS } from "@/features/agencies/types/agency.types";

type Tab = "dashboard" | "inquiries" | "packages" | "settings";
type SettingsSubTab = "templates" | "profile";

export default function AgencyPage() {
  const pathname = usePathname();
  const activeTab: Tab = pathname === "/agency/inquiries"
    ? "inquiries"
    : pathname === "/agency/packages"
      ? "packages"
      : pathname.startsWith("/agency/settings")
        ? "settings"
        : "dashboard";
  const [settingsSelection, setSettingsSelection] = useState<{
    pathname: string;
    tab: SettingsSubTab;
  }>({ pathname: "", tab: "profile" });
  const activeSettingsSubTab =
    settingsSelection.pathname === pathname ? settingsSelection.tab : "profile";
  const setActiveSettingsSubTab = useCallback((tab: SettingsSubTab) => {
    setSettingsSelection({ pathname, tab });
  }, [pathname]);
  const [agency, setAgency] = useState<AgencyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [pendingAgencyLogo, setPendingAgencyLogo] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const agencyLogoInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState("");
  const [agencyNameError, setAgencyNameError] = useState("");
  const [profileNameError, setProfileNameError] = useState("");
  const [slugError, setSlugError] = useState("");
  const slugRegex = /^[a-z0-9-]+$/;
  const [pincodeError, setPincodeError] = useState("");
  const [cityError, setCityError] = useState("");
  const [stateError, setStateError] = useState("");
  const [countryError, setCountryError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [websiteError, setWebsiteError] = useState("");
  const pincodeRegex = /^[0-9]{6}$/;
  const alphaRegex = /^[A-Za-z\s]+$/;
  const phoneRegex = /^[+]?[\d\s()-]{7,20}$/;
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  const websiteRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,})([\/\w .-]*)*\/?$/;
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const previewUrl = pendingAgencyLogo?.previewUrl;
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [pendingAgencyLogo?.previewUrl]);

  const safeLocation = agency?.location ?? {
    country: "",
    state: "",
    city: "",
    address: "",
    pincode: "",
  };

  const safeContact = agency?.contact ?? {
    phone: "",
    email: "",
    website: "",
  };

  const loadAgency = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyAgencyApi();
      const normalized: AgencyProfile = {
        id: data.id ?? (data as unknown as { _id?: string })._id ?? "",
        ownerUserId: data.ownerUserId,
        name: data.name,
        slug: data.slug,
        logo: data.logo,
        about: data.about,
        yearEstablished: data.yearEstablished,
        location: data.location ?? {
          country: "",
          state: "",
          city: "",
          address: "",
          pincode: "",
        },
        contact: data.contact ?? {
          phone: "",
          email: "",
          website: "",
        },
        services: data.services ?? [],
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
      setAgency(normalized);
    } catch (err) {
      if (err instanceof ApiError && err.isNotFoundError) {
        setAgency(null);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load agency profile.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAgency();
  }, [loadAgency]);

  const slugTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousSlugRef = useRef<string | undefined>(undefined);
  const currentSlugRef = useRef("");

  useEffect(() => {
    if (!agency?.slug || !agency?.id) {
      return;
    }

    if (slugTimeoutRef.current) {
      clearTimeout(slugTimeoutRef.current);
    }

    const trimmed = agency.slug.trim();
    currentSlugRef.current = trimmed;

    if (!trimmed || trimmed === previousSlugRef.current) {
      return;
    }

    previousSlugRef.current = trimmed;

    slugTimeoutRef.current = setTimeout(async () => {
      if (currentSlugRef.current !== trimmed) {
        return;
      }

      try {
        const result = await checkSlugAvailabilityApi(trimmed, agency?.id);
        if (!result.available) {
          setSlugError("This slug is already in use. Please choose another.");
        } else {
          setSlugError("");
        }
      } catch {
        // ignore availability check failure to keep editing flow smooth
      }
    }, 500);

    return () => {
      if (slugTimeoutRef.current) {
        clearTimeout(slugTimeoutRef.current);
      }
    };
  }, [agency?.slug, agency?.id]);

  const updateField = <K extends keyof AgencyProfile>(field: K, value: AgencyProfile[K]) => {
    setAgency((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const updateLocation = (field: keyof AgencyProfile["location"], value: string) => {
    setAgency((prev) =>
      prev ? { ...prev, location: { ...prev.location, [field]: value } } : prev
    );
  };

  const updateContact = (field: keyof AgencyProfile["contact"], value: string) => {
    setAgency((prev) =>
      prev ? { ...prev, contact: { ...prev.contact, [field]: value } } : prev
    );
  };

  const toggleService = (service: AgencyService) => {
    setAgency((prev) => {
      if (!prev) return prev;
      const services = prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service];
      return { ...prev, services };
    });
  };

  const scrollToField = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.focus({ preventScroll: true });
    }
  };

  const validateRequiredFields = () => {
    if (!agency?.name.trim()) {
      setProfileNameError("Agency name is required.");
      scrollToField("agency-name");
      return false;
    }

    if (!agency?.slug.trim()) {
      setSlugError("Profile URL slug is required.");
      scrollToField("slug");
      return false;
    }

    if (slugError) {
      scrollToField("slug");
      return false;
    }

    return true;
  };

  const buildUpdatePayload = (currentAgency: AgencyProfile): UpdateAgencyInput => {
    const locationPayload = {
      ...(safeLocation.address?.trim() ? { address: safeLocation.address.trim() } : {}),
      ...(safeLocation.city?.trim() ? { city: safeLocation.city.trim() } : {}),
      ...(safeLocation.state?.trim() ? { state: safeLocation.state.trim() } : {}),
      ...(safeLocation.country?.trim() ? { country: safeLocation.country.trim() } : {}),
      ...(safeLocation.pincode?.trim() ? { pincode: safeLocation.pincode.trim() } : {}),
    };

    const contactPayload = {
      ...(safeContact.phone?.trim() ? { phone: safeContact.phone.trim() } : {}),
      ...(safeContact.email?.trim() ? { email: safeContact.email.trim() } : {}),
      ...(safeContact.website?.trim() ? { website: safeContact.website.trim() } : {}),
    };

    return {
      name: currentAgency.name,
      slug: currentAgency.slug,
      ...(currentAgency.about?.trim() ? { about: currentAgency.about.trim() } : {}),
      ...(currentAgency.yearEstablished ? { yearEstablished: currentAgency.yearEstablished } : {}),
      ...(Object.keys(locationPayload).length ? { location: locationPayload } : {}),
      ...(Object.keys(contactPayload).length ? { contact: contactPayload } : {}),
      ...(currentAgency.services.length ? { services: currentAgency.services } : {}),
    };
  };

  const handleAgencyLogoSelection = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Agency image must be 5 MiB or smaller.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Choose a JPEG, PNG, or WebP image.");
      return;
    }

    setPendingAgencyLogo({
      file,
      previewUrl: URL.createObjectURL(file),
    });
    toast.success("Image selected. Save the draft or submit for approval to upload it.");
  };

  const uploadPendingAgencyLogo = async (): Promise<void> => {
    if (!pendingAgencyLogo) {
      return;
    }

    setIsUploadingLogo(true);
    try {
      const updatedAgency = await uploadMyAgencyLogoApi(pendingAgencyLogo.file);
      setAgency(updatedAgency);
      setPendingAgencyLogo(null);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    console.log("[AgencyPage] handleSave started", {
      hasAgency: !!agency,
      agencyName: agency?.name,
      agencySlug: agency?.slug,
      agencyStatus: agency?.status,
    });

    if (!agency) {
      console.warn("[AgencyPage] handleSave aborted: agency is missing");
      return;
    }

    if (!validateRequiredFields()) {
      return;
    }

    setProfileNameError("");
    setSlugError("");
    setPincodeError("");
    setCityError("");
    setStateError("");
    setCountryError("");
    setPhoneError("");
    setEmailError("");
    setWebsiteError("");
    setIsSaving(true);
    setError(null);
    try {
      await uploadPendingAgencyLogo();
      const payload = buildUpdatePayload(agency);
      console.log("[AgencyPage] updateMyAgencyApi payload", payload);
      const updated = await updateMyAgencyApi(payload);
      console.log("[AgencyPage] updateMyAgencyApi success", updated);
      setAgency(updated);
      toast.success("Draft saved successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save draft.";
      console.error("[AgencyPage] updateMyAgencyApi failed", err);
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!agency) return;

    if (!validateRequiredFields()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await uploadPendingAgencyLogo();
      const payload = buildUpdatePayload(agency);
      const submitted = await submitMyAgencyApi(payload);
      setAgency(submitted);
      toast.success("Submitted for approval.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit for approval.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAgency = async () => {
    if (!agencyName.trim()) {
      setAgencyNameError("Agency name is required.");
      return;
    }
    setAgencyNameError("");
    setIsCreating(true);
    setError(null);
    try {
      const created = await createMyAgencyApi(agencyName.trim());
      setAgency(created);
      toast.success("Agency profile created.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create agency profile.";
      setError(message);
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const renderProfile = () => {
    if (isLoading) {
      return (
        <PageStack>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-16" />
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-3 pt-2 md:flex-row md:justify-end">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-48" />
          </div>
        </PageStack>
      );
    }

    if (!agency) {
      return (
        <PageStack>
          {error && <p role="alert" className="text-body-sm text-destructive">{error}</p>}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Agency Profile</h1>
            <p className="text-sm text-muted-foreground">Create your agency profile to get started.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Agency Profile</CardTitle>
              <CardDescription>Enter your agency name to create your profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agency-name">Agency Name<span className="text-destructive">*</span></Label>
                <Input
                  id="agency-name"
                  value={agencyName}
                  onChange={(event) => {
                    setAgencyName(event.target.value.slice(0, 100));
                    if (agencyNameError) setAgencyNameError("");
                  }}
                  onBlur={() => {
                    if (!agencyName.trim()) {
                      setAgencyNameError("Agency name is required.");
                    }
                  }}
                  placeholder="Enter your agency name"
                  maxLength={100}
                  required
                  aria-invalid={!!agencyNameError}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{agencyName.length}/100 characters</p>
                  {agencyNameError && (
                    <p className="text-xs text-destructive">{agencyNameError}</p>
                  )}
                </div>
              </div>
              <Button onClick={handleCreateAgency} disabled={isCreating || !agencyName.trim()} className="md:w-48">
                {isCreating ? <Spinner label="Creating agency" size="sm" className="mr-2" /> : null}
                Create Agency Profile
              </Button>
            </CardContent>
          </Card>
        </PageStack>
      );
    }

    return (
      <div className="grid gap-6 pb-8">
        {error && <p role="alert" className="text-body-sm text-destructive">{error}</p>}
        {agency.status === "pending" && (
          <div
            role="status"
            className="rounded-[5px] border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary"
          >
            <p className="font-medium">Your agency profile is under review</p>
            <p className="mt-1 text-primary/80">
              Thanks for submitting your profile. Our team is reviewing the details now. You will be notified once the review is complete.
            </p>
          </div>
        )}
          <Card size="sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Basic details travellers will see on your public profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-5 rounded-lg border p-5 sm:flex-row sm:items-center">
                <div className="relative size-24 shrink-0 self-center sm:self-auto">
                  <Avatar
                    key={pendingAgencyLogo?.previewUrl ?? agency.logo?.url ?? "agency-logo"}
                    src={pendingAgencyLogo?.previewUrl ?? agency.logo?.url}
                    alt={agency.logo?.altText ?? agency.name}
                    fallback={agency.name.slice(0, 2).toUpperCase()}
                    className="size-24"
                  />
                  <IconButton
                    type="button"
                    variant="default"
                    size="icon-lg"
                    className="absolute -bottom-1 -right-1 rounded-full border-4 border-card shadow-sm"
                    label={agency.logo?.url || pendingAgencyLogo ? "Change agency profile image" : "Add agency profile image"}
                    aria-describedby="agency-logo-help"
                    disabled={
                      agency.status !== "draft" ||
                      isUploadingLogo ||
                      isSaving ||
                      isSubmitting
                    }
                    onClick={() => agencyLogoInputRef.current?.click()}
                  >
                    <Camera aria-hidden="true" />
                  </IconButton>
                  <Input
                    ref={agencyLogoInputRef}
                    id="agency-logo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    tabIndex={-1}
                    disabled={
                      agency.status !== "draft" ||
                      isUploadingLogo ||
                      isSaving ||
                      isSubmitting
                    }
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      event.currentTarget.value = "";
                      if (file) handleAgencyLogoSelection(file);
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1 text-center sm:text-left">
                  <p className="text-sm font-medium leading-none">Agency profile image</p>
                  <p id="agency-logo-help" className="text-sm text-muted-foreground">
                    Click the camera to {agency.logo?.url || pendingAgencyLogo ? "change" : "add"} your image. Use JPEG, PNG, or WebP up to 5 MiB.
                  </p>
                  {isUploadingLogo && (
                    <p className="flex items-center justify-center gap-2 pt-1 text-sm text-muted-foreground sm:justify-start" role="status">
                      <Spinner label="Checking availability" size="sm" />
                      Uploading image to save your profile…
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Agency Name<span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    value={agency.name}
                    onChange={(event) => {
                      updateField("name", event.target.value.slice(0, 100));
                      if (profileNameError) setProfileNameError("");
                    }}
                    onBlur={() => {
                      if (!agency.name.trim()) {
                        setProfileNameError("Agency name is required.");
                      }
                    }}
                    maxLength={100}
                    required
                    aria-invalid={!!profileNameError}
                  />
                  {profileNameError && (
                    <p className="text-xs text-destructive">{profileNameError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Profile URL Slug<span className="text-destructive">*</span></Label>
                  <Input
                    id="slug"
                    value={agency.slug}
                    maxLength={40}
                    onChange={(event) => {
                      const value = event.target.value.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
                      updateField("slug", value);
                      if (slugError) setSlugError("");
                    }}
                    onBlur={() => {
                      const trimmed = agency.slug.trim();
                      if (!trimmed) {
                        setSlugError("Profile URL slug is required.");
                      } else if (trimmed.length < 6) {
                        setSlugError("Slug must be at least 6 characters.");
                      } else if (trimmed.length > 40) {
                        setSlugError("Slug cannot exceed 40 characters.");
                      } else if (!slugRegex.test(trimmed)) {
                        setSlugError("Slug can only contain lowercase letters, numbers, and hyphens.");
                      }
                    }}
                    required
                    aria-invalid={!!slugError}
                  />
                  {slugError && (
                    <p className="text-xs text-destructive">{slugError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Unique slug for your public profile URL. Only lowercase letters, numbers, and hyphens. Min 6, max 40 characters.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About Agency</Label>
                <Textarea
                  id="about"
                  value={agency.about ?? ""}
                  onChange={(event) => updateField("about", event.target.value)}
                  rows={5}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="yearEstablished">Year Established</Label>
                  <YearPickerField
                    value={agency.yearEstablished}
                    onSelect={(year) => updateField("yearEstablished", year)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Where your agency is based and where you operate from.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={safeLocation.address ?? ""}
                  onChange={(event) => updateLocation("address", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={safeLocation.city}
                  onChange={(event) => {
                    const value = event.target.value.replace(/[^A-Za-z\s]/g, "");
                    updateLocation("city", value);
                    if (cityError) setCityError("");
                  }}
                  onBlur={() => {
                    const city = safeLocation.city.trim();
                    if (!city) {
                      setCityError("City is required.");
                    } else if (!alphaRegex.test(city)) {
                      setCityError("City must contain only alphabets.");
                    } else {
                      setCityError("");
                    }
                  }}
                  required
                  aria-invalid={!!cityError}
                />
                {cityError && <p className="text-xs text-destructive">{cityError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={safeLocation.state}
                  onChange={(event) => {
                    const value = event.target.value.replace(/[^A-Za-z\s]/g, "");
                    updateLocation("state", value);
                    if (stateError) setStateError("");
                  }}
                  onBlur={() => {
                    const state = safeLocation.state.trim();
                    if (!state) {
                      setStateError("State is required.");
                    } else if (!alphaRegex.test(state)) {
                      setStateError("State must contain only alphabets.");
                    } else {
                      setStateError("");
                    }
                  }}
                  required
                  aria-invalid={!!stateError}
                />
                {stateError && <p className="text-xs text-destructive">{stateError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={safeLocation.country}
                  onChange={(event) => {
                    const value = event.target.value.replace(/[^A-Za-z\s]/g, "");
                    updateLocation("country", value);
                    if (countryError) setCountryError("");
                  }}
                  onBlur={() => {
                    const country = safeLocation.country.trim();
                    if (!country) {
                      setCountryError("Country is required.");
                    } else if (!alphaRegex.test(country)) {
                      setCountryError("Country must contain only alphabets.");
                    } else {
                      setCountryError("");
                    }
                  }}
                  required
                  aria-invalid={!!countryError}
                />
                {countryError && <p className="text-xs text-destructive">{countryError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={safeLocation.pincode ?? ""}
                  onChange={(event) => {
                    const value = event.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                    updateLocation("pincode", value);
                    if (pincodeError) setPincodeError("");
                  }}
                  onBlur={() => {
                    const pincode = safeLocation.pincode?.trim();
                    if (pincode && !pincodeRegex.test(pincode)) {
                      setPincodeError("Pincode must be exactly 6 digits.");
                    } else {
                      setPincodeError("");
                    }
                  }}
                  maxLength={6}
                />
                {pincodeError && (
                  <p className="text-xs text-destructive">{pincodeError}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
              <CardDescription>Public contact information shown on your agency profile.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Business Phone</Label>
                <Input
                  id="phone"
                  value={safeContact.phone}
                  onChange={(event) => {
                    const value = event.target.value.replace(/[^+\d\s()-]/g, "").slice(0, 20);
                    updateContact("phone", value);
                    if (phoneError) setPhoneError("");
                  }}
                  onBlur={() => {
                    const phone = safeContact.phone.trim();
                    if (!phone) {
                      setPhoneError("");
                    } else if (!phoneRegex.test(phone)) {
                      setPhoneError("Enter a valid phone number with country code, e.g. +91 1234567890.");
                    } else {
                      setPhoneError("");
                    }
                  }}
                  placeholder="+91 1234567890"
                  required
                  aria-invalid={!!phoneError}
                />
                <p className="text-xs text-muted-foreground">Include country code, e.g. +91 1234567890</p>
                {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Business Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={safeContact.email}
                  onChange={(event) => {
                    updateContact("email", event.target.value);
                    if (emailError) setEmailError("");
                  }}
                  onBlur={() => {
                    const email = safeContact.email.trim();
                    if (!email) {
                      setEmailError("");
                    } else if (!emailRegex.test(email)) {
                      setEmailError("Please enter a valid email address.");
                    } else {
                      setEmailError("");
                    }
                  }}
                  required
                  aria-invalid={!!emailError}
                />
                {emailError && <p className="text-xs text-destructive">{emailError}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={safeContact.website ?? ""}
                  onChange={(event) => {
                    updateContact("website", event.target.value);
                    if (websiteError) setWebsiteError("");
                  }}
                  onBlur={() => {
                    const website = safeContact.website?.trim();
                    if (!website) {
                      setWebsiteError("");
                    } else if (!websiteRegex.test(website)) {
                      setWebsiteError("Please enter a valid website URL.");
                    } else {
                      setWebsiteError("");
                    }
                  }}
                  aria-invalid={!!websiteError}
                />
                {websiteError && <p className="text-xs text-destructive">{websiteError}</p>}
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <CardDescription>What your agency offers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label id="services">Services</Label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {AGENCY_SERVICE_OPTIONS.map((option) => {
                    const checked = agency.services.includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 rounded-[5px] border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border text-primary focus-visible:ring-ring"
                          checked={checked}
                          onChange={() => toggleService(option.value)}
                        />
                        <span className="text-foreground">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 pt-2 md:flex-row md:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSave}
              disabled={agency.status !== "draft" || isSaving || isSubmitting || isUploadingLogo}
              className="md:w-40"
            >
              {isSaving ? <Spinner label="Saving agency" size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
              Save Draft
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={agency.status !== "draft" || isSaving || isSubmitting || isUploadingLogo}
              className="md:w-48"
            >
              {isSubmitting ? <Spinner label="Submitting agency" size="sm" className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
              Submit for Approval
            </Button>
          </div>
        </div>
    );
  };

  return (
    <AgencyShell activeTab={activeTab} activeSettingsSubTab={activeSettingsSubTab} onSettingsSubTabChange={setActiveSettingsSubTab}>
      {activeTab === "dashboard"
        ? <AgencyOverview agency={agency} isAgencyLoading={isLoading} />
        : activeTab === "inquiries"
          ? <InquiryInbox agencyId={agency?.id} isAgencyLoading={isLoading} />
        : activeTab === "packages"
          ? <PackagesTab agencyId={agency?.id} />
          : activeTab === "settings"
            ? activeSettingsSubTab === "templates"
              ? <SettingsTemplatesTab />
              : renderProfile()
            : <AgencyOverview agency={agency} isAgencyLoading={isLoading} />}
    </AgencyShell>
  );
}
