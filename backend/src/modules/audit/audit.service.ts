import type { Types } from "mongoose";
import { auditRepository } from "./audit.repository";
import type { AuditLogListQuery } from "./audit.types";
import type { AuditLogDocument } from "./audit.model";

export const auditService = {
  async logStatusChange(
    agencyId: Types.ObjectId,
    userId: Types.ObjectId | undefined,
    action: AuditLogDocument["action"],
    entityType: string,
    entityId: Types.ObjectId,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>
  ) {
    return auditRepository.create({
      agencyId,
      userId,
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
    });
  },

  async logPayment(
    agencyId: Types.ObjectId,
    userId: Types.ObjectId | undefined,
    entityId: Types.ObjectId,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>
  ) {
    return auditRepository.create({
      agencyId,
      userId,
      action: "payment_recorded",
      entityType: "payment",
      entityId,
      oldValues,
      newValues,
    });
  },

  async logStaffRoleChange(
    agencyId: Types.ObjectId,
    userId: Types.ObjectId | undefined,
    entityId: Types.ObjectId,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>
  ) {
    return auditRepository.create({
      agencyId,
      userId,
      action: "staff_role_changed",
      entityType: "staff",
      entityId,
      oldValues,
      newValues,
    });
  },

  async list(
    agencyId: Types.ObjectId,
    query: AuditLogListQuery
  ) {
    return auditRepository.list(agencyId, query);
  },
};
