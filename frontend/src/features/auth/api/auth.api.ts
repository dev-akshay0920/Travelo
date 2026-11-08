import { apiClient } from "@/lib/api";

export type SignUpApiPayload = {
  name: string;
  email: string;
  password: string;
  role: "traveller" | "agency";
  agencyName?: string;
};

export type SignUpApiResponse = {
  success: true;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: {
        key: string;
        name: string;
      };
    };
    agency?: {
      id: string;
      name: string;
      slug: string;
      status: string;
    };
  };
};

export async function signUpApi(payload: SignUpApiPayload): Promise<SignUpApiResponse> {
  const response = await apiClient.post<SignUpApiResponse>("/auth/signup", {
    body: payload,
  });
  return response;
}

export type SignInApiPayload = {
  email: string;
  password: string;
};

export type SignInApiResponse = {
  success: true;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: {
        key: string;
        name: string;
      };
    };
    agency?: {
      id: string;
    };
    accessToken: string;
  };
};

export async function signInApi(payload: SignInApiPayload): Promise<SignInApiResponse> {
  const response = await apiClient.post<SignInApiResponse>("/auth/signin", {
    body: payload,
  });
  return response;
}
