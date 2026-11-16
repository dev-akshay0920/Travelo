import { Types } from "mongoose";
import type { LeadActivityDocument } from "./lead-activity.model";
import { LeadActivity } from "./lead-activity.model";

export interface LeadActivityListFilters {
  page: number;
  limit: number;
}

export const LeadActivityRepository = {
  async create(data: Partial<LeadActivityDocument>): Promise<LeadActivityDocument> {
    return new LeadActivity(data).save();
  },

  async listByLead(
    leadId: string,
    filters: LeadActivityListFilters
  ): Promise<{ items: LeadActivityDocument[]; total: number; page: number; limit: number; totalPages: number }> {
    const query = { leadId: new Types.ObjectId(leadId) };
    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      LeadActivity.find(query)
        .sort({ createdAt: -1, _id: -1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit)
        .exec(),
      LeadActivity.countDocuments(query).exec(),
    ]);
    return {
      items,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: total ? Math.ceil(total / filters.limit) : 0,
    };
  },

  async findByIdAndAgency(
    id: string,
    agencyId: string
  ): Promise<LeadActivityDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return LeadActivity.findOne({
      _id: new Types.ObjectId(id),
      agencyId: new Types.ObjectId(agencyId),
    }).exec();
  },

  async countByLead(leadId: string): Promise<number> {
    return LeadActivity.countDocuments({ leadId: new Types.ObjectId(leadId) }).exec();
  },
};