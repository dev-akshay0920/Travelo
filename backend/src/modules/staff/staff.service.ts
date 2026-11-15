import { Types } from "mongoose";
import { staffRepository } from "./staff.repository";
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

  async getByRole(agencyId: Types.ObjectId, role: string): Promise<StaffDTO[]> {
    const staff = await staffRepository.getByRole(agencyId, role as any);
    return staff.map((doc) => toStaffDTO(doc));
  }

  async countByRole(agencyId: Types.ObjectId): Promise<Record<string, number>> {
    return staffRepository.countByRole(agencyId);
  }
}

export const staffService = new StaffService();