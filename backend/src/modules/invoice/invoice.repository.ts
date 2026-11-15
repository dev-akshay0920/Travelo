import { Types } from "mongoose";
import { InvoiceModel } from "./invoice.model";
import type { InvoiceDocument } from "./invoice.model";
import type { InvoiceListQuery } from "./invoice.types";

interface InvoiceLean {
  _id: Types.ObjectId;
  agencyId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  leadId?: Types.ObjectId;
  invoiceNumber: string;
  type: "proforma" | "tax_invoice" | "receipt";
  status: "unpaid" | "partial" | "paid" | "overdue" | "cancelled";
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  gstin?: string;
  taxPercentage: number;
  dueDate?: Date;
  paidAmount: number;
  pdfUrl?: string;
  pdfKey?: string;
  paymentLinkUrl?: string;
  paymentLinkExpiresAt?: Date;
  notes?: string;
  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class InvoiceRepository {
  private generateInvoiceNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${timestamp}-${random}`;
  }

  async create(data: {
    agencyId: Types.ObjectId;
    bookingId?: Types.ObjectId;
    leadId?: Types.ObjectId;
    type: "proforma" | "tax_invoice" | "receipt";
    subtotal: number;
    taxAmount?: number;
    total: number;
    currency?: string;
    gstin?: string;
    taxPercentage?: number;
    dueDate?: Date;
    paidAmount?: number;
    notes?: string;
    termsAndConditions?: string;
  }): Promise<InvoiceDocument> {
    const invoice = new InvoiceModel({
      ...data,
      agencyId: data.agencyId,
      bookingId: data.bookingId,
      leadId: data.leadId,
      type: data.type,
      subtotal: data.subtotal,
      taxAmount: data.taxAmount || 0,
      total: data.total,
      currency: data.currency || "INR",
      gstin: data.gstin,
      taxPercentage: data.taxPercentage || 0,
      dueDate: data.dueDate,
      paidAmount: data.paidAmount || 0,
      invoiceNumber: this.generateInvoiceNumber(),
      notes: data.notes,
      termsAndConditions: data.termsAndConditions,
    });
    return invoice.save();
  }

  async findByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<InvoiceDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return InvoiceModel.findOne({ _id: id, agencyId }).exec();
  }

  async updateByIdAndAgency(
    id: Types.ObjectId,
    agencyId: Types.ObjectId,
    data: Partial<{
      bookingId: Types.ObjectId;
      leadId: Types.ObjectId;
      type: "proforma" | "tax_invoice" | "receipt";
      status: "unpaid" | "partial" | "paid" | "overdue" | "cancelled";
      subtotal: number;
      taxAmount: number;
      total: number;
      currency: string;
      gstin: string;
      taxPercentage: number;
      dueDate: Date;
      paidAmount: number;
      pdfUrl: string;
      pdfKey: string;
      paymentLinkUrl: string;
      paymentLinkExpiresAt: Date;
      notes: string;
      termsAndConditions: string;
    }>
  ): Promise<InvoiceDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return InvoiceModel.findOneAndUpdate({ _id: id, agencyId }, { $set: data }, { new: true }).exec();
  }

  async deleteByIdAndAgency(id: Types.ObjectId, agencyId: Types.ObjectId): Promise<boolean> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const result = await InvoiceModel.deleteOne({ _id: id, agencyId }).exec();
    return result.deletedCount === 1;
  }

  async listByAgency(agencyId: Types.ObjectId, query: InvoiceListQuery): Promise<{
    items: InvoiceLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, search, type, status, bookingId, leadId, sortBy = "createdAt", sortOrder = "desc" } = query;

    const filter: Record<string, unknown> = { agencyId };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (bookingId) filter.bookingId = new Types.ObjectId(bookingId);
    if (leadId) filter.leadId = new Types.ObjectId(leadId);
    if (search) {
      filter.$or = [{ invoiceNumber: { $regex: search, $options: "i" } }];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      InvoiceModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
      InvoiceModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as InvoiceLean[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getByBookingId(bookingId: Types.ObjectId, agencyId: Types.ObjectId): Promise<InvoiceLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return InvoiceModel.find({ bookingId, agencyId }).sort({ createdAt: -1 }).lean().exec();
  }

  async getByLeadId(leadId: Types.ObjectId, agencyId: Types.ObjectId): Promise<InvoiceLean[]> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return InvoiceModel.find({ leadId, agencyId }).sort({ createdAt: -1 }).lean().exec();
  }

  async countByStatus(agencyId: Types.ObjectId): Promise<Record<string, number>> {
    const result = await InvoiceModel.aggregate([
      { $match: { agencyId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).exec();
    return result.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});
  }

  async getOverdueInvoices(agencyId: Types.ObjectId): Promise<InvoiceLean[]> {
    const now = new Date();
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return InvoiceModel.find({
      agencyId,
      status: { $in: ["unpaid", "partial"] },
      dueDate: { $lt: now },
    }).sort({ dueDate: 1 }).lean().exec();
  }

  async updateStatus(id: Types.ObjectId, agencyId: Types.ObjectId, status: string): Promise<InvoiceDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return InvoiceModel.findOneAndUpdate({ _id: id, agencyId }, { $set: { status } }, { new: true }).exec();
  }

  async recordPayment(id: Types.ObjectId, agencyId: Types.ObjectId, amount: number): Promise<InvoiceDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return InvoiceModel.findOneAndUpdate(
      { _id: id, agencyId },
      { $inc: { paidAmount: amount }, $set: { status: { $cond: [{ $gte: ["$paidAmount", "$total"] }, "paid", "partial"] } } },
      { new: true }
    ).exec();
  }
}

export const invoiceRepository = new InvoiceRepository();