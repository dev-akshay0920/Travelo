import { Types } from "mongoose";
import type { LeadSourceDocument } from "./lead-source.model";
import { LeadSource } from "./lead-source.model";

export interface LeadSourceListFilters {
  isActive?: boolean;
  page: number;
  limit: number;
}

export const LeadSourceRepository = {
  async create(data: Partial<LeadSourceDocument>): Promise<LeadSourceDocument> {
    return new LeadSource(data).save();
  },

  async listByAgency(
    agencyId: string,
    filters: LeadSourceListFilters
  ): Promise<{ items: LeadSourceDocument[]; total: number }> {
    const query: Record<string, unknown> = { agencyId: new Types.ObjectId(agencyId) };
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      LeadSource.find(query)
        .sort({ name: 1, createdAt: 1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit)
        .exec(),
      LeadSource.countDocuments(query).exec(),
    ]);
    return { items, total };
  },

  async findByIdAndAgency(id: string, agencyId: string): Promise<LeadSourceDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return LeadSource.findOne({
      _id: new Types.ObjectId(id),
      agencyId: new Types.ObjectId(agencyId),
    }).exec();
  },

  async updateByIdAndAgency(
    id: string,
    agencyId: string,
    update: Partial<LeadSourceDocument>
  ): Promise<LeadSourceDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return LeadSource.findOneAndUpdate(
      { _id: new Types.ObjectId(id), agencyId: new Types.ObjectId(agencyId) },
      { $set: update },
      { new: true, runValidators: true }
    ).exec();
  },

  async deleteByIdAndAgency(id: string, agencyId: string): Promise<LeadSourceDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return LeadSource.findOneAndDelete({
      _id: new Types.ObjectId(id),
      agencyId: new Types.ObjectId(agencyId),
    }).exec();
  },

  async countByAgency(agencyId: string): Promise<number> {
    return LeadSource.countDocuments({ agencyId: new Types.ObjectId(agencyId) }).exec();
  },
};