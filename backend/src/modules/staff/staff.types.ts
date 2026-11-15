import type { StaffDocument } from "./staff.model";
import { Types } from "mongoose";

export type StaffRole = "owner" | "admin" | "manager" | "agent" | "accountant" | "viewer";

export interface CreateStaffInput {
  userId: string;
  role: StaffRole;
  permissions?: string[];
  isActive?: boolean;
}

export interface UpdateStaffInput {
  role?: StaffRole;
  permissions?: string[];
  isActive?: boolean;
}

export interface StaffListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: StaffRole;
  isActive?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "role" | "joinedAt";
  sortOrder?: "asc" | "desc";
}

export interface StaffListResponse {
  items: StaffDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StaffDTO {
  id: string;
  agencyId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  role: StaffRole;
  permissions: string[];
  isActive: boolean;
  invitedBy?: string;
  joinedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface StaffLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  userId: Types.ObjectId;
  role: StaffRole;
  permissions: string[];
  isActive: boolean;
  invitedBy?: Types.ObjectId;
  joinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function toStaffDTO(doc: StaffDocument | StaffLean, userName?: string, userEmail?: string): StaffDTO {
  return {
    id: doc._id.toString(),
    agencyId: doc.agencyId.toString(),
    userId: doc.userId.toString(),
    userName,
    userEmail,
    role: doc.role,
    permissions: doc.permissions,
    isActive: doc.isActive,
    invitedBy: doc.invitedBy?.toString(),
    joinedAt: doc.joinedAt?.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}