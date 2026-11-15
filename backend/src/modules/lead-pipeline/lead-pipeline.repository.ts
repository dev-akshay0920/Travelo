import { Types } from "mongoose";
import type { LeadPipelineDocument } from "./lead-pipeline.model";
import { LeadPipeline } from "./lead-pipeline.model";

export interface LeadPipelineListFilters {
  page: number;
  limit: number;
}

export const LeadPipelineRepository = {
  async create(data: Partial<LeadPipelineDocument>): Promise<LeadPipelineDocument> {
    return new LeadPipeline(data).save();
  },

  async listByAgency(
    agencyId: string,
    filters: LeadPipelineListFilters
  ): Promise<{ items: LeadPipelineDocument[]; total: number }> {
    const query = { agencyId: new Types.ObjectId(agencyId) };
    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      LeadPipeline.find(query)
        .sort({ order: 1, createdAt: 1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit)
        .exec(),
      LeadPipeline.countDocuments(query).exec(),
    ]);
    return { items, total };
  },

  async findByIdAndAgency(id: string, agencyId: string): Promise<LeadPipelineDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return LeadPipeline.findOne({
      _id: new Types.ObjectId(id),
      agencyId: new Types.ObjectId(agencyId),
    }).exec();
  },

  async updateByIdAndAgency(
    id: string,
    agencyId: string,
    update: Partial<LeadPipelineDocument>
  ): Promise<LeadPipelineDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return LeadPipeline.findOneAndUpdate(
      { _id: new Types.ObjectId(id), agencyId: new Types.ObjectId(agencyId) },
      { $set: update },
      { new: true, runValidators: true }
    ).exec();
  },

  async deleteByIdAndAgency(id: string, agencyId: string): Promise<LeadPipelineDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return LeadPipeline.findOneAndDelete({
      _id: new Types.ObjectId(id),
      agencyId: new Types.ObjectId(agencyId),
    }).exec();
  },

  async countByAgency(agencyId: string): Promise<number> {
    return LeadPipeline.countDocuments({ agencyId: new Types.ObjectId(agencyId) }).exec();
  },
};