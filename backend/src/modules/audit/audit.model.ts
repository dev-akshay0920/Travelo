import type { Document, Types } from "mongoose";
import { Schema, model, models } from "mongoose";

export type AuditLogAction =
  | "booking_status_changed"
  | "invoice_status_changed"
  | "task_status_changed"
  | "payment_recorded"
  | "staff_role_changed"
  | "staff_invited"
  | "staff_deactivated"
  | "invoice_payment_link_generated"
  | "booking_voucher_generated";

export interface AuditLogDocument extends Document {
  agencyId: Types.ObjectId;
  userId?: Types.ObjectId;
  action: AuditLogAction;
  entityType: string;
  entityId: Types.ObjectId;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<AuditLogDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    action: {
      type: String,
      enum: [
        "booking_status_changed",
        "invoice_status_changed",
        "task_status_changed",
        "payment_recorded",
        "staff_role_changed",
        "staff_invited",
        "staff_deactivated",
        "invoice_payment_link_generated",
        "booking_voucher_generated",
      ],
      required: true,
      index: true,
    },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    oldValues: { type: Schema.Types.Mixed },
    newValues: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditLogSchema.index({ agencyId: 1, createdAt: -1 });
AuditLogSchema.index({ agencyId: 1, action: 1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });

export const AuditLogModel = models.AuditLog || model<AuditLogDocument>("AuditLog", AuditLogSchema);
