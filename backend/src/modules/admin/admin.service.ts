import { Types } from "mongoose";
import { AgencyRepository } from "../agencies/agency.repository";
import { UserRepository } from "../users/user.repository";
import type {
  AgencyListItem,
  AgencyListQuery,
  UpdateAgencyStatusInput,
  UserListItem,
  UserListQuery,
  UpdateUserStatusInput,
} from "./admin.types";

function toAgencyListItem(agency: {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  status: string;
  ownerUserId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}): AgencyListItem {
  return {
    id: String(agency._id),
    name: agency.name,
    slug: agency.slug,
    status: agency.status as AgencyListItem["status"],
    ownerUserId: String(agency.ownerUserId),
    createdAt: agency.createdAt.toISOString(),
    updatedAt: agency.updatedAt.toISOString(),
  };
}

function toUserListItem(user: {
  _id: Types.ObjectId;
  name: string;
  email: string;
  roleId:
    | Types.ObjectId
    | ({ key?: string | null; name?: string | null } | null)
    | undefined;
  status: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}): UserListItem {
  const roleId = user.roleId as { key?: string | null; name?: string | null } | undefined;
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    roleKey: roleId?.key ?? "",
    roleName: roleId?.name ?? undefined,
    status: user.status as UserListItem["status"],
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export const adminService = {
  async listAgencies(query: AgencyListQuery) {
    const result = await AgencyRepository.listAll(query);
    return {
      items: result.items.map(toAgencyListItem),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  },

  async getAgency(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const agency = await AgencyRepository.findById(id);
    if (!agency) {
      return null;
    }
    return toAgencyListItem(agency);
  },

  async updateAgencyStatus(id: string, input: UpdateAgencyStatusInput) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const updated = await AgencyRepository.updateStatus(id, input.status);
    if (!updated) {
      return null;
    }
    return toAgencyListItem(updated);
  },

  async listUsers(query: UserListQuery) {
    const result = await UserRepository.listAll(query);
    return {
      items: result.items.map(toUserListItem),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  },

  async getUser(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const user = await UserRepository.findByIdWithRole(id);
    if (!user) {
      return null;
    }
    return toUserListItem(user);
  },

  async updateUserStatus(id: string, input: UpdateUserStatusInput) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const updated = await UserRepository.updateStatus(id, input.status);
    if (!updated) {
      return null;
    }
    return toUserListItem(updated);
  },
};
