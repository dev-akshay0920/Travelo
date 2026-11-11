import { Types } from "mongoose";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../shared/errors/app-error";
import { AgencyRepository } from "../agencies/agency.repository";
import { PackageRepository } from "../packages/package.repository";
import { UserRepository } from "../users/user.repository";
import type { AgencyDocument } from "../agencies/agency.model";
import type { LeadDocument, LeadStatus } from "./lead.model";
import { LeadRepository } from "./lead.repository";
import type { CreateLeadInput, ListLeadsQuery, UpdateLeadInput } from "./lead.validation";
import { Package } from "../packages/package.model";

export interface LeadDTO {
  id: string;
  packageId?: string;
  packageName?: string;
  travelerName: string;
  travelerEmail: string;
  message: string;
  requestedStartDate?: string;
  travelerCount?: number;
  status: LeadStatus;
  agencyNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatedLeadDTO {
  id: string;
  status: LeadStatus;
  createdAt: string;
}

function toLeadDTO(lead: LeadDocument): LeadDTO {
  return {
    id: String(lead._id),
    ...(lead.packageId ? { packageId: String(lead.packageId) } : {}),
    ...(lead.packageName ? { packageName: lead.packageName } : {}),
    travelerName: lead.travelerName,
    travelerEmail: lead.travelerEmail,
    message: lead.message,
    ...(lead.requestedStartDate
      ? { requestedStartDate: lead.requestedStartDate.toISOString().slice(0, 10) }
      : {}),
    ...(lead.travelerCount !== undefined ? { travelerCount: lead.travelerCount } : {}),
    status: lead.status,
    agencyNote: lead.agencyNote,
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

async function requireAgencyOwner(userId: string): Promise<AgencyDocument> {
  const user = await getActiveUser(userId);
  if (user.roleId?.key !== "agency") {
    throw new ForbiddenError("Agency owner access is required.");
  }
  const agency = await AgencyRepository.findByOwnerUserId(userId);
  if (!agency) throw new NotFoundError("Agency profile not found.");
  return agency;
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

  async list(userId: string, filters: ListLeadsQuery) {
    const agency = await requireAgencyOwner(userId);
    const { items, total } = await LeadRepository.listByAgency(String(agency._id), filters);
    return {
      items: items.map(toLeadDTO),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: total ? Math.ceil(total / filters.limit) : 0,
    };
  },

  async getById(userId: string, id: string): Promise<LeadDTO> {
    const agency = await requireAgencyOwner(userId);
    const lead = await LeadRepository.findByIdAndAgency(id, String(agency._id));
    if (!lead) throw new NotFoundError("Inquiry not found.");
    return toLeadDTO(lead);
  },

  async update(userId: string, id: string, input: UpdateLeadInput): Promise<LeadDTO> {
    const agency = await requireAgencyOwner(userId);
    const lead = await LeadRepository.updateByIdAndAgency(id, String(agency._id), input);
    if (!lead) throw new NotFoundError("Inquiry not found.");
    return toLeadDTO(lead);
  },

  async getDashboard(userId: string) {
    const agency = await requireAgencyOwner(userId);
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
