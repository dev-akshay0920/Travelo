import { Types } from "mongoose";
import crypto from "crypto";
import { staffRepository } from "./staff.repository";
import { UserRepository } from "../users/user.repository";
import { RoleRepository } from "../roles/role.repository";
import type { StaffRole } from "./staff.model";
import type { CreateStaffInput, UpdateStaffInput, StaffListQuery, StaffDTO, StaffListResponse } from "./staff.types";
import { toStaffDTO } from "./staff.types";
import { getPermissionsForRole } from "./role-permissions";
import { AppError } from "../../shared/errors/app-error";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ERROR_CODES } from "../../shared/constants/error-codes";

export class StaffService {
  async create(agencyId: Types.ObjectId, userId: Types.ObjectId, input: CreateStaffInput): Promise<StaffDTO> {
    const existing = await staffRepository.findByUserIdAndAgency(new Types.ObjectId(input.userId), agencyId);
    if (existing) {
      throw new AppError("User is already a staff member", HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT);
    }

    const data = {
      ...input,
      agencyId,
      userId: new Types.ObjectId(input.userId),
      permissions: input.permissions || getPermissionsForRole(input.role),
      invitedBy: userId,
    };

    const staff = await staffRepository.create(data);
    return toStaffDTO(staff);
  }

  async invite(
    agencyId: Types.ObjectId,
    actorId: Types.ObjectId,
    input: { email: string; role?: StaffRole; permissions?: string[]; commissionRate?: number }
  ): Promise<{ staff: StaffDTO; invitationToken: string }> {
    const email = input.email.trim().toLowerCase();
    const role = input.role ?? "agent";

    let user = await UserRepository.findByEmail(email);
    if (!user) {
      const agencyRole = await RoleRepository.findByKey("agency");
      if (!agencyRole) {
        throw new AppError(
          "Agency role is not configured",
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.INTERNAL_SERVER_ERROR
        );
      }
      user = await UserRepository.create({
        roleId: agencyRole._id,
        name: email.split("@")[0] ?? "user",
        email,
        status: "pending",
      });
    }

    const existing = await staffRepository.findByUserIdAndAgency(new Types.ObjectId(user._id), agencyId);
    if (existing) {
      throw new AppError(
        "User is already a staff member of this agency",
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.CONFLICT
      );
    }

    const staff = await staffRepository.create({
      agencyId,
      userId: new Types.ObjectId(user._id),
      role,
      permissions: input.permissions || getPermissionsForRole(role),
      isActive: false,
      invitedBy: actorId,
      commissionRate: input.commissionRate ?? 0,
    });

    const invitationToken = crypto.randomBytes(32).toString("hex");
    return {
      staff: toStaffDTO(staff, user.name, user.email),
      invitationToken,
    };
  }

  async getById(id: string, agencyId: Types.ObjectId): Promise<StaffDTO> {
    const staff = await staffRepository.findByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!staff) {
      throw new AppError("Staff member not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toStaffDTO(staff);
  }

  async update(id: string, agencyId: Types.ObjectId, input: UpdateStaffInput): Promise<StaffDTO> {
    const staff = await staffRepository.updateByIdAndAgency(new Types.ObjectId(id), agencyId, input);
    if (!staff) {
      throw new AppError("Staff member not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
    return toStaffDTO(staff);
  }

  async delete(id: string, agencyId: Types.ObjectId): Promise<void> {
    const deleted = await staffRepository.deleteByIdAndAgency(new Types.ObjectId(id), agencyId);
    if (!deleted) {
      throw new AppError("Staff member not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }
  }

  async list(agencyId: Types.ObjectId, query: StaffListQuery): Promise<StaffListResponse> {
    const result = await staffRepository.listByAgency(agencyId, query);
    return {
      items: result.items.map((doc) => toStaffDTO(doc)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getByRole(agencyId: Types.ObjectId, role: StaffRole): Promise<StaffDTO[]> {
    const staff = await staffRepository.getByRole(agencyId, role);
    return staff.map((doc) => toStaffDTO(doc));
  }

  async countByRole(agencyId: Types.ObjectId): Promise<Record<string, number>> {
    return staffRepository.countByRole(agencyId);
  }
}

export const staffService = new StaffService();