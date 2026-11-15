import { Types } from "mongoose";
import { StaffModel } from "./staff.model";
import type { StaffDocument } from "./staff.model";
import type { StaffListQuery, StaffRole } from "./staff.types";
import { getPermissionsForRole } from "./role-permissions";

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

export class StaffRepository {
  async create(data: {
    agencyId: Types.ObjectId;
    userId: Types.ObjectId;
    role: StaffRole;
    permissions?: string[];
    isActive?: boolean;
    invitedBy?: Types.ObjectId;
  }): Promise<StaffDocument> {
    const staff = new StaffModel({
      ...data,
      agencyId: data.agencyId,
      userId: data.userId,
      role: data.role,
      permissions: data.permissions || getPermissionsForRole(data.role),
      isActive: data.isActive ?? true,
      invitedBy: data.invitedBy,
      joinedAt: new Date(),
    });
    return staff.save();
  }

  async findByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<StaffDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return StaffModel.findOne({ _id: id, agencyId }).exec();
  }

  async findByUserIdAndAgency(userId: Types.ObjectId, agencyId: Types.ObjectId): Promise<StaffDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return StaffModel.findOne({ userId, agencyId }).exec();
  }

  async updateByIdAndAgency(
    id: Types.ObjectId,
    agencyId: Types.ObjectId,
    data: Partial<{
      role: StaffRole;
      permissions: string[];
      isActive: boolean;
    }>
  ): Promise<StaffDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return StaffModel.findOneAndUpdate({ _id: id, agencyId }, { $set: data }, { new: true }).exec();
  }

  async deleteByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<boolean> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await StaffModel.deleteOne({ _id: id, agencyId }).exec();
    return result.deletedCount === 1;
  }

  async listByAgency(agencyId: Types.ObjectId, query: StaffListQuery): Promise<{
    items: StaffLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search, role, isActive, sortBy = "createdAt", sortOrder = "desc" } = query;

    const filter: Record<string, unknown> = { agencyId };
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;
    if (search) {
      filter.$or = [];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      StaffModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      StaffModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as StaffLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getByRole(agencyId: Types.ObjectId, role: StaffRole): Promise<StaffLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return StaffModel.find({ agencyId, role, isActive: true }).lean().exec();
  }

  async countByRole(agencyId: Types.ObjectId): Promise<Record<string, number>> {
    const result = await StaffModel.aggregate([
      { $match: { agencyId, isActive: true } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]).exec();
    return result.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});
  }
}

export const staffRepository = new StaffRepository();