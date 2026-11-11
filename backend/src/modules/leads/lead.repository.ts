import { Types } from "mongoose";
import type { LeadDocument, LeadStatus } from "./lead.model";
import { Lead } from "./lead.model";

export interface LeadListFilters {
  status?: LeadStatus;
  packageId?: string;
  page: number;
  limit: number;
}

export const LeadRepository = {
  async create(data: Partial<LeadDocument>): Promise<LeadDocument> {
    return new Lead(data).save();
  },

  async listByAgency(
    agencyId: string,
    filters: LeadListFilters
  ): Promise<{ items: LeadDocument[]; total: number }> {
    const query: Record<string, unknown> = {
      agencyId: new Types.ObjectId(agencyId),
    };
    if (filters.status) query.status = filters.status;
    if (filters.packageId) query.packageId = new Types.ObjectId(filters.packageId);

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      Lead.find(query)
        .select("agencyId packageId packageName travelerName travelerEmail message requestedStartDate travelerCount status agencyNote createdAt updatedAt")
        .sort({ createdAt: -1, _id: -1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit)
        .exec(),
      Lead.countDocuments(query).exec(),
    ]);

    return { items, total };
  },

  async findByIdAndAgency(id: string, agencyId: string): Promise<LeadDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return Lead.findOne({
      _id: new Types.ObjectId(id),
      agencyId: new Types.ObjectId(agencyId),
    })
      .select("agencyId packageId packageName travelerName travelerEmail message requestedStartDate travelerCount status agencyNote createdAt updatedAt")
      .exec();
  },

  async updateByIdAndAgency(
    id: string,
    agencyId: string,
    update: { status?: LeadStatus; agencyNote?: string }
  ): Promise<LeadDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return Lead.findOneAndUpdate(
      { _id: new Types.ObjectId(id), agencyId: new Types.ObjectId(agencyId) },
      { $set: update },
      { new: true, runValidators: true }
    )
      .select("agencyId packageId packageName travelerName travelerEmail message requestedStartDate travelerCount status agencyNote createdAt updatedAt")
      .exec();
  },

  async countByStatus(agencyId: string): Promise<Array<{ _id: LeadStatus; count: number }>> {
    return Lead.aggregate<{ _id: LeadStatus; count: number }>([
      { $match: { agencyId: new Types.ObjectId(agencyId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).exec();
  },
};
