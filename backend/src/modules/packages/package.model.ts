import { Schema, model, models } from "mongoose";
import type { Document, Types } from "mongoose";

export type PackageStatus = "draft" | "active" | "sold_out" | "completed" | "cancelled";

export type PackageVisibility = "private" | "public";

export type GeographicScope = "domestic" | "international" | "regional";

export type TripTheme =
  | "honeymoon"
  | "family"
  | "adventure"
  | "pilgrimage"
  | "corporate"
  | "leisure"
  | "weekend"
  | "custom";

export interface PackageDestination {
  city: string;
  state?: string;
  country?: string;
  days?: number;
}

export interface PackageDocument extends Document {
  agencyId: Types.ObjectId;
  ownerUserId: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  destination: string;
  destinations: PackageDestination[];
  geographicScope: GeographicScope;
  tripTheme: TripTheme;
  durationDays: number;
  durationNights: number;
  startDate: Date;
  endDate: Date;
  bookingDeadline?: Date;
  price: number;
  currency: string;
  priceType: "per_person" | "total";
  minTravelers: number;
  maxTravelers?: number;
  availableSeats: number;
  childPolicy?: string;
  infantPolicy?: string;
  taxType: "inclusive" | "exclusive" | "none";
  taxPercentage?: number;
  priceValidUntil?: Date;
  advancePercentage?: number;
  balanceDueDays?: number;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: {
    day: number;
    title: string;
    description: string;
    accommodation?: string;
    meals?: string[];
    highlights?: string[];
    distance?: string;
  }[];
  images?: {
    url: string;
    key: string;
    altText?: string;
    isPrimary: boolean;
    order: number;
    createdAt: Date;
  }[];
  highlights?: string[];
  termsAndConditions?: string;
  cancellationPolicy?: string;
  status: PackageStatus;
  visibility: PackageVisibility;
  isFeatured: boolean;
  meta?: {
    views?: number;
    inquiries?: number;
    bookings?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema<PackageDocument>(
  {
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
      index: true,
    },
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
      trim: true,
      maxlength: 30,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    destinations: [
      {
        city: { type: String, required: true, trim: true, maxlength: 100 },
        state: { type: String, trim: true, maxlength: 100 },
        country: { type: String, trim: true, maxlength: 100 },
        days: { type: Number, min: 1, max: 365 },
      },
    ],
    geographicScope: {
      type: String,
      enum: ["domestic", "international", "regional"],
      required: true,
    },
    tripTheme: {
      type: String,
      enum: [
        "honeymoon",
        "family",
        "adventure",
        "pilgrimage",
        "corporate",
        "leisure",
        "weekend",
        "custom",
      ],
      required: true,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
    },
    durationNights: {
      type: Number,
      required: true,
      min: 0,
      max: 364,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    bookingDeadline: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3,
      default: "INR",
    },
    priceType: {
      type: String,
      enum: ["per_person", "total"],
      required: true,
      default: "total",
    },
    minTravelers: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    maxTravelers: {
      type: Number,
      min: 1,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    childPolicy: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    infantPolicy: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    taxType: {
      type: String,
      enum: ["inclusive", "exclusive", "none"],
      required: true,
      default: "inclusive",
    },
    taxPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    priceValidUntil: {
      type: Date,
    },
    advancePercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    balanceDueDays: {
      type: Number,
      min: 0,
    },
    inclusions: {
      type: [String],
      default: [],
    },
    exclusions: {
      type: [String],
      default: [],
    },
    itinerary: {
      type: [
        {
          day: {
            type: Number,
            required: true,
          },
          title: {
            type: String,
            required: true,
            trim: true,
          },
          description: {
            type: String,
            required: true,
            trim: true,
          },
          meals: {
            type: [String],
            default: [],
          },
          accommodation: {
            type: String,
            trim: true,
          },
        },
      ],
      default: [],
    },
    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
          key: {
            type: String,
            required: true,
          },
          altText: {
            type: String,
            trim: true,
            maxlength: 120,
          },
          isPrimary: {
            type: Boolean,
            default: false,
          },
          order: {
            type: Number,
            default: 0,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    highlights: {
      type: [String],
      default: [],
    },
    termsAndConditions: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    cancellationPolicy: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ["draft", "active", "sold_out", "completed", "cancelled"],
      default: "draft",
      required: true,
      index: true,
    },
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
      required: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    meta: {
      views: { type: Number, default: 0 },
      inquiries: { type: Number, default: 0 },
      bookings: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

PackageSchema.index({ slug: 1 }, { unique: true });
PackageSchema.index({ status: 1, visibility: 1 });
PackageSchema.index({ isFeatured: -1, createdAt: -1 });

export const Package = models.Package || model<PackageDocument>("Package", PackageSchema);
