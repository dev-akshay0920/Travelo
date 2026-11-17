import { Types } from "mongoose";
import { InvoiceModel } from "../invoice/invoice.model";
import { StaffModel } from "../staff/staff.model";
import { BookingPaymentModel } from "../booking-payment/booking-payment.model";
import type {
  CommissionReportQuery,
  CommissionReportResponse,
  CommissionStaff,
} from "./report.types";

type PopulatedInvoice = {
  _id: Types.ObjectId;
  invoiceNumber: string;
  total: number;
  paidAmount: number;
  currency: string;
  status: string;
  dueDate?: Date;
  leadId:
    | Types.ObjectId
    | ({ _id?: Types.ObjectId; travelerName?: string; travelerEmail?: string } | null)
    | undefined;
  bookingId:
    | Types.ObjectId
    | ({ _id?: Types.ObjectId; bookingNumber?: string } | null)
    | undefined;
};

export interface OutstandingInvoice {
  id: string;
  invoiceNumber: string;
  leadId?: string;
  travellerName?: string;
  travellerEmail?: string;
  bookingId?: string;
  bookingNumber?: string;
  total: number;
  paidAmount: number;
  outstanding: number;
  currency: string;
  dueDate?: string;
  daysOverdue: number;
  status: "unpaid" | "partial";
}

export interface OutstandingReportQuery {
  page?: number;
  limit?: number;
}

export interface OutstandingReportResponse {
  items: OutstandingInvoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const reportService = {
  async outstanding(
    agencyId: Types.ObjectId,
    query: OutstandingReportQuery
  ): Promise<OutstandingReportResponse> {
    const { page = 1, limit = 50 } = query;
    const now = new Date();

    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const invoices = await InvoiceModel.find({
      agencyId,
      status: { $in: ["unpaid", "partial"] },
    })
      .populate("leadId", "travelerName travelerEmail")
      .populate("bookingId", "bookingNumber departureDate")
      .sort({ dueDate: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec() as unknown as PopulatedInvoice[];

    const total = await InvoiceModel.countDocuments({
      agencyId,
      status: { $in: ["unpaid", "partial"] },
    }).exec();

    const items: OutstandingInvoice[] = invoices.map((inv) => {
      const lead = inv.leadId as
        | { _id?: Types.ObjectId; travelerName?: string; travelerEmail?: string }
        | Types.ObjectId
        | null
        | undefined;
      const booking = inv.bookingId as
        | { _id?: Types.ObjectId; bookingNumber?: string }
        | Types.ObjectId
        | null
        | undefined;

      const leadPlain = lead && !(lead instanceof Types.ObjectId) ? lead : undefined;
      const bookingPlain = booking && !(booking instanceof Types.ObjectId) ? booking : undefined;

      const outstanding = Math.max(inv.total - (inv.paidAmount ?? 0), 0);
      const dueDate = inv.dueDate ? new Date(inv.dueDate) : undefined;
      const daysOverdue = dueDate
        ? Math.max(0, Math.ceil((now.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000)))
        : 0;
      return {
        id: String(inv._id),
        invoiceNumber: inv.invoiceNumber,
        leadId: leadPlain?._id ? String(leadPlain._id) : undefined,
        travellerName: leadPlain?.travelerName,
        travellerEmail: leadPlain?.travelerEmail,
        bookingId: bookingPlain?._id ? String(bookingPlain._id) : undefined,
        bookingNumber: bookingPlain?.bookingNumber,
        total: inv.total,
        paidAmount: inv.paidAmount ?? 0,
        outstanding,
        currency: inv.currency,
        dueDate: inv.dueDate?.toISOString(),
        daysOverdue,
        status: inv.status as OutstandingInvoice["status"],
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async commission(
    agencyId: Types.ObjectId,
    query: CommissionReportQuery
  ): Promise<CommissionReportResponse> {
    // @ts-expect-error Mongoose 8 model union typing
    const staff = await StaffModel.find({ agencyId }).lean().exec() as Array<{
      _id: Types.ObjectId;
      name: string;
      email: string;
      commissionRate?: number;
    }>;
    const staffMap = new Map(
      staff.map((s) => [
        String(s._id),
        { rate: s.commissionRate ?? 0, name: s.name, email: s.email },
      ])
    );
    const staffIds = staff.map((s) => s._id);

    const paidAtFilter: Record<string, unknown> = {};
    if (query.paidFrom) paidAtFilter.$gte = new Date(query.paidFrom);
    if (query.paidTo) paidAtFilter.$lte = new Date(query.paidTo);

    const match: Record<string, unknown> = {
      recordedBy: { $in: staffIds },
    };
    if (Object.keys(paidAtFilter).length > 0) {
      match.paidAt = paidAtFilter;
    }

    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const payments = await BookingPaymentModel.find(match)
      .sort({ paidAt: -1 })
      .lean()
      .exec() as Array<{ recordedBy: Types.ObjectId; amount: number }>;

    const byStaff = new Map<string, { totalPaid: number; count: number }>();
    for (const payment of payments) {
      const key = String(payment.recordedBy);
      const cur = byStaff.get(key) || { totalPaid: 0, count: 0 };
      byStaff.set(key, { totalPaid: cur.totalPaid + payment.amount, count: cur.count + 1 });
    }

    const items: CommissionStaff[] = [];
    let totalCommission = 0;
    for (const [staffId, data] of byStaff) {
      const info =
        (staffMap.get(staffId) as { rate: number; name: string; email: string } | undefined) ||
        { rate: 0, name: "Unknown", email: "" };
      const commission = (data.totalPaid * info.rate) / 100;
      totalCommission += commission;
      items.push({
        staffId,
        staffName: info.name,
        staffEmail: info.email,
        commissionRate: info.rate,
        totalPaid: data.totalPaid,
        paymentCount: data.count,
        commission,
      });
    }
    items.sort((a, b) => b.commission - a.commission);

    return {
      items,
      totalCommission,
      staffCount: items.length,
    };
  },
};
