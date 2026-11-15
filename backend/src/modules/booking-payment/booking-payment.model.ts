import { Schema, model, models, Document, Types } from "mongoose";

export interface BookingPaymentDocument extends Document {
  agencyId: Types.ObjectId;
  bookingId: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  amount: number;
  currency: string;
  method: "cash" | "bank_transfer" | "cheque" | "online_link" | "razorpay" | "stripe";
  transactionId?: string;
  paidAt: Date;
  notes?: string;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookingPaymentSchema = new Schema<BookingPaymentDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", index: true },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, default: "INR" },
    method: {
      type: String,
      enum: ["cash", "bank_transfer", "cheque", "online_link", "razorpay", "stripe"],
      required: true,
    },
    transactionId: { type: String, trim: true },
    paidAt: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

BookingPaymentSchema.index({ agencyId: 1, bookingId: 1 });
BookingPaymentSchema.index({ agencyId: 1, paidAt: -1 });
BookingPaymentSchema.index({ bookingId: 1, paidAt: -1 });

export const BookingPaymentModel = models.BookingPayment || model<BookingPaymentDocument>("BookingPayment", BookingPaymentSchema);