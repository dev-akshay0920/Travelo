import { Schema, model, models } from "mongoose";
import type { Document } from "mongoose";

export type RoleKey = "traveller" | "agency" | "admin";

export interface RoleDocument extends Document {
  key: RoleKey;
  name: string;
  description?: string;
  isActive: boolean;
  isAssignableDuringSignup: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<RoleDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 50,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAssignableDuringSignup: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Role = models.Role || model<RoleDocument>("Role", RoleSchema);
