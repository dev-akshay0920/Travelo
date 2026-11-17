import { Types } from "mongoose";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";
import { AgencyRepository } from "../agencies/agency.repository";
import { PackageRepository } from "../packages/package.repository";
import { LeadRepository } from "../leads/lead.repository";
import type { LeadDocument } from "../leads/lead.model";

interface WebhookLeadInput {
  agencyId: string;
  travelerName: string;
  travelerEmail: string;
  travelerPhone?: string;
  message?: string;
  requestedStartDate?: string;
  travelerCount?: number;
  packageId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  source: "meta" | "google";
  externalRef?: string;
}

export const LeadWebhookService = {
  async createLeadFromWebhook(input: WebhookLeadInput): Promise<{ id: string; isDuplicate: boolean }> {
    const agency = await AgencyRepository.findById(input.agencyId);
    if (!agency || agency.status !== "approved") {
      throw new NotFoundError("Agency not found or not approved.");
    }

    const normalizedEmail = input.travelerEmail.trim().toLowerCase();

    // Duplicate detection: same email (or phone) within agency, non-deleted.
    const existing = await LeadRepository.findDuplicateByAgency(
      input.agencyId,
      normalizedEmail,
      input.travelerPhone
    );
    if (existing) {
      return { id: String(existing._id), isDuplicate: true };
    }

    let packageName: string | undefined;
    if (input.packageId) {
      const pkg = await PackageRepository.findById(input.packageId);
      if (pkg && String(pkg.agencyId) === input.agencyId) {
        packageName = pkg.name;
      }
    }

    const requestedStartDate = input.requestedStartDate
      ? new Date(`${input.requestedStartDate}T00:00:00.000Z`)
      : undefined;

    const leadData: Partial<LeadDocument> = {
      agencyId: new Types.ObjectId(input.agencyId),
      ...(input.packageId ? { packageId: new Types.ObjectId(input.packageId) } : {}),
      ...(packageName ? { packageName } : {}),
      travelerId: new Types.ObjectId(),
      travelerName: input.travelerName.trim(),
      travelerEmail: normalizedEmail,
      ...(input.travelerPhone ? { travelerPhone: input.travelerPhone.trim() } : {}),
      message: input.message?.trim() || `Lead imported via ${input.source}.`,
      ...(requestedStartDate ? { requestedStartDate } : {}),
      ...(input.travelerCount !== undefined ? { travelerCount: input.travelerCount } : {}),
      status: "new",
      agencyNote: `Webhook lead (${input.source})${input.externalRef ? ` ref=${input.externalRef}` : ""}`,
      ...(input.utmSource ? { utmSource: input.utmSource } : {}),
      ...(input.utmMedium ? { utmMedium: input.utmMedium } : {}),
      ...(input.utmCampaign ? { utmCampaign: input.utmCampaign } : {}),
    };

    if (!leadData.travelerId) {
      throw new ValidationError("Traveller ID is required.");
    }

    const lead = await LeadRepository.create(leadData);
    return { id: String(lead._id), isDuplicate: false };
  },
};
