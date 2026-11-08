import { Types } from "mongoose";
import type { AgencyDocument, AgencyStatus } from "./agency.model";
import { Agency } from "./agency.model";

export interface AgencyCreateInput {
  ownerUserId: Types.ObjectId;
  name: string;
  slug: string;
  status?: AgencyStatus;
  location?: {
    country?: string;
    state?: string;
    city?: string;
    pincode?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
  };
  services?: string[];
}

export interface AgencyUpdateInput {
  name?: string;
  slug?: string;
  logo?: { url: string; key?: string; altText?: string } | null;
  about?: string;
  yearEstablished?: number;
  location?: {
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    pincode?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  services?: string[];
  status?: AgencyStatus;
}

export const AgencyRepository = {
  async findById(id: string): Promise<AgencyDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return (await Agency.findById(id).exec()) as Promise<AgencyDocument | null>;
  },

  async findBySlug(slug: string): Promise<AgencyDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return (await Agency.findOne({ slug: slug.toLowerCase() }).exec()) as Promise<AgencyDocument | null>;
  },

  async findOne(query: Record<string, unknown>): Promise<AgencyDocument | null> {
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return (await Agency.findOne(query).exec()) as Promise<AgencyDocument | null>;
  },

  async findByOwnerUserId(ownerUserId: string): Promise<AgencyDocument | null> {
    if (!Types.ObjectId.isValid(ownerUserId)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return (await Agency.findOne({ ownerUserId }).exec()) as Promise<AgencyDocument | null>;
  },

  async findByOwnerUserIdWithStatus(
    ownerUserId: string,
    status: AgencyStatus
  ): Promise<AgencyDocument | null> {
    if (!Types.ObjectId.isValid(ownerUserId)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return (await Agency.findOne({ ownerUserId, status }).exec()) as Promise<AgencyDocument | null>;
  },

  async create(data: AgencyCreateInput): Promise<AgencyDocument> {
    const agency = new Agency(data);
    return agency.save();
  },

  async update(id: string, data: AgencyUpdateInput): Promise<AgencyDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const updated = await Agency.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
    if (!updated) {
      return null;
    }
    return updated as Promise<AgencyDocument | null>;
  },

  async updateStatus(id: string, status: AgencyStatus): Promise<AgencyDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const updated = await Agency.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!updated) {
      return null;
    }
    return updated as Promise<AgencyDocument | null>;
  },
};
