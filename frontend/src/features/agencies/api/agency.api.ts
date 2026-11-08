import { apiClient } from "@/lib/api";
import type {
  AgencyProfile,
  UpdateAgencyInput,
  SubmitAgencyInput,
} from "@/features/agencies/types/agency.types";

export async function getMyAgencyApi(): Promise<AgencyProfile> {
  const response = await apiClient.get<{ success: true; data: { agency: AgencyProfile } }>("/agencies/me");
  return response.data.agency;
}

export async function createMyAgencyApi(name: string): Promise<AgencyProfile> {
  const response = await apiClient.post<{ success: true; data: { agency: AgencyProfile } }>("/agencies/me", {
    body: { name },
  });
  return response.data.agency;
}

export async function updateMyAgencyApi(
  data: UpdateAgencyInput
): Promise<AgencyProfile> {
  const response = await apiClient.patch<{ success: true; data: { agency: AgencyProfile } }>("/agencies/me", { body: data });
  return response.data.agency;
}

export async function uploadMyAgencyLogoApi(file: File): Promise<AgencyProfile> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<{ success: true; data: { agency: AgencyProfile } }>(
    "/agencies/me/logo",
    { body: formData },
  );
  return response.data.agency;
}

export async function submitMyAgencyApi(data: UpdateAgencyInput): Promise<AgencyProfile> {
  const response = await apiClient.post<{ success: true; data: { agency: AgencyProfile } }>("/agencies/me/submit", {
    body: { ...data, action: "submit" } as SubmitAgencyInput,
  });
  return response.data.agency;
}

export async function getPublicAgencyApi(slug: string): Promise<AgencyProfile> {
  const response = await apiClient.get<{ success: true; data: { agency: AgencyProfile } }>(`/agencies/${encodeURIComponent(slug)}`);
  return response.data.agency;
}

export async function checkSlugAvailabilityApi(slug: string, excludeAgencyId?: string): Promise<{ available: boolean; slug: string }> {
  const params = new URLSearchParams({ slug });
  if (excludeAgencyId) {
    params.set("excludeAgencyId", excludeAgencyId);
  }
  const response = await apiClient.get<{ success: true; data: { available: boolean; slug: string } }>(`/agencies/slug/check?${params.toString()}`);
  return response.data;
}
