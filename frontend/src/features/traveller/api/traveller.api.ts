import { apiClient } from "@/lib/api";

export interface TravellerProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}

interface ProfileResponse {
  success: true;
  data: { profile: TravellerProfile };
}

export async function getMyTravellerProfileApi(): Promise<TravellerProfile> {
  const response = await apiClient.get<ProfileResponse>("/users/me");
  return response.data.profile;
}

export async function updateMyTravellerProfileApi(name: string): Promise<TravellerProfile> {
  const response = await apiClient.patch<ProfileResponse>("/users/me", {
    body: { name },
  });
  return response.data.profile;
}
