import { Schema, model, models, Document, Types } from "mongoose";

export interface TaskDocument extends Document {
  agencyId: Types.ObjectId;
  title: string;
  description?: string;
  type: "call" | "email" | "meeting" | "follow_up" | "document" | "payment" | "booking" | "other";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  dueAt?: Date;
  completedAt?: Date;
  assignedTo: Types.ObjectId;
  createdBy: Types.ObjectId;
  leadId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  documentId?: Types.ObjectId;
  reminderAt?: Date;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<TaskDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    type: {
      type: String,
      enum: ["call", "email", "meeting", "follow_up", "document", "payment", "booking", "other"],
      required: true,
      default: "other",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      required: true,
      default: "pending",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      required: true,
      default: "medium",
    },
    dueAt: { type: Date, index: true },
    completedAt: { type: Date },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", index: true },
    documentId: { type: Schema.Types.ObjectId, ref: "DocumentFile", index: true },
    reminderAt: { type: Date, index: true },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TaskSchema.index({ agencyId: 1, status: 1 });
TaskSchema.index({ agencyId: 1, assignedTo: 1, status: 1 });
TaskSchema.index({ agencyId: 1, dueAt: 1, status: 1 });
TaskSchema.index({ leadId: 1, status: 1 });
TaskSchema.index({ bookingId: 1, status: 1 });

export const TaskModel = models.Task || model<TaskDocument>("Task", TaskSchema);