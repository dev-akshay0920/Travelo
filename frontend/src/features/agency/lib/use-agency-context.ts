"use client";

import { useCallback, useEffect, useState } from "react";

import { getMyAgencyApi } from "@/features/agencies/api/agency.api";
import type { AgencyProfile } from "@/features/agencies/types/agency.types";

export interface StoredAgencyUser {
  id?: string;
  name?: string;
  email?: string;
  role?: { key?: string; name?: string };
}

export function getStoredAgencyUser(): StoredAgencyUser | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem("travora_user");
    if (!stored) return null;
    return JSON.parse(stored) as StoredAgencyUser;
  } catch {
    return null;
  }
}

export function useAgencyContext() {
  const [agency, setAgency] = useState<AgencyProfile | null>(null);
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const stored = getStoredAgencyUser();
    if (stored?.id) setUserId(stored.id);
    try {
      const profile = await getMyAgencyApi();
      setAgency(profile);
      if (profile.ownerUserId) setUserId((current) => current || profile.ownerUserId);
    } catch {
      setAgency(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  return {
    agency,
    agencyId: agency?.id ?? "",
    userId,
    isLoading,
    reload,
  };
}
