import { Schema, model, models, Document, Types } from "mongoose";

export interface ItineraryDay {
  day: number;
  title: string;
  description?: string;
  accommodation?: string;
  meals?: string[];
  transport?: string;
  sightseeing?: string[];
  highlights?: string[];
  distance?: string;
  images?: { url: string; key: string; altText?: string }[];
}

export interface ItineraryDocument extends Document {
  agencyId: Types.ObjectId;
  leadId?: Types.ObjectId;
  packageId?: Types.ObjectId;
  name: string;
  destination: string;
  durationDays: number;
  durationNights: number;
  days: ItineraryDay[];
  totalPrice: number;
  currency: string;
  taxType: "inclusive" | "exclusive" | "none";
  taxPercentage: number;
  advancePercentage: number;
  isTemplate: boolean;
  templateCategory?: string;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ItineraryDaySchema = new Schema<ItineraryDay>(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    accommodation: { type: String, trim: true },
    meals: [{ type: String, trim: true }],
    transport: { type: String, trim: true },
    sightseeing: [{ type: String, trim: true }],
    highlights: [{ type: String, trim: true }],
    distance: { type: String, trim: true },
    images: [
      {
        url: { type: String, required: true },
        key: { type: String, required: true },
        altText: { type: String },
      },
    ],
  },
  { _id: false }
);

const ItinerarySchema = new Schema<ItineraryDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", index: true },
    packageId: { type: Schema.Types.ObjectId, ref: "Package", index: true },
    name: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    durationDays: { type: Number, required: true, min: 1 },
    durationNights: { type: Number, required: true, min: 0 },
    days: { type: [ItineraryDaySchema], default: [] },
    totalPrice: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    taxType: { type: String, enum: ["inclusive", "exclusive", "none"], default: "none" },
    taxPercentage: { type: Number, default: 0 },
    advancePercentage: { type: Number, default: 0, min: 0, max: 100 },
    isTemplate: { type: Boolean, default: false },
    templateCategory: { type: String, trim: true },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ItinerarySchema.index({ agencyId: 1, name: 1 });
ItinerarySchema.index({ agencyId: 1, isTemplate: 1 });
ItinerarySchema.index({ agencyId: 1, createdAt: -1 });

export const ItineraryModel =
  models.Itinerary || model<ItineraryDocument>("Itinerary", ItinerarySchema);