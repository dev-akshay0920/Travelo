import { Schema, model, models } from "mongoose";
import type { Document, Types } from "mongoose";

export type UserStatus = "active" | "pending" | "suspended";

export interface UserDocument extends Document {
  roleId: Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  authProvider?: "email_password" | "google";
  googleId?: string;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    passwordHash: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ["email_password", "google"],
      default: "email_password",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["active", "pending", "suspended"],
      default: "active",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = models.User || model<UserDocument>("User", UserSchema);
