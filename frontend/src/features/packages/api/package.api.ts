import { apiClient } from "@/lib/api";
import type {
  TravelPackage,
  CreatePackageInput,
  UpdatePackageInput,
  UpdatePackageStatusInput,
  PackageListResponse,
  PackageListFilters,
  PackageImage,
  UploadPackageImagesInput,
  SetPrimaryImageInput,
  ReorderImagesInput,
  PresignedUploadUrlResponse,
} from "@/features/packages/types/package.types";

export async function getPackagesApi(filters?: PackageListFilters & { agencyId?: string }): Promise<PackageListResponse> {
  const query = filters ? { ...filters, agencyId: filters.agencyId } : undefined;
  const response = await apiClient.get<{ success: true; data: PackageListResponse }>("/packages", {
    query,
  });
  return response.data;
}

export async function getUpcomingPackagesApi(agencyId?: string): Promise<{ items: TravelPackage[] }> {
  const response = await apiClient.get<{ success: true; data: { items: TravelPackage[] } }>("/packages/upcoming", {
    query: agencyId ? { agencyId } : undefined,
  });
  return response.data;
}

export async function getCurrentPackagesApi(agencyId?: string): Promise<{ items: TravelPackage[] }> {
  const response = await apiClient.get<{ success: true; data: { items: TravelPackage[] } }>("/packages/current", {
    query: agencyId ? { agencyId } : undefined,
  });
  return response.data;
}

export async function getHistoryPackagesApi(agencyId?: string): Promise<{ items: TravelPackage[] }> {
  const response = await apiClient.get<{ success: true; data: { items: TravelPackage[] } }>("/packages/history", {
    query: agencyId ? { agencyId } : undefined,
  });
  return response.data;
}

export async function getPackageByIdApi(id: string): Promise<{ package: TravelPackage }> {
  const response = await apiClient.get<{ success: true; data: { package: TravelPackage } }>(`/packages/${encodeURIComponent(id)}`);
  return response.data;
}

export async function createPackageApi(data: CreatePackageInput, agencyId?: string): Promise<{ package: TravelPackage }> {
  const response = await apiClient.post<{ success: true; data: { package: TravelPackage } }>("/packages", {
    query: agencyId ? { agencyId } : undefined,
    body: data,
  });
  return response.data;
}

export async function updatePackageApi(id: string, data: UpdatePackageInput): Promise<{ package: TravelPackage }> {
  const response = await apiClient.patch<{ success: true; data: { package: TravelPackage } }>(`/packages/${encodeURIComponent(id)}`, {
    body: data,
  });
  return response.data;
}

export async function updatePackageStatusApi(id: string, data: UpdatePackageStatusInput): Promise<{ package: TravelPackage }> {
  const response = await apiClient.patch<{ success: true; data: { package: TravelPackage } }>(`/packages/${encodeURIComponent(id)}/status`, {
    body: data,
  });
  return response.data;
}

export async function deletePackageApi(id: string): Promise<void> {
  await apiClient.delete(`/packages/${encodeURIComponent(id)}`);
}

export async function uploadPackageImagesApi(packageId: string, data: UploadPackageImagesInput): Promise<{ package: TravelPackage }> {
  const response = await apiClient.post<{ success: true; data: { package: TravelPackage } }>(`/packages/${encodeURIComponent(packageId)}/images`, {
    body: data,
  });
  return response.data;
}

export async function deletePackageImageApi(packageId: string, imageKey: string): Promise<{ package: TravelPackage }> {
  const response = await apiClient.delete<{ success: true; data: { package: TravelPackage } }>(`/packages/${encodeURIComponent(packageId)}/images/${encodeURIComponent(imageKey)}`);
  return response.data;
}

export async function setPrimaryImageApi(packageId: string, data: SetPrimaryImageInput): Promise<{ package: TravelPackage }> {
  const response = await apiClient.patch<{ success: true; data: { package: TravelPackage } }>(`/packages/${encodeURIComponent(packageId)}/images/${encodeURIComponent(data.imageId)}/primary`, {
    body: data,
  });
  return response.data;
}

export async function reorderImagesApi(packageId: string, data: ReorderImagesInput): Promise<{ package: TravelPackage }> {
  const response = await apiClient.patch<{ success: true; data: { package: TravelPackage } }>(`/packages/${encodeURIComponent(packageId)}/images/reorder`, {
    body: data,
  });
  return response.data;
}

export async function getPresignedUploadUrlApi(packageId: string, mimeType: string, fileName: string): Promise<PresignedUploadUrlResponse> {
  const response = await apiClient.get<{ success: true; data: PresignedUploadUrlResponse }>(`/packages/${encodeURIComponent(packageId)}/images/presigned-url`, {
    query: { mimeType, fileName },
  });
  return response.data;
}

export async function uploadFileToPresignedUrl(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
}