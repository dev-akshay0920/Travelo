import { Types } from "mongoose";
import { AuditLogModel } from "./audit.model";
import type { AuditLogDocument } from "./audit.model";
import type { AuditLogListQuery } from "./audit.types";

export const auditRepository = {
  async create(data: {
    agencyId: Types.ObjectId;
    userId?: Types.ObjectId;
    action: AuditLogDocument["action"];
    entityType: string;
    entityId: Types.ObjectId;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<AuditLogDocument> {
    const log = new AuditLogModel({
      agencyId: data.agencyId,
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      oldValues: data.oldValues,
      newValues: data.newValues,
      metadata: data.metadata,
    });
    return log.save();
  },

  async list(
    agencyId: Types.ObjectId,
    query: AuditLogListQuery
  ): Promise<{
    items: AuditLogDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 50, action, entityType, userId } = query;

    const filter: Record<string, unknown> = { agencyId };
    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;
    if (userId) filter.userId = new Types.ObjectId(userId);

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      AuditLogModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      AuditLogModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as AuditLogDocument[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
};
