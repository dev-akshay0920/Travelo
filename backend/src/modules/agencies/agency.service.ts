import type { AgencyDocument, AgencyStatus } from "./agency.model";
import type { SubmitAgencyInput } from "./agency.types";
import { AgencyRepository } from "./agency.repository";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";
import { slugify } from "../../shared/utils/slugify";
import { Types } from "mongoose";

function makeSlug(baseName: string): string {
  const base = slugify(baseName).slice(0, 7);
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `${base}-${suffix}`.slice(0, 20);
}

export interface CreateAgencyInput {
  ownerUserId: string;
  name: string;
}

export interface UpdateAgencyInput {
  name?: string;
  slug?: string;
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
  services?: string[];
}

export const AgencyService = {
  async createDraft(input: CreateAgencyInput): Promise<AgencyDocument> {
    const { ownerUserId, name } = input;

    const existing = await AgencyRepository.findByOwnerUserId(ownerUserId);
    if (existing) {
      return existing;
    }

    const slug = makeSlug(name);

    const agency = await AgencyRepository.create({
      ownerUserId: new Types.ObjectId(ownerUserId),
      name,
      slug,
      status: "draft",
      location: {
        country: "",
        state: "",
        city: "",
        pincode: "",
      },
      contact: {
        phone: "",
        email: "",
      },
      services: [],
    });

    return agency;
  },

  async getMyAgency(ownerUserId: string): Promise<AgencyDocument | null> {
    return AgencyRepository.findByOwnerUserId(ownerUserId);
  },

  async updateMyAgencyLogo(
    ownerUserId: string,
    logo: { url: string; key: string; altText: string }
  ): Promise<{ agency: AgencyDocument; previousLogo: AgencyDocument["logo"] }> {
    const agency = await AgencyRepository.findByOwnerUserId(ownerUserId);
    if (!agency) {
      throw new NotFoundError("Agency profile not found.");
    }

    if (agency.status !== "draft" && agency.status !== "pending") {
      throw new ValidationError("Agency profile image cannot be changed in its current status.");
    }

    const previousLogo = agency.logo;
    const updated = await AgencyRepository.update(String(agency._id), { logo });
    if (!updated) {
      throw new NotFoundError("Agency profile not found.");
    }

    return { agency: updated, previousLogo };
  },

  async getPublicAgency(slug: string): Promise<AgencyDocument | null> {
    const agency = await AgencyRepository.findBySlug(slug);
    if (!agency || agency.status !== "approved") {
      return null;
    }
    return agency;
  },

  async findBySlugForUser(slug: string, excludeAgencyId?: string): Promise<AgencyDocument | null> {
    const query: Record<string, unknown> = { slug };

    if (excludeAgencyId) {
      query._id = { $ne: new Types.ObjectId(excludeAgencyId) };
    }

    return AgencyRepository.findOne(query);
  },

  async updateMyAgency(
    ownerUserId: string,
    data: UpdateAgencyInput
  ): Promise<AgencyDocument> {
    const agency = await AgencyRepository.findByOwnerUserId(ownerUserId);
    if (!agency) {
      throw new NotFoundError("Agency profile not found.");
    }

    const allowedStatuses: AgencyStatus[] = ["draft", "pending"];
    if (!allowedStatuses.includes(agency.status)) {
      throw new ValidationError("Agency profile cannot be edited in its current status.");
    }

    if (data.name !== undefined && data.name.trim() !== agency.name) {
      if (agency.status === "approved") {
        throw new ValidationError("Agency name cannot be changed after approval.");
      }
    }

    const updatePayload: UpdateAgencyInput = { ...data };

    if (updatePayload.slug === undefined || updatePayload.slug === null || updatePayload.slug.trim() === "") {
      if (updatePayload.name !== undefined && updatePayload.name.trim() !== agency.name) {
        updatePayload.slug = makeSlug(updatePayload.name.trim());
      }
    } else {
      updatePayload.slug = updatePayload.slug.trim().toLowerCase();
    }

    if (updatePayload.slug && updatePayload.slug !== agency.slug) {
      const existingWithSlug = await AgencyRepository.findBySlug(updatePayload.slug);
      if (existingWithSlug && String(existingWithSlug._id) !== String(agency._id)) {
        throw new ValidationError("This slug is already in use. Please choose another.");
      }
    }

    if (updatePayload.location) {
      const normalizedLocation: Record<string, unknown> = { ...updatePayload.location };

      if (normalizedLocation.country !== undefined) {
        normalizedLocation.country = String(normalizedLocation.country).trim().toLowerCase();
      }
      if (normalizedLocation.state !== undefined) {
        normalizedLocation.state = String(normalizedLocation.state).trim().toLowerCase();
      }
      if (normalizedLocation.city !== undefined) {
        normalizedLocation.city = String(normalizedLocation.city).trim().toLowerCase();
      }
      if (normalizedLocation.address !== undefined) {
        normalizedLocation.address = String(normalizedLocation.address).trim().toLowerCase();
      }
      if (normalizedLocation.pincode !== undefined) {
        normalizedLocation.pincode = String(normalizedLocation.pincode).trim().toLowerCase();
      }

      updatePayload.location = normalizedLocation as UpdateAgencyInput["location"];
    }

    if (updatePayload.contact) {
      const normalizedContact: Record<string, unknown> = { ...updatePayload.contact };

      if (normalizedContact.phone !== undefined) {
        normalizedContact.phone = String(normalizedContact.phone).trim().toLowerCase();
      }
      if (normalizedContact.email !== undefined) {
        normalizedContact.email = String(normalizedContact.email).trim().toLowerCase();
      }
      if (normalizedContact.website !== undefined) {
        normalizedContact.website = String(normalizedContact.website).trim().toLowerCase();
      }

      updatePayload.contact = normalizedContact as UpdateAgencyInput["contact"];
    }

    const updated = await AgencyRepository.update(String(agency._id), updatePayload);
    if (!updated) {
      throw new NotFoundError("Agency profile not found.");
    }

    return updated;
  },

  async submitForApproval(ownerUserId: string, data: SubmitAgencyInput): Promise<AgencyDocument> {
    const { action: _action, ...updateData } = data;
    const agency = await AgencyService.updateMyAgency(ownerUserId, updateData);

    if (agency.status === "approved") {
      throw new ValidationError("Agency is already approved.");
    }

    const updated = await AgencyRepository.updateStatus(String(agency._id), "pending");
    if (!updated) {
      throw new NotFoundError("Agency profile not found.");
    }

    return updated;
  },
};
