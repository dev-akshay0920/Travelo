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

export interface TravellerBooking {
  id: string;
  bookingNumber: string;
  status: string;
  totalPrice: number;
  paidAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  departureDate: string;
  voucherUrl?: string;
  voucherKey?: string;
  travellers: Array<{
    name: string;
    email?: string;
    phone?: string;
  }>;
}

export interface BookingsResponse {
  items: TravellerBooking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TravellerInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  paidAmount: number;
  currency: string;
  type: string;
  dueDate?: string;
  createdAt: string;
}

export interface InvoicesResponse {
  items: TravellerInvoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BookingsDataResponse {
  success: true;
  data: { bookings: BookingsResponse };
}

interface InvoicesDataResponse {
  success: true;
  data: { invoices: InvoicesResponse };
}

export interface TravellerBookingsQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface TravellerInvoicesQuery {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
}

export async function listMyBookingsApi(query: TravellerBookingsQuery = {}): Promise<BookingsResponse> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.status) params.set("status", query.status);
  if (query.search) params.set("search", query.search);

  const response = await apiClient.get<BookingsDataResponse>(`/bookings/me?${params.toString()}`);
  return response.data.bookings;
}

export async function listMyInvoicesApi(query: TravellerInvoicesQuery = {}): Promise<InvoicesResponse> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.status) params.set("status", query.status);
  if (query.type) params.set("type", query.type);
  if (query.search) params.set("search", query.search);

  const response = await apiClient.get<InvoicesDataResponse>(`/invoices/me?${params.toString()}`);
  return response.data.invoices;
}
