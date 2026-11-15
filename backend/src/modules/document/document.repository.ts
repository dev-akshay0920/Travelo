import { Types } from "mongoose";
import { DocumentFileModel } from "./document.model";
import type { DocumentFileDocument } from "./document.model";
import type { DocumentListQuery } from "./document.types";

interface DocumentLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  leadId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  category: "passport" | "contract" | "voucher" | "itinerary" | "quote" | "invoice" | "other";
  fileName: string;
  url: string;
  key: string;
  mimeType: string;
  size: number;
  uploadedBy: Types.ObjectId;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DocumentRepository {
  async create(data: {
    agencyId: Types.ObjectId;
    leadId?: Types.ObjectId;
    bookingId?: Types.ObjectId;
    invoiceId?: Types.ObjectId;
    category: "passport" | "contract" | "voucher" | "itinerary" | "quote" | "invoice" | "other";
    fileName: string;
    url: string;
    key: string;
    mimeType: string;
    size: number;
    uploadedBy: Types.ObjectId;
    description?: string;
  }): Promise<DocumentFileDocument> {
    const document = new DocumentFileModel({
      ...data,
      agencyId: data.agencyId,
      leadId: data.leadId,
      bookingId: data.bookingId,
      invoiceId: data.invoiceId,
      category: data.category,
      fileName: data.fileName,
      url: data.url,
      key: data.key,
      mimeType: data.mimeType,
      size: data.size,
      uploadedBy: data.uploadedBy,
      description: data.description,
    });
    return document.save();
  }

  async findByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<DocumentFileDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return DocumentFileModel.findOne({ _id: id, agencyId }).exec();
  }

  async updateByIdAndAgency(
    id: Types.ObjectId,
    agencyId: Types.ObjectId,
    data: Partial<{
      leadId: Types.ObjectId;
      bookingId: Types.ObjectId;
      invoiceId: Types.ObjectId;
      category: "passport" | "contract" | "voucher" | "itinerary" | "quote" | "invoice" | "other";
      fileName: string;
      url: string;
      key: string;
      mimeType: string;
      size: number;
      description: string;
    }>
  ): Promise<DocumentFileDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return DocumentFileModel.findOneAndUpdate({ _id: id, agencyId }, { $set: data }, { new: true }).exec();
  }

  async deleteByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<boolean> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await DocumentFileModel.deleteOne({ _id: id, agencyId }).exec();
    return result.deletedCount === 1;
  }

  async listByAgency(agencyId: Types.ObjectId, query: DocumentListQuery): Promise<{
    items: DocumentLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search, category, leadId, bookingId, invoiceId, sortBy = "createdAt", sortOrder = "desc" } = query;

    const filter: Record<string, unknown> = { agencyId };
    if (category) filter.category = category;
    if (leadId) filter.leadId = new Types.ObjectId(leadId);
    if (bookingId) filter.bookingId = new Types.ObjectId(bookingId);
    if (invoiceId) filter.invoiceId = new Types.ObjectId(invoiceId);
    if (search) {
      filter.$or = [
        { fileName: { $regex: search, $options: "i" } },
      ];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      DocumentFileModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      DocumentFileModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as DocumentLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getByLeadId(leadId: Types.ObjectId, agencyId: Types.ObjectId): Promise<DocumentLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return DocumentFileModel.find({ leadId, agencyId }).sort({ createdAt: -1 }).lean().exec();
  }

  async getByBookingId(bookingId: Types.ObjectId, agencyId: Types.ObjectId): Promise<DocumentLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return DocumentFileModel.find({ bookingId, agencyId }).sort({ createdAt: -1 }).lean().exec();
  }

  async getByInvoiceId(invoiceId: Types.ObjectId, agencyId: Types.ObjectId): Promise<DocumentLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return DocumentFileModel.find({ invoiceId, agencyId }).sort({ createdAt: -1 }).lean().exec();
  }
}

export const documentRepository = new DocumentRepository();