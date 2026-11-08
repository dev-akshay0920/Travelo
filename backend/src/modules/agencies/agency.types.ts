export type AgencyService =
  | "tour_packages"
  | "flight_booking"
  | "hotel_booking"
  | "honeymoon_trips"
  | "family_holidays"
  | "adventure_trips"
  | "pilgrimage_tours"
  | "corporate_travel"
  | "visa_assistance"
  | "international_tours"
  | "domestic_tours";

export type AgencyStatus = "draft" | "pending" | "approved" | "rejected" | "suspended";

export interface AgencyLocation {
  country: string;
  state: string;
  city: string;
  address?: string;
  pincode?: string;
}

export interface AgencyContact {
  phone: string;
  email: string;
  website?: string;
}

export interface AgencyLogo {
  url: string;
  key?: string;
  altText?: string;
}

export interface AgencyProfile {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  logo: AgencyLogo | null;
  about?: string;
  yearEstablished?: number;
  location: AgencyLocation;
  contact: AgencyContact;
  services: AgencyService[];
  status: AgencyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAgencyInput {
  name?: string;
  about?: string;
  yearEstablished?: number;
  location?: Partial<AgencyLocation>;
  contact?: Partial<AgencyContact>;
  services?: AgencyService[];
}

export interface SubmitAgencyInput {
  action: "submit";
  name?: string;
  slug?: string;
  about?: string;
  yearEstablished?: number;
  location?: {
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    pincode?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  services?: string[];
}
