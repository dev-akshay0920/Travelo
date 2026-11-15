import { Types } from "mongoose";
import { QuotationModel } from "./quotation.model";
import type { QuotationDocument } from "./quotation.model";
import type { QuotationListQuery } from "./quotation.types";

interface QuotationLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  leadId: Types.ObjectId;
  itineraryId?: Types.ObjectId;
  quotationNumber: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "expired" | "converted";
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  validUntil: Date;
  pdfUrl?: string;
  pdfKey?: string;
  publicShareLink: string;
  shareLinkExpiresAt?: Date;
  viewedAt?: Date;
  acceptedAt?: Date;
  notes?: string;
  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class QuotationRepository {
  async create(data: {
    agencyId: Types.ObjectId;
    leadId: Types.ObjectId;
    itineraryId?: Types.ObjectId;
    quotationNumber: string;
    status?: "draft" | "sent" | "viewed" | "accepted" | "expired" | "converted";
    subtotal: number;
    taxAmount?: number;
    discountAmount?: number;
    total: number;
    currency?: string;
    validUntil: Date;
    notes?: string;
    termsAndConditions?: string;
    publicShareLink: string;
    shareLinkExpiresAt?: Date;
  }): Promise<QuotationDocument> {
    const quotation = new QuotationModel({
      ...data,
      agencyId: data.agencyId,
      leadId: data.leadId,
      itineraryId: data.itineraryId,
      quotationNumber: data.quotationNumber,
      status: data.status || "draft",
      subtotal: data.subtotal,
      taxAmount: data.taxAmount || 0,
      discountAmount: data.discountAmount || 0,
      total: data.total,
      currency: data.currency || "INR",
      validUntil: data.validUntil,
      publicShareLink: data.publicShareLink,
      shareLinkExpiresAt: data.shareLinkExpiresAt,
      notes: data.notes,
      termsAndConditions: data.termsAndConditions,
    });
    return quotation.save();
  }

  async findByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<QuotationDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return QuotationModel.findOne({ _id: id, agencyId }).exec();
  }

  async findByPublicLink(token: string): Promise<QuotationDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return QuotationModel.findOne({ publicShareLink: token }).exec();
  }

  async updateByIdAndAgency(
    id: Types.ObjectId,
    agencyId: Types.ObjectId,
    data: Partial<{
      leadId: Types.ObjectId;
      itineraryId: Types.ObjectId;
      status: "draft" | "sent" | "viewed" | "accepted" | "expired" | "converted";
      subtotal: number;
      taxAmount: number;
      discountAmount: number;
      total: number;
      currency: string;
      validUntil: Date;
      pdfUrl: string;
      pdfKey: string;
      publicShareLink: string;
      shareLinkExpiresAt: Date;
      notes: string;
      termsAndConditions: string;
    }>
  ): Promise<QuotationDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return QuotationModel.findOneAndUpdate({ _id: id, agencyId }, { $set: data }, { new: true }).exec();
  }

  async deleteByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<boolean> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await QuotationModel.deleteOne({ _id: id, agencyId }).exec();
    return result.deletedCount === 1;
  }

  async listByAgency(agencyId: Types.ObjectId, query: QuotationListQuery): Promise<{
    items: QuotationLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search, status, leadId, sortBy = "createdAt", sortOrder = "desc" } = query;

    const filter: Record<string, unknown> = { agencyId };
    if (status) filter.status = status;
    if (leadId) filter.leadId = new Types.ObjectId(leadId);
    if (search) {
      filter.$or = [{ quotationNumber: { $regex: search, $options: "i" } }];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      QuotationModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      QuotationModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as QuotationLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async countByAgency(agencyId: Types.ObjectId): Promise<number> {
    return QuotationModel.countDocuments({ agencyId }).exec();
  }

  async countByStatus(agencyId: Types.ObjectId): Promise<Record<string, number>> {
    const result = await QuotationModel.aggregate([
      { $match: { agencyId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).exec();
    return result.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});
  }

  async getByLeadId(leadId: Types.ObjectId, agencyId: Types.ObjectId): Promise<QuotationLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return QuotationModel.find({ leadId, agencyId }).sort({ createdAt: -1 }).lean().exec();
  }

  async markAsViewed(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<QuotationDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return QuotationModel.findOneAndUpdate(
      { _id: id, agencyId, status: "sent" },
      { $set: { status: "viewed", viewedAt: new Date() } },
      { new: true }
    ).exec();
  }

  async markAsAccepted(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<QuotationDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return QuotationModel.findOneAndUpdate(
      { _id: id, agencyId },
      { $set: { status: "accepted", acceptedAt: new Date() } },
      { new: true }
    ).exec();
  }
}

export const quotationRepository = new QuotationRepository();