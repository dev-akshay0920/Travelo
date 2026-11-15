import { Schema, model, models, Document, Types } from "mongoose";

export interface TravellerRoster {
  name: string;
  passportNumber?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  email?: string;
  phone?: string;
}

export interface SupplierBooking {
  supplierId: Types.ObjectId;
  referenceNumber?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  rooms?: number;
  totalCost: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled";
  documentUrl?: string;
}

export interface BookingDocument extends Document {
  agencyId: Types.ObjectId;
  leadId?: Types.ObjectId;
  quotationId?: Types.ObjectId;
  bookingNumber: string;
  travellerId?: Types.ObjectId;
  travellers: TravellerRoster[];
  packageId?: Types.ObjectId;
  itineraryId?: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: "enquiry" | "quoted" | "deposit_paid" | "confirmed" | "completed" | "cancelled" | "refunded";
  totalPrice: number;
  paidAmount: number;
  currency: string;
  departureDate: Date;
  staffId?: Types.ObjectId;
  supplierBookings: SupplierBooking[];
  voucherUrl?: string;
  voucherKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TravellerRosterSchema = new Schema<TravellerRoster>(
  {
    name: { type: String, required: true, trim: true },
    passportNumber: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: false }
);

const SupplierBookingSchema = new Schema<SupplierBooking>(
  {
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    referenceNumber: { type: String, trim: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    guests: { type: Number },
    rooms: { type: Number },
    totalCost: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    documentUrl: { type: String },
  },
  { _id: false }
);

const BookingSchema = new Schema<BookingDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", index: true },
    quotationId: { type: Schema.Types.ObjectId, ref: "Quotation", index: true },
    bookingNumber: { type: String, required: true, unique: true },
    travellerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    travellers: { type: [TravellerRosterSchema], required: true, validate: (v: TravellerRoster[]) => v.length > 0 },
    packageId: { type: Schema.Types.ObjectId, ref: "Package", index: true },
    itineraryId: { type: Schema.Types.ObjectId, ref: "Itinerary", index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["enquiry", "quoted", "deposit_paid", "confirmed", "completed", "cancelled", "refunded"],
      default: "enquiry",
      index: true,
    },
    totalPrice: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    departureDate: { type: Date, required: true, index: true },
    staffId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    supplierBookings: { type: [SupplierBookingSchema], default: [] },
    voucherUrl: { type: String },
    voucherKey: { type: String },
  },
  { timestamps: true }
);

BookingSchema.index({ agencyId: 1, status: 1 });
BookingSchema.index({ agencyId: 1, departureDate: 1 });
BookingSchema.index({ agencyId: 1, createdAt: -1 });
BookingSchema.index({ leadId: 1, status: 1 });
BookingSchema.index({ quotationId: 1 });

export const BookingModel = models.Booking || model<BookingDocument>("Booking", BookingSchema);