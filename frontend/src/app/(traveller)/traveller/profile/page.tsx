"use client";

import { useEffect, useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageStack } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDisplayDate } from "@/lib/date-format";
import {
  getMyTravellerProfileApi,
  updateMyTravellerProfileApi,
} from "@/features/traveller/api/traveller.api";
import type { TravellerProfile } from "@/features/traveller/api/traveller.api";

export default function TravellerProfilePage() {
  const [profileResult, setProfileResult] = useState<{
    attempt: number;
    profile?: TravellerProfile;
    error?: string;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [draft, setDraft] = useState<{ profileId: string; name: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getMyTravellerProfileApi()
      .then((profile) => {
        if (!cancelled) setProfileResult({ attempt, profile });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setProfileResult({
            attempt,
            error: error instanceof Error && error.message
              ? error.message
              : "Could not load your profile.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const currentResult = profileResult?.attempt === attempt ? profileResult : null;
  const profile = currentResult?.profile;
  const name = profile && draft?.profileId === profile.id ? draft.name : profile?.name ?? "";

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;
    const normalizedName = name.trim();
    if (!normalizedName || normalizedName.length > 100) {
      setSaveError("Name must be between 1 and 100 characters.");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    try {
      const updatedProfile = await updateMyTravellerProfileApi(normalizedName);
      setProfileResult({ attempt, profile: updatedProfile });
      setDraft(null);
    } catch (error) {
      setSaveError(error instanceof Error && error.message ? error.message : "Could not save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const retry = () => {
    setProfileResult(null);
    setAttempt((current) => current + 1);
  };

  if (!currentResult) {
    return (
      <PageStack>
        <PageHeader title="My profile" description="Manage the account details used for your traveler inquiries." />
        <LoadingState />
      </PageStack>
    );
  }

  if (currentResult.error || !profile) {
    return (
      <PageStack>
        <PageHeader title="My profile" description="Manage the account details used for your traveler inquiries." />
        <ErrorState
          title="Profile unavailable"
          description={currentResult.error ?? "Could not load your profile."}
          action={<Button type="button" variant="outline" onClick={retry}>Try again</Button>}
        />
      </PageStack>
    );
  }

  const isEditing = draft?.profileId === profile.id;

  return (
    <PageStack>
      <PageHeader
        title="My profile"
        description="Manage the account details used for your traveler inquiries."
      />

      <Card size="sm">
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>
            Your account email is used for inquiry follow-up and can’t be changed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={(event) => void saveProfile(event)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="traveler-profile-name">Name</Label>
                <Input
                  id="traveler-profile-name"
                  autoComplete="name"
                  maxLength={100}
                  required
                  value={name}
                  disabled={!isEditing || isSaving}
                  onChange={(event) => {
                    setDraft({ profileId: profile.id, name: event.target.value });
                    setSaveError("");
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="traveler-profile-email">Account email</Label>
                <Input
                  id="traveler-profile-email"
                  type="email"
                  autoComplete="email"
                  value={profile.email}
                  readOnly
                  disabled
                />
                <p className="text-caption text-muted-foreground" role="status">
                  {profile.emailVerified ? "Email verified" : "Email not verified"}
                </p>
              </div>
            </div>

            <p className="text-caption text-muted-foreground">
              Member since {formatDisplayDate(profile.createdAt, "Date unavailable")}.
              Only your name is editable here. Sensitive personal details are not collected.
            </p>

            {saveError && <p className="text-body-sm text-destructive" role="alert">{saveError}</p>}

            <div className="flex flex-wrap gap-2">
              {!isEditing ? (
                <Button type="button" variant="outline" onClick={() => setDraft({ profileId: profile.id, name: profile.name })}>
                  Edit name
                </Button>
              ) : (
                <>
                  <Button type="submit" disabled={isSaving || !name.trim() || name.trim() === profile.name}>
                    {isSaving ? "Saving..." : "Save changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    onClick={() => {
                      setDraft(null);
                      setSaveError("");
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </PageStack>
  );
}
