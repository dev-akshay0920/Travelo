import { Types } from "mongoose";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../shared/errors/app-error";
import { AgencyRepository } from "../agencies/agency.repository";
import {
  requireAgencyMemberDocument,
  requireAgencyOwnerDocument,
} from "../staff/agency-membership.service";
import { PackageRepository } from "../packages/package.repository";
import { UserRepository } from "../users/user.repository";

import type { LeadDocument, LeadStatus } from "./lead.model";
import { LeadRepository } from "./lead.repository";
import type {
  BulkImportLeadsInput,
  CreateAgencyLeadInput,
  CreateLeadInput,
  ListLeadsQuery,
  UpdateLeadInput,
} from "./lead.validation";
import type { ListMyLeadsQuery } from "./lead.validation";
import { Package } from "../packages/package.model";

export interface LeadDTO {
  id: string;
  packageId?: string;
  packageName?: string;
  travelerName: string;
  travelerEmail: string;
  travelerPhone?: string;
  message: string;
  requestedStartDate?: string;
  travelerCount?: number;
  status: LeadStatus;
  agencyNote: string;
  pipelineStageId?: string;
  pipelineStage?: { id: string; name: string; color: string; order: number } | null;
  leadSourceId?: string;
  leadSource?: { id: string; name: string } | null;
  assignedStaffId?: string;
  assignedStaff?: { id: string; name: string; email: string } | null;
  estimatedValue?: number;
  probability?: number;
  expectedCloseDate?: string;
  lastFollowUpAt?: string;
  nextFollowUpAt?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatedLeadDTO {
  id: string;
  status: LeadStatus;
  createdAt: string;
}

export interface TravelerLeadDTO {
  id: string;
  agency: { id: string; name: string; slug: string } | null;
  packageId?: string;
  packageName?: string;
  message?: string;
  requestedStartDate?: string;
  travelerCount?: number;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

function toLeadDTO(lead: LeadDocument): LeadDTO {
  return {
    id: String(lead._id),
    ...(lead.packageId ? { packageId: String(lead.packageId) } : {}),
    ...(lead.packageName ? { packageName: lead.packageName } : {}),
    travelerName: lead.travelerName,
    travelerEmail: lead.travelerEmail,
    ...(lead.travelerPhone ? { travelerPhone: lead.travelerPhone } : {}),
    message: lead.message,
    ...(lead.requestedStartDate
      ? { requestedStartDate: lead.requestedStartDate.toISOString().slice(0, 10) }
      : {}),
    ...(lead.travelerCount !== undefined ? { travelerCount: lead.travelerCount } : {}),
    status: lead.status,
    agencyNote: lead.agencyNote,
    ...(lead.pipelineStageId ? { pipelineStageId: String(lead.pipelineStageId) } : {}),
    ...(lead.leadSourceId ? { leadSourceId: String(lead.leadSourceId) } : {}),
    ...(lead.assignedStaffId ? { assignedStaffId: String(lead.assignedStaffId) } : {}),
    ...(lead.estimatedValue !== undefined ? { estimatedValue: lead.estimatedValue } : {}),
    ...(lead.probability !== undefined ? { probability: lead.probability } : {}),
    ...(lead.expectedCloseDate
      ? { expectedCloseDate: lead.expectedCloseDate.toISOString().slice(0, 10) }
      : {}),
    ...(lead.lastFollowUpAt ? { lastFollowUpAt: lead.lastFollowUpAt.toISOString() } : {}),
    ...(lead.nextFollowUpAt ? { nextFollowUpAt: lead.nextFollowUpAt.toISOString() } : {}),
    ...(lead.utmSource ? { utmSource: lead.utmSource } : {}),
    ...(lead.utmMedium ? { utmMedium: lead.utmMedium } : {}),
    ...(lead.utmCampaign ? { utmCampaign: lead.utmCampaign } : {}),
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

async function getActiveUser(userId: string) {
  if (!Types.ObjectId.isValid(userId)) throw new UnauthorizedError();
  const user = await UserRepository.findByIdWithRole(userId);
  if (!user || user.status !== "active") throw new UnauthorizedError();
  return user;
}

async function requireTraveler(userId: string) {
  const user = await getActiveUser(userId);
  if (user.roleId?.key !== "traveller") {
    throw new ForbiddenError("Traveler access is required.");
  }
  return user;
}

async function toTravelerLeadDTO(lead: LeadDocument, includeMessage: boolean): Promise<TravelerLeadDTO> {
  const agencies = await AgencyRepository.findApprovedPublicSummariesByIds([String(lead.agencyId)]);
  const agency = agencies[0] ?? null;
  return {
    id: String(lead._id),
    agency,
    ...(lead.packageId ? { packageId: String(lead.packageId) } : {}),
    ...(lead.packageName ? { packageName: lead.packageName } : {}),
    ...(includeMessage ? { message: lead.message } : {}),
    ...(lead.requestedStartDate
      ? { requestedStartDate: lead.requestedStartDate.toISOString().slice(0, 10) }
      : {}),
    ...(lead.travelerCount !== undefined ? { travelerCount: lead.travelerCount } : {}),
    status: lead.status,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export const LeadService = {
  async create(userId: string, input: CreateLeadInput): Promise<CreatedLeadDTO> {
    const user = await getActiveUser(userId);
    if (user.roleId?.key !== "traveller") {
      throw new ForbiddenError("Traveler access is required.");
    }
    const agency = await AgencyRepository.findById(input.agencyId);
    if (!agency || agency.status !== "approved") {
      throw new NotFoundError("This agency is not available for inquiries.");
    }

    let packageName: string | undefined;
    if (input.packageId) {
      const pkg = await PackageRepository.findById(input.packageId);
      const now = new Date();
      if (
        !pkg ||
        String(pkg.agencyId) !== String(agency._id) ||
        pkg.status !== "active" ||
        pkg.visibility !== "public" ||
        pkg.availableSeats < 1 ||
        pkg.startDate <= now ||
        (pkg.bookingDeadline && pkg.bookingDeadline < now)
      ) {
        throw new NotFoundError("This package is not available for inquiries.");
      }
      packageName = pkg.name;
    }

    const requestedStartDate = input.requestedStartDate
      ? new Date(`${input.requestedStartDate}T00:00:00.000Z`)
      : undefined;
    if (requestedStartDate && requestedStartDate < new Date(new Date().toISOString().slice(0, 10))) {
      throw new ValidationError("Requested travel date cannot be in the past.");
    }

    const lead = await LeadRepository.create({
      agencyId: agency._id,
      ...(input.packageId ? { packageId: new Types.ObjectId(input.packageId) } : {}),
      ...(packageName ? { packageName } : {}),
      travelerId: user._id,
      travelerName: user.name,
      travelerEmail: user.email,
      message: input.message,
      requestedStartDate,
      travelerCount: input.travelerCount,
      status: "new",
      agencyNote: "",
    });
    return {
      id: String(lead._id),
      status: lead.status,
      createdAt: lead.createdAt.toISOString(),
    };
  },

  async createForAgency(userId: string, input: CreateAgencyLeadInput): Promise<LeadDTO> {
    const agency = await requireAgencyMemberDocument(userId);
    let packageName: string | undefined;
    if (input.packageId) {
      const pkg = await PackageRepository.findById(input.packageId);
      if (pkg && String(pkg.agencyId) === String(agency._id)) {
        packageName = pkg.name;
      }
    }

    // Duplicate detection: same email (or phone) within agency, non-deleted.
    const existingDuplicate = await LeadRepository.findDuplicateByAgency(
      String(agency._id),
      input.travelerEmail,
      input.travelerPhone
    );
    if (existingDuplicate) {
      return toLeadDTO(existingDuplicate);
    }

    const lead = await LeadRepository.create({
      agencyId: agency._id,
      ...(input.packageId ? { packageId: new Types.ObjectId(input.packageId) } : {}),
      ...(packageName ? { packageName } : {}),
      travelerId: new Types.ObjectId(userId),
      travelerName: input.travelerName,
      travelerEmail: input.travelerEmail.toLowerCase(),
      ...(input.travelerPhone ? { travelerPhone: input.travelerPhone } : {}),
      message: input.message?.trim() || "Lead added by agency.",
      ...(input.requestedStartDate
        ? { requestedStartDate: new Date(`${input.requestedStartDate}T00:00:00.000Z`) }
        : {}),
      ...(input.travelerCount !== undefined ? { travelerCount: input.travelerCount } : {}),
      status: "new",
      agencyNote: "",
      ...(input.pipelineStageId
        ? { pipelineStageId: new Types.ObjectId(input.pipelineStageId) }
        : {}),
      ...(input.leadSourceId
        ? { leadSourceId: new Types.ObjectId(input.leadSourceId) }
        : {}),
      ...(input.assignedStaffId
        ? { assignedStaffId: new Types.ObjectId(input.assignedStaffId) }
        : {}),
      ...(input.estimatedValue !== undefined
        ? { estimatedValue: input.estimatedValue }
        : {}),
      ...(input.probability !== undefined ? { probability: input.probability } : {}),
      ...(input.expectedCloseDate
        ? { expectedCloseDate: new Date(`${input.expectedCloseDate}T00:00:00.000Z`) }
        : {}),
      ...(input.nextFollowUpAt
        ? { nextFollowUpAt: new Date(`${input.nextFollowUpAt}T00:00:00.000Z`) }
        : {}),
      ...(input.utmSource ? { utmSource: input.utmSource } : {}),
      ...(input.utmMedium ? { utmMedium: input.utmMedium } : {}),
      ...(input.utmCampaign ? { utmCampaign: input.utmCampaign } : {}),
    });

    return toLeadDTO(lead);
  },

  async softDeleteLead(userId: string, id: string): Promise<void> {
    const agency = await requireAgencyMemberDocument(userId);
    const deleted = await LeadRepository.softDeleteByIdAndAgency(id, String(agency._id));
    if (!deleted) throw new NotFoundError("Lead not found or already deleted.");
  },

  async restoreLead(userId: string, id: string): Promise<void> {
    const agency = await requireAgencyMemberDocument(userId);
    const restored = await LeadRepository.restoreByIdAndAgency(id, String(agency._id));
    if (!restored) throw new NotFoundError("Lead not found or not deleted.");
  },

  async mergeLeads(userId: string, primaryId: string, mergeIntoId: string): Promise<LeadDTO> {
    const agency = await requireAgencyMemberDocument(userId);
    const agencyId = String(agency._id);

    const primary = await LeadRepository.findByIdAndAgency(primaryId, agencyId);
    if (!primary) throw new NotFoundError("Primary lead not found.");
    const toMerge = await LeadRepository.findByIdAndAgency(mergeIntoId, agencyId);
    if (!toMerge) throw new NotFoundError("Lead to merge not found.");
    if (primaryId === mergeIntoId) throw new ValidationError("Cannot merge a lead into itself.");

    // Prefer non-empty values from the lead being merged into the primary.
    const updateFields: Record<string, unknown> = {};
    const fillIfEmpty = (key: string, value: unknown) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !(primary as unknown as Record<string, unknown>)[key]
      ) {
        updateFields[key] = value;
      }
    };
    fillIfEmpty("travelerPhone", toMerge.travelerPhone);
    fillIfEmpty("packageName", toMerge.packageName);
    fillIfEmpty("requestedStartDate", toMerge.requestedStartDate);
    fillIfEmpty("travelerCount", toMerge.travelerCount);
    fillIfEmpty("agencyNote", toMerge.agencyNote);
    fillIfEmpty("pipelineStageId", toMerge.pipelineStageId);
    fillIfEmpty("leadSourceId", toMerge.leadSourceId);
    fillIfEmpty("assignedStaffId", toMerge.assignedStaffId);
    fillIfEmpty("estimatedValue", toMerge.estimatedValue);
    fillIfEmpty("probability", toMerge.probability);
    fillIfEmpty("expectedCloseDate", toMerge.expectedCloseDate);
    fillIfEmpty("utmSource", toMerge.utmSource);
    fillIfEmpty("utmMedium", toMerge.utmMedium);
    fillIfEmpty("utmCampaign", toMerge.utmCampaign);

    const updated = await LeadRepository.updateByIdAndAgency(
      primaryId,
      agencyId,
      updateFields as {
        status?: LeadStatus;
        agencyNote?: string;
        pipelineStageId?: string;
        leadSourceId?: string;
        assignedStaffId?: string;
        estimatedValue?: number;
        probability?: number;
        expectedCloseDate?: string;
        lastFollowUpAt?: string;
        nextFollowUpAt?: string;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
      }
    );
    if (!updated) throw new NotFoundError("Primary lead not found.");

    await LeadRepository.softDeleteByIdAndAgency(mergeIntoId, agencyId);

    return toLeadDTO(updated);
  },

  async bulkImportForAgency(userId: string, input: BulkImportLeadsInput) {
    await requireAgencyOwnerDocument(userId);
    const leadIds: string[] = [];
    const errors: Array<{ email: string; message: string }> = [];

    for (const item of input.leads) {
      try {
        const lead = await LeadService.createForAgency(userId, item);
        leadIds.push(lead.id);
      } catch (error) {
        errors.push({
          email: item.travelerEmail,
          message: error instanceof Error ? error.message : "Import failed.",
        });
      }
    }

    return {
      created: leadIds.length,
      failed: errors.length,
      leadIds,
      errors,
    };
  },

  async list(userId: string, filters: ListLeadsQuery) {
    const agency = await requireAgencyMemberDocument(userId);
    const { items, total } = await LeadRepository.listByAgency(String(agency._id), filters);
    return {
      items: items.map(toLeadDTO),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: total ? Math.ceil(total / filters.limit) : 0,
    };
  },

  async listMine(userId: string, filters: ListMyLeadsQuery) {
    const user = await requireTraveler(userId);
    const { items, total } = await LeadRepository.listByTraveler(String(user._id), filters);
    const agencies = await AgencyRepository.findApprovedPublicSummariesByIds(
      [...new Set(items.map((lead) => String(lead.agencyId)))]
    );
    const agenciesById = new Map(agencies.map((agency) => [agency.id, agency]));
    return {
      items: items.map((lead) => ({
        id: String(lead._id),
        agency: agenciesById.get(String(lead.agencyId)) ?? null,
        ...(lead.packageId ? { packageId: String(lead.packageId) } : {}),
        ...(lead.packageName ? { packageName: lead.packageName } : {}),
        ...(lead.requestedStartDate
          ? { requestedStartDate: lead.requestedStartDate.toISOString().slice(0, 10) }
          : {}),
        ...(lead.travelerCount !== undefined ? { travelerCount: lead.travelerCount } : {}),
        status: lead.status,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
      })),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: total ? Math.ceil(total / filters.limit) : 0,
    };
  },

  async getMine(userId: string, id: string): Promise<TravelerLeadDTO> {
    const user = await requireTraveler(userId);
    const lead = await LeadRepository.findByIdAndTraveler(id, String(user._id));
    if (!lead) throw new NotFoundError("Inquiry not found.");
    return toTravelerLeadDTO(lead, true);
  },

  async getById(userId: string, id: string): Promise<LeadDTO> {
    const agency = await requireAgencyMemberDocument(userId);
    const lead = await LeadRepository.findByIdAndAgency(id, String(agency._id));
    if (!lead) throw new NotFoundError("Inquiry not found.");
    return toLeadDTO(lead);
  },

  async update(userId: string, id: string, input: UpdateLeadInput): Promise<LeadDTO> {
    const agency = await requireAgencyMemberDocument(userId);
    const lead = await LeadRepository.updateByIdAndAgency(id, String(agency._id), input);
    if (!lead) throw new NotFoundError("Inquiry not found.");
    return toLeadDTO(lead);
  },

  async getDashboard(userId: string) {
    const agency = await requireAgencyMemberDocument(userId);
    const agencyId = String(agency._id);
    const [packageCounts, leadCounts, latest] = await Promise.all([
      Promise.all([
        Package.countDocuments({ agencyId, status: "active", visibility: "public" }).exec(),
        Package.countDocuments({ agencyId }).exec(),
      ]),
      LeadRepository.countByStatus(agencyId),
      LeadRepository.listByAgency(agencyId, { page: 1, limit: 5 }),
    ]);

    const counts: Record<LeadStatus, number> = {
      new: 0,
      contacted: 0,
      qualified: 0,
      won: 0,
      closed: 0,
    };
    for (const item of leadCounts) counts[item._id] = item.count;

    return {
      agency: {
        id: agencyId,
        name: agency.name,
        slug: agency.slug,
        status: agency.status,
      },
      packages: {
        total: packageCounts[1],
        activePublic: packageCounts[0],
      },
      leads: {
        total: Object.values(counts).reduce((total, count) => total + count, 0),
        byStatus: counts,
        latest: latest.items.map((lead) => ({
          id: String(lead._id),
          travelerName: lead.travelerName,
          packageName: lead.packageName,
          status: lead.status,
          createdAt: lead.createdAt.toISOString(),
        })),
      },
    };
  },
};
