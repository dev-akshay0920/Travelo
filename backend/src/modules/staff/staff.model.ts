import type { Document, Types } from "mongoose";
import { Schema, model, models } from "mongoose";

export type StaffRole = "owner" | "admin" | "manager" | "agent" | "accountant" | "viewer";

export interface StaffDocument extends Document {
  agencyId: Types.ObjectId;
  userId: Types.ObjectId;
  role: StaffRole;
  permissions: string[];
  isActive: boolean;
  invitedBy?: Types.ObjectId;
  joinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type StaffPermission =
  | "leads.read" | "leads.write" | "leads.delete"
  | "pipeline.read" | "pipeline.write"
  | "sources.read" | "sources.write"
  | "activities.read" | "activities.write"
  | "followups.read" | "followups.write"
  | "itineraries.read" | "itineraries.write" | "itineraries.delete"
  | "quotations.read" | "quotations.write" | "quotations.delete"
  | "bookings.read" | "bookings.write" | "bookings.delete"
  | "invoices.read" | "invoices.write" | "invoices.delete"
  | "payments.read" | "payments.write"
  | "suppliers.read" | "suppliers.write" | "suppliers.delete"
  | "documents.read" | "documents.write" | "documents.delete"
  | "tasks.read" | "tasks.write" | "tasks.delete"
  | "staff.read" | "staff.write" | "staff.delete"
  | "reports.read" | "settings.read" | "settings.write";

const StaffSchema = new Schema<StaffDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: {
      type: String,
      enum: ["owner", "admin", "manager", "agent", "accountant", "viewer"],
      required: true,
      default: "agent",
    },
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
    joinedAt: { type: Date },
  },
  { timestamps: true }
);

StaffSchema.index({ agencyId: 1, userId: 1 }, { unique: true });
StaffSchema.index({ agencyId: 1, isActive: 1 });
StaffSchema.index({ userId: 1, isActive: 1 });

export const StaffModel = models.Staff || model<StaffDocument>("Staff", StaffSchema);