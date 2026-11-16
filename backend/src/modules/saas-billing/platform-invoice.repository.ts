import { Types } from "mongoose";
import { PlatformInvoiceModel } from "./platform-invoice.model";
import type { PlatformInvoiceDocument } from "./platform-invoice.model";
import type { PlatformInvoiceListQuery } from "./platform-invoice.types";

interface PlatformInvoiceLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  invoiceNumber: string;
  status: "draft" | "sent" | "paid" | "overdue" | "void" | "refunded";
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  taxPercentage: number;
  dueDate: Date;
  paidAt?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  pdfUrl?: string;
  pdfKey?: string;
  notes?: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class PlatformInvoiceRepository {
  private generateInvoiceNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PLT-${timestamp}-${random}`;
  }

  async create(data: {
    agencyId: Types.ObjectId;
    subscriptionId: Types.ObjectId;
    subtotal: number;
    taxAmount?: number;
    total: number;
    currency?: string;
    taxPercentage?: number;
    dueDate: Date;
    paymentMethod?: string;
    billingPeriodStart: Date;
    billingPeriodEnd: Date;
    notes?: string;
  }): Promise<PlatformInvoiceDocument> {
    const invoice = new PlatformInvoiceModel({
      ...data,
      agencyId: data.agencyId,
      subscriptionId: data.subscriptionId,
      invoiceNumber: this.generateInvoiceNumber(),
      subtotal: data.subtotal,
      taxAmount: data.taxAmount || 0,
      total: data.total,
      currency: data.currency || "INR",
      taxPercentage: data.taxPercentage || 0,
      dueDate: data.dueDate,
      paymentMethod: data.paymentMethod,
      billingPeriodStart: data.billingPeriodStart,
      billingPeriodEnd: data.billingPeriodEnd,
      notes: data.notes,
      status: "draft",
    });
    return invoice.save();
  }

  async findByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<PlatformInvoiceDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return PlatformInvoiceModel.findOne({ _id: id, agencyId }).exec();
  }

  async updateByIdAndAgency(
    id: Types.ObjectId,
    agencyId: Types.ObjectId,
    data: Partial<{
      status: "draft" | "sent" | "paid" | "overdue" | "void" | "refunded";
      paidAt: Date;
      paymentMethod: string;
      paymentReference: string;
      pdfUrl: string;
      pdfKey: string;
      notes: string;
    }>
  ): Promise<PlatformInvoiceDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return PlatformInvoiceModel.findOneAndUpdate({ _id: id, agencyId }, { $set: data }, { new: true }).exec();
  }

  async deleteByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<boolean> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await PlatformInvoiceModel.deleteOne({ _id: id, agencyId }).exec();
    return result.deletedCount === 1;
  }

  async listByAgency(agencyId: Types.ObjectId, query: PlatformInvoiceListQuery): Promise<{
    items: PlatformInvoiceLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search, status, dueFrom, dueTo, sortBy = "createdAt", sortOrder = "desc" } = query;

    const filter: Record<string, unknown> = { agencyId };
    if (status) filter.status = status;
    if (dueFrom || dueTo) {
      filter.dueDate = {};
      if (dueFrom) (filter.dueDate as Record<string, Date>).$gte = new Date(dueFrom);
      if (dueTo) (filter.dueDate as Record<string, Date>).$lte = new Date(dueTo);
    }
    if (search) {
      filter.$or = [{ invoiceNumber: { $regex: search, $options: "i" } }];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      PlatformInvoiceModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      PlatformInvoiceModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as PlatformInvoiceLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async listAll(query: PlatformInvoiceListQuery): Promise<{
    items: PlatformInvoiceLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search, status, agencyId, dueFrom, dueTo, sortBy = "createdAt", sortOrder = "desc" } = query;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (agencyId) filter.agencyId = new Types.ObjectId(agencyId);
    if (dueFrom || dueTo) {
      filter.dueDate = {};
      if (dueFrom) (filter.dueDate as Record<string, Date>).$gte = new Date(dueFrom);
      if (dueTo) (filter.dueDate as Record<string, Date>).$lte = new Date(dueTo);
    }
    if (search) {
      filter.$or = [{ invoiceNumber: { $regex: search, $options: "i" } }];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      PlatformInvoiceModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      PlatformInvoiceModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as PlatformInvoiceLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOverdueInvoices(agencyId: Types.ObjectId): Promise<PlatformInvoiceLean[]> {
    const now = new Date();
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return PlatformInvoiceModel.find({
      agencyId,
      status: { $in: ["sent", "overdue"] },
      dueDate: { $lt: now },
    }).lean().exec();
  }

  async getBySubscriptionId(subscriptionId: Types.ObjectId, agencyId: Types.ObjectId): Promise<PlatformInvoiceLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return PlatformInvoiceModel.find({ subscriptionId, agencyId }).sort({ createdAt: -1 }).lean().exec();
  }
}

export const platformInvoiceRepository = new PlatformInvoiceRepository();