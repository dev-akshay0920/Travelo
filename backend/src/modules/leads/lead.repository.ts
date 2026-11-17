import { Types } from "mongoose";
import type { LeadDocument, LeadStatus } from "./lead.model";
import { Lead } from "./lead.model";

export interface LeadListFilters {
  search?: string;
  status?: LeadStatus;
  pipelineStageId?: string;
  leadSourceId?: string;
  assignedStaffId?: string;
  packageId?: string;
  page: number;
  limit: number;
  includeDeleted?: boolean;
}

export const LeadRepository = {
  async create(data: Partial<LeadDocument>): Promise<LeadDocument> {
    return new Lead(data).save();
  },

  async listByAgency(
    agencyId: string,
    filters: LeadListFilters
  ): Promise<{ items: LeadDocument[]; total: number; page: number; limit: number; totalPages: number }> {
    const query: Record<string, unknown> = {
      agencyId: new Types.ObjectId(agencyId),
    };
    if (!filters.includeDeleted) {
      query.deletedAt = { $exists: false };
    }
    if (filters.search) {
      const pattern = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { travelerName: pattern },
        { travelerEmail: pattern },
        { travelerPhone: pattern },
        { message: pattern },
      ];
    }
    if (filters.status) query.status = filters.status;
    if (filters.pipelineStageId) query.pipelineStageId = new Types.ObjectId(filters.pipelineStageId);
    if (filters.leadSourceId) query.leadSourceId = new Types.ObjectId(filters.leadSourceId);
    if (filters.assignedStaffId) query.assignedStaffId = new Types.ObjectId(filters.assignedStaffId);
    if (filters.packageId) query.packageId = new Types.ObjectId(filters.packageId);

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      Lead.find(query)
        .select(
          "agencyId packageId packageName travelerId travelerName travelerEmail travelerPhone message requestedStartDate travelerCount status agencyNote pipelineStageId leadSourceId assignedStaffId estimatedValue probability expectedCloseDate lastFollowUpAt nextFollowUpAt utmSource utmMedium utmCampaign leadFormSubmissionId createdAt updatedAt deletedAt"
        )
        .sort({ createdAt: -1, _id: -1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit)
        .exec(),
      Lead.countDocuments(query).exec(),
    ]);

    return {
      items,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: total ? Math.ceil(total / filters.limit) : 0,
    };
  },

  async findDuplicateByAgency(
    agencyId: string,
    travelerEmail: string,
    travelerPhone?: string
  ): Promise<LeadDocument | null> {
    if (!Types.ObjectId.isValid(agencyId)) return null;
    const normalizedEmail = travelerEmail.trim().toLowerCase();
    const query: Record<string, unknown> = {
      agencyId: new Types.ObjectId(agencyId),
      travelerEmail: normalizedEmail,
      deletedAt: { $exists: false },
    };
    if (travelerPhone && travelerPhone.trim()) {
      query.$or = [
        { travelerEmail: normalizedEmail },
        { travelerPhone: travelerPhone.trim() },
      ];
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return Lead.findOne(query)
      .select(
        "agencyId packageId packageName travelerId travelerName travelerEmail travelerPhone message requestedStartDate travelerCount status agencyNote pipelineStageId leadSourceId assignedStaffId estimatedValue probability expectedCloseDate lastFollowUpAt nextFollowUpAt utmSource utmMedium utmCampaign leadFormSubmissionId createdAt updatedAt deletedAt"
      )
      .sort({ createdAt: -1 })
      .exec();
  },

  async softDeleteByIdAndAgency(id: string, agencyId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await Lead.findOneAndUpdate(
      { _id: new Types.ObjectId(id), agencyId: new Types.ObjectId(agencyId), deletedAt: { $exists: false } },
      { $set: { deletedAt: new Date() } },
      { new: true }
    ).exec();
    return result !== null;
  },

  async restoreByIdAndAgency(id: string, agencyId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await Lead.findOneAndUpdate(
      { _id: new Types.ObjectId(id), agencyId: new Types.ObjectId(agencyId), deletedAt: { $exists: true } },
      { $unset: { deletedAt: "" } },
      { new: true }
    ).exec();
    return result !== null;
  },

  async listByTraveler(
    travelerId: string,
    filters: Pick<LeadListFilters, "page" | "limit">
  ): Promise<{ items: LeadDocument[]; total: number; page: number; limit: number; totalPages: number }> {
    const query = { travelerId: new Types.ObjectId(travelerId), deletedAt: { $exists: false } };
    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      Lead.find(query)
        .select("agencyId packageId packageName message requestedStartDate travelerCount status createdAt updatedAt")
        .sort({ createdAt: -1, _id: -1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit)
        .exec(),
      Lead.countDocuments(query).exec(),
    ]);
    return {
      items,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: total ? Math.ceil(total / filters.limit) : 0,
    };
  },
  async findByIdAndTraveler(id: string, travelerId: string): Promise<LeadDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return Lead.findOne({
      _id: new Types.ObjectId(id),
      travelerId: new Types.ObjectId(travelerId),
      deletedAt: { $exists: false },
    })
      .select("agencyId packageId packageName message requestedStartDate travelerCount status createdAt updatedAt")
      .exec();
  },

  async findByIdAndAgency(id: string, agencyId: string): Promise<LeadDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return Lead.findOne({
      _id: new Types.ObjectId(id),
      agencyId: new Types.ObjectId(agencyId),
      deletedAt: { $exists: false },
    })
      .select(
        "agencyId packageId packageName travelerId travelerName travelerEmail travelerPhone message requestedStartDate travelerCount status agencyNote pipelineStageId leadSourceId assignedStaffId estimatedValue probability expectedCloseDate lastFollowUpAt nextFollowUpAt utmSource utmMedium utmCampaign leadFormSubmissionId createdAt updatedAt deletedAt"
      )
      .exec();
  },

  async updateByIdAndAgency(
    id: string,
    agencyId: string,
    update: {
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
  ): Promise<LeadDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const $set: Record<string, unknown> = {};
    if (update.status !== undefined) $set.status = update.status;
    if (update.agencyNote !== undefined) $set.agencyNote = update.agencyNote;
    if (update.pipelineStageId !== undefined)
      $set.pipelineStageId = new Types.ObjectId(update.pipelineStageId);
    if (update.leadSourceId !== undefined)
      $set.leadSourceId = new Types.ObjectId(update.leadSourceId);
    if (update.assignedStaffId !== undefined)
      $set.assignedStaffId = new Types.ObjectId(update.assignedStaffId);
    if (update.estimatedValue !== undefined) $set.estimatedValue = update.estimatedValue;
    if (update.probability !== undefined) $set.probability = update.probability;
    if (update.expectedCloseDate !== undefined)
      $set.expectedCloseDate = new Date(`${update.expectedCloseDate}T00:00:00.000Z`);
    if (update.lastFollowUpAt !== undefined)
      $set.lastFollowUpAt = new Date(`${update.lastFollowUpAt}T00:00:00.000Z`);
    if (update.nextFollowUpAt !== undefined)
      $set.nextFollowUpAt = new Date(`${update.nextFollowUpAt}T00:00:00.000Z`);
    if (update.utmSource !== undefined) $set.utmSource = update.utmSource;
    if (update.utmMedium !== undefined) $set.utmMedium = update.utmMedium;
    if (update.utmCampaign !== undefined) $set.utmCampaign = update.utmCampaign;

    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return Lead.findOneAndUpdate(
      { _id: new Types.ObjectId(id), agencyId: new Types.ObjectId(agencyId), deletedAt: { $exists: false } },
      { $set },
      { new: true, runValidators: true }
    )
      .select(
        "agencyId packageId packageName travelerId travelerName travelerEmail travelerPhone message requestedStartDate travelerCount status agencyNote pipelineStageId leadSourceId assignedStaffId estimatedValue probability expectedCloseDate lastFollowUpAt nextFollowUpAt utmSource utmMedium utmCampaign leadFormSubmissionId createdAt updatedAt deletedAt"
      )
      .exec();
  },

  async countByStatus(agencyId: string): Promise<Array<{ _id: LeadStatus; count: number }>> {
    return Lead.aggregate<{ _id: LeadStatus; count: number }>([
      { $match: { agencyId: new Types.ObjectId(agencyId), deletedAt: { $exists: false } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).exec();
  },
};
