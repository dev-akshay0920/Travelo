import { Types } from "mongoose";
import { PayoutModel } from "./payout.model";
import type { PayoutDocument, PayoutStatus } from "./payout.model";

export interface PayoutListQuery {
  page?: number;
  limit?: number;
  staffId?: string;
  status?: PayoutStatus;
}

export interface PayoutListResponse {
  items: PayoutDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const payoutRepository = {
  async create(data: {
    agencyId: Types.ObjectId;
    staffId: Types.ObjectId;
    amount: number;
    currency?: string;
    status?: PayoutStatus;
    paidAt?: Date;
    notes?: string;
  }): Promise<PayoutDocument> {
    const payout = new PayoutModel({
      agencyId: data.agencyId,
      staffId: data.staffId,
      amount: data.amount,
      currency: data.currency || "INR",
      status: data.status || "paid",
      paidAt: data.paidAt || new Date(),
      notes: data.notes,
    });
    return payout.save();
  },

  async list(
    agencyId: Types.ObjectId,
    query: PayoutListQuery
  ): Promise<PayoutListResponse> {
    const { page = 1, limit = 20, staffId, status } = query;

    const filter: Record<string, unknown> = { agencyId };
    if (staffId) filter.staffId = new Types.ObjectId(staffId);
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      PayoutModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      PayoutModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items as PayoutDocument[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async updateStatus(
    id: Types.ObjectId,
    agencyId: Types.ObjectId,
    status: PayoutStatus
  ): Promise<PayoutDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return PayoutModel.findOneAndUpdate(
      { _id: id, agencyId },
      { $set: { status } },
      { new: true }
    ).exec();
  },
};
