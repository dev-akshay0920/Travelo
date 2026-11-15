import { Types } from "mongoose";
import { ItineraryModel } from "./itinerary.model";
import type { ItineraryDocument, ItineraryDay } from "./itinerary.model";
import type { ItineraryListQuery } from "./itinerary.types";

interface ItineraryLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  leadId?: Types.ObjectId;
  packageId?: Types.ObjectId;
  name: string;
  destination: string;
  durationDays: number;
  durationNights: number;
  days: ItineraryDay[];
  totalPrice: number;
  currency: string;
  taxType: "inclusive" | "exclusive" | "none";
  taxPercentage: number;
  advancePercentage: number;
  isTemplate: boolean;
  templateCategory?: string;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ItineraryRepository {
  async create(data: {
    agencyId: Types.ObjectId;
    leadId?: Types.ObjectId;
    packageId?: Types.ObjectId;
    name: string;
    destination: string;
    durationDays: number;
    durationNights: number;
    days?: ItineraryDay[];
    totalPrice?: number;
    currency?: string;
    taxType?: "inclusive" | "exclusive" | "none";
    taxPercentage?: number;
    advancePercentage?: number;
    isTemplate?: boolean;
    templateCategory?: string;
    aiGenerated?: boolean;
  }): Promise<ItineraryDocument> {
    const itinerary = new ItineraryModel({
      ...data,
      agencyId: data.agencyId,
      leadId: data.leadId,
      packageId: data.packageId,
      days: data.days || [],
      totalPrice: data.totalPrice || 0,
      currency: data.currency || "INR",
      taxType: data.taxType || "none",
      taxPercentage: data.taxPercentage || 0,
      advancePercentage: data.advancePercentage || 0,
      isTemplate: data.isTemplate || false,
      aiGenerated: data.aiGenerated || false,
    });
    return itinerary.save();
  }

  async findByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<ItineraryDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return ItineraryModel.findOne({ _id: id, agencyId }).exec();
  }

  async updateByIdAndAgency(
    id: Types.ObjectId,
    agencyId: Types.ObjectId,
    data: Partial<{
      leadId: Types.ObjectId;
      packageId: Types.ObjectId;
      name: string;
      destination: string;
      durationDays: number;
      durationNights: number;
      days: ItineraryDay[];
      totalPrice: number;
      currency: string;
      taxType: "inclusive" | "exclusive" | "none";
      taxPercentage: number;
      advancePercentage: number;
      isTemplate: boolean;
      templateCategory: string;
      aiGenerated: boolean;
    }>
  ): Promise<ItineraryDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return ItineraryModel.findOneAndUpdate({ _id: id, agencyId }, { $set: data }, { new: true }).exec();
  }

  async deleteByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<boolean> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await ItineraryModel.deleteOne({ _id: id, agencyId }).exec();
    return result.deletedCount === 1;
  }

  async listByAgency(agencyId: Types.ObjectId, query: ItineraryListQuery): Promise<{
    items: ItineraryLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search, isTemplate, leadId, packageId, sortBy = "createdAt", sortOrder = "desc" } = query;

    const filter: Record<string, unknown> = { agencyId };
    if (isTemplate !== undefined) filter.isTemplate = isTemplate;
    if (leadId) filter.leadId = new Types.ObjectId(leadId);
    if (packageId) filter.packageId = new Types.ObjectId(packageId);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { destination: { $regex: search, $options: "i" } },
      ];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      ItineraryModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      ItineraryModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as ItineraryLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTemplatesByAgency(agencyId: Types.ObjectId): Promise<ItineraryLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return ItineraryModel.find({ agencyId, isTemplate: true }).sort({ createdAt: -1 }).lean().exec();
  }

  async countByAgency(agencyId: Types.ObjectId): Promise<number> {
    return ItineraryModel.countDocuments({ agencyId }).exec();
  }

  async duplicateItinerary(id: Types.ObjectId, agencyId: Types.ObjectId, newName: string): Promise<ItineraryDocument | null> {
    const original = await this.findByIdAndAgency(id, agencyId);
    if (!original) return null;

    const duplicate = new ItineraryModel({
      agencyId: original.agencyId,
      leadId: original.leadId,
      packageId: original.packageId,
      name: newName,
      destination: original.destination,
      durationDays: original.durationDays,
      durationNights: original.durationNights,
      days: original.days,
      totalPrice: original.totalPrice,
      currency: original.currency,
      taxType: original.taxType,
      taxPercentage: original.taxPercentage,
      advancePercentage: original.advancePercentage,
      isTemplate: false,
      templateCategory: original.templateCategory,
      aiGenerated: false,
    });
    return duplicate.save();
  }
}

export const itineraryRepository = new ItineraryRepository();