import { Schema, model, models } from "mongoose";
import type { Document, Types } from "mongoose";

export type FollowUpChannel = "phone" | "email" | "whatsapp" | "meeting";

export interface FollowUpReminderDocument extends Document {
  agencyId: Types.ObjectId;
  leadId: Types.ObjectId;
  staffId: Types.ObjectId;
  reminderAt: Date;
  title: string;
  notes?: string;
  isCompleted: boolean;
  completedAt?: Date;
  channel: FollowUpChannel;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpReminderSchema = new Schema<FollowUpReminderDocument>(
  {
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reminderAt: {
      type: Date,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    channel: {
      type: String,
      enum: ["phone", "email", "whatsapp", "meeting"],
      required: true,
    },
  },
  { timestamps: true }
);

FollowUpReminderSchema.index({ agencyId: 1, staffId: 1, isCompleted: 1 });
FollowUpReminderSchema.index({ reminderAt: 1 });
FollowUpReminderSchema.index({ leadId: 1, reminderAt: -1 });

export const FollowUpReminder =
  models.FollowUpReminder ||
  model<FollowUpReminderDocument>("FollowUpReminder", FollowUpReminderSchema);