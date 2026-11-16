import { Types } from "mongoose";
import {
  NotFoundError,
  UnauthorizedError,
} from "../../shared/errors/app-error";
import { requireAgencyMemberDocument } from "../staff/agency-membership.service";
import { UserRepository } from "../users/user.repository";
import { Lead } from "../leads/lead.model";
import type { LeadActivityDocument } from "./lead-activity.model";
import { LeadActivityRepository } from "./lead-activity.repository";
import type {
  CreateLeadActivityInput,
  ListLeadActivitiesQuery,
} from "./lead-activity.validation";

export interface LeadActivityDTO {
  id: string;
  leadId: string;
  staffId?: string;
  staffName?: string;
  type: LeadActivityDocument["type"];
  subject: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

function toLeadActivityDTO(activity: LeadActivityDocument): LeadActivityDTO {
  return {
    id: String(activity._id),
    leadId: String(activity.leadId),
    ...(activity.staffId ? { staffId: String(activity.staffId) } : {}),
    type: activity.type,
    subject: activity.subject,
    ...(activity.description ? { description: activity.description } : {}),
    ...(activity.metadata ? { metadata: activity.metadata } : {}),
    createdAt: activity.createdAt.toISOString(),
    updatedAt: activity.updatedAt.toISOString(),
  };
}

async function getActiveUser(userId: string) {
  if (!Types.ObjectId.isValid(userId)) throw new UnauthorizedError();
  const user = await UserRepository.findByIdWithRole(userId);
  if (!user || user.status !== "active") throw new UnauthorizedError();
  return user;
}

export const LeadActivityService = {
  async create(
    userId: string,
    input: CreateLeadActivityInput
  ): Promise<LeadActivityDTO> {
    const user = await getActiveUser(userId);
    const agency = await requireAgencyMemberDocument(userId);

    // Verify lead belongs to agency
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const lead = await Lead.findOne({
      _id: new Types.ObjectId(input.leadId),
      agencyId: agency._id,
    }).exec();
    if (!lead) throw new NotFoundError("Lead not found.");

    const activity = await LeadActivityRepository.create({
      agencyId: agency._id,
      leadId: new Types.ObjectId(input.leadId),
      staffId: user._id,
      type: input.type,
      subject: input.subject,
      description: input.description,
      metadata: input.metadata,
    });
    return toLeadActivityDTO(activity);
  },

  async list(
    userId: string,
    leadId: string,
    filters: ListLeadActivitiesQuery
  ): Promise<{ items: LeadActivityDTO[]; total: number; page: number; limit: number; totalPages: number }> {
    const agency = await requireAgencyMemberDocument(userId);

    // Verify lead belongs to agency
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const lead = await Lead.findOne({
      _id: new Types.ObjectId(leadId),
      agencyId: agency._id,
    }).exec();
    if (!lead) throw new NotFoundError("Lead not found.");

    const { items, total } = await LeadActivityRepository.listByLead(leadId, filters);

    // Resolve staff names
    const staffIds = [...new Set(items.map((a) => String(a.staffId)).filter(Boolean))];
    const users = staffIds.length > 0 ? await UserRepository.findByIds(staffIds) : [];
    const usersById = new Map(users.map((u) => [String(u._id), u.name]));

    return {
      items: items.map((a) => ({
        ...toLeadActivityDTO(a),
        ...(a.staffId ? { staffName: usersById.get(String(a.staffId)) ?? undefined } : {}),
      })),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: total ? Math.ceil(total / filters.limit) : 0,
    };
  },
};