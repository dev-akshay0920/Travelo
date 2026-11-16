import type { AgencyStatus } from "../agencies/agency.model";
import type { UserStatus } from "../users/user.model";

export type PlatformRole = "admin";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PagedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface AgencyListItem {
  id: string;
  name: string;
  slug: string;
  status: AgencyStatus;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgencyListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: AgencyStatus;
}

export interface UpdateAgencyStatusInput {
  status: AgencyStatus;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  roleKey: string;
  roleName?: string;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
}

export interface UpdateUserStatusInput {
  status: UserStatus;
}
