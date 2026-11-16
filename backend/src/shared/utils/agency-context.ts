import type { Request } from "express";
import { Types } from "mongoose";
import { ForbiddenError } from "../errors/app-error";

export interface AgencyRequestContext {
  agencyId: Types.ObjectId;
  staffRole?: string;
  permissions: string[];
}

/**
 * Resolves the agency scope for the authenticated user.
 *
 * The JWT carries `agencyId` for agency owners and for staff members attached
 * to an agency. Tokens without an agency context (travellers, platform admins)
 * must never reach agency scoped resources.
 */
export const resolveAgencyId = (req: Request): Types.ObjectId => {
  const agencyId = req.user?.agencyId;
  if (!agencyId || !Types.ObjectId.isValid(agencyId)) {
    throw new ForbiddenError("This action requires an agency workspace.");
  }
  return new Types.ObjectId(agencyId);
};

export const resolveAgencyContext = (req: Request): AgencyRequestContext => ({
  agencyId: resolveAgencyId(req),
  staffRole: req.user?.staffRole,
  permissions: req.user?.permissions ?? [],
});
