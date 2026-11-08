import { Schema, model, models } from "mongoose";
import type { Document, Types } from "mongoose";

export type AgencyService =
  | "tour_packages"
  | "flight_booking"
  | "hotel_booking"
  | "honeymoon_trips"
  | "family_holidays"
  | "adventure_trips"
  | "pilgrimage_tours"
  | "corporate_travel"
  | "visa_assistance"
  | "international_tours"
  | "domestic_tours";

export type AgencyStatus = "draft" | "pending" | "approved" | "rejected" | "suspended";

export interface AgencyDocument extends Document {
  ownerUserId: Types.ObjectId;
  name: string;
  slug: string;
  logo: { url: string; key?: string; altText?: string } | null;
  about?: string;
  yearEstablished?: number;
  location?: {
    country?: string;
    state?: string;
    city?: string;
    address?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  services?: AgencyService[];
  status: AgencyStatus;
  createdAt: Date;
  updatedAt: Date;
}

const AgencySchema = new Schema<AgencyDocument>(
  {
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
    },
    logo: {
      type: {
        url: {
          type: String,
          required: true,
        },
        key: {
          type: String,
          trim: true,
        },
        altText: {
          type: String,
          maxlength: 120,
        },
      },
      required: false,
      default: null,
    },
    about: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    yearEstablished: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
    },
    location: {
      country: { type: String, trim: true, maxlength: 80 },
      state: { type: String, trim: true, maxlength: 80 },
      city: { type: String, trim: true, maxlength: 80 },
      address: { type: String, trim: true, maxlength: 255 },
      pincode: { type: String, trim: true, maxlength: 10 },
    },
    contact: {
      phone: { type: String, trim: true, maxlength: 20 },
      email: { type: String, trim: true, maxlength: 120 },
      website: { type: String, trim: true, maxlength: 120 },
    },
    services: [
      {
        type: String,
        enum: [
          "tour_packages",
          "flight_booking",
          "hotel_booking",
          "honeymoon_trips",
          "family_holidays",
          "adventure_trips",
          "pilgrimage_tours",
          "corporate_travel",
          "visa_assistance",
          "international_tours",
          "domestic_tours",
        ],
      },
    ],
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "suspended"],
      default: "draft",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Agency = models.Agency || model<AgencyDocument>("Agency", AgencySchema);

AgencySchema.index({ status: 1, slug: 1 });
