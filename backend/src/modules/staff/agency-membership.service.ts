import { Types } from "mongoose";
import { ForbiddenError, NotFoundError } from "../../shared/errors/app-error";
import { AgencyRepository } from "../agencies/agency.repository";
import type { AgencyDocument } from "../agencies/agency.model";
import { getPermissionsForRole } from "./role-permissions";
import { staffRepository } from "./staff.repository";
import type { StaffRole } from "./staff.model";

export interface AgencyMembership {
  agency: AgencyDocument;
  role: StaffRole;
  isOwner: boolean;
  permissions: string[];
}

/**
 * Resolves the agency a user belongs to.
 *
 * An agency owner owns exactly one agency, other users belong to an agency
 * through an active `StaffMember` record.
 */
export const resolveAgencyMembership = async (userId: string): Promise<AgencyMembership> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ForbiddenError("Agency access is required.");
  }

  const ownedAgency = await AgencyRepository.findByOwnerUserId(userId);
  if (ownedAgency) {
    return {
      agency: ownedAgency,
      role: "owner",
      isOwner: true,
      permissions: getPermissionsForRole("owner"),
    };
  }

  const staff = await staffRepository.findActiveByUserId(new Types.ObjectId(userId));
  if (!staff) {
    throw new ForbiddenError("Agency access is required.");
  }

  return {
    agency: (await AgencyRepository.findById(String(staff.agencyId))) as AgencyDocument,
    role: staff.role,
    isOwner: staff.role === "owner",
    permissions:
      staff.permissions && staff.permissions.length > 0
        ? staff.permissions
        : getPermissionsForRole(staff.role),
  };
};

export const requireAgencyMember = async (userId: string): Promise<AgencyMembership> =>
  resolveAgencyMembership(userId);

export const requireAgencyOwner = async (userId: string): Promise<AgencyMembership> => {
  const membership = await resolveAgencyMembership(userId);
  if (!membership.isOwner) {
    throw new ForbiddenError("Agency owner access is required.");
  }
  return membership;
};

export const requireAgencyOwnerDocument = async (userId: string): Promise<AgencyDocument> => {
  const membership = await requireAgencyOwner(userId);
  return membership.agency;
};

export const requireAgencyMemberDocument = async (userId: string): Promise<AgencyDocument> => {
  const membership = await requireAgencyMember(userId);
  if (!membership.agency) {
    throw new NotFoundError("Agency profile not found.");
  }
  return membership.agency;
};
