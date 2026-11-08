export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  role: "traveller" | "agency";
  agencyName?: string;
}

export interface SignUpResponse {
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
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInResponse {
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
}
