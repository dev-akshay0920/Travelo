import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { LeadWebhookService } from "./lead-webhook.service";
import {
  metaWebhookVerifySchema,
  googleWebhookSchema,
} from "./lead-webhook.validation";
import { ForbiddenError } from "../../shared/errors/app-error";

const META_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN ?? "";
const GOOGLE_WEBHOOK_SECRET = process.env.GOOGLE_WEBHOOK_SECRET ?? "";

export const metaWebhookVerify = asyncHandler(async (req: Request, res: Response) => {
  const parsed = metaWebhookVerifySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Invalid verification request." },
    });
    return;
  }

  const { "hub.mode": mode, "hub.verify_token": verifyToken, "hub.challenge": challenge } =
    parsed.data;

  if (mode === "subscribe" && verifyToken === META_VERIFY_TOKEN && challenge) {
    res.status(HTTP_STATUS.OK).send(challenge);
    return;
  }

  res.status(HTTP_STATUS.FORBIDDEN).json({
    success: false,
    error: { code: "FORBIDDEN", message: "Verification token mismatch." },
  });
});

export const metaWebhookLead = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as unknown as {
    object?: string;
    entry?: Array<{
      id?: string;
      changes?: Array<{
        field?: string;
        value?: {
          leadgen_id?: string;
          created_time?: string;
          page_id?: string;
          adgroup_id?: string;
          ad_id?: string;
          form_id?: string;
          lead_data?: {
            full_name?: string;
            email?: string;
            phone_number?: string;
            [key: string]: unknown;
          };
        };
      }>;
    }>;
  };

  if (!body?.entry || !Array.isArray(body.entry)) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Invalid Meta webhook payload." },
    });
    return;
  }

  // Meta webhooks may include agencyId in a custom field; otherwise we cannot
  // determine the agency, so we require it in the payload context.
  const results: Array<{ leadgenId?: string; id?: string; isDuplicate?: boolean; error?: string }> = [];

  for (const entry of body.entry) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "leadgen") continue;
      const value = change.value;
      if (!value?.lead_data) continue;

      const leadgenId = value.leadgen_id;
      const leadData = value.lead_data;

      try {
        const result = await LeadWebhookService.createLeadFromWebhook({
          agencyId: (req.headers["x-agency-id"] as string) ?? "",
          travelerName: leadData.full_name ?? "Meta Lead",
          travelerEmail: leadData.email ?? "",
          travelerPhone: leadData.phone_number,
          message: `Meta Lead Ads lead (ad=${value.ad_id ?? "unknown"}, form=${value.form_id ?? "unknown"}).`,
          requestedStartDate: undefined,
          travelerCount: undefined,
          source: "meta",
          externalRef: leadgenId,
        });
        results.push({ leadgenId, id: result.id, isDuplicate: result.isDuplicate });
      } catch (err) {
        results.push({ leadgenId, error: err instanceof Error ? err.message : "Unknown error." });
      }
    }
  }

  res.status(HTTP_STATUS.OK).json(success({ results }));
});

export const googleWebhookLead = asyncHandler(async (req: Request, res: Response) => {
  const providedSecret = req.headers["x-webhook-secret"] as string | undefined;
  if (!GOOGLE_WEBHOOK_SECRET || providedSecret !== GOOGLE_WEBHOOK_SECRET) {
    throw new ForbiddenError("Invalid webhook secret.");
  }

  const parsed = googleWebhookSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Invalid Google webhook payload." },
    });
    return;
  }

  const { agencyId, lead } = parsed.data;
  const result = await LeadWebhookService.createLeadFromWebhook({
    agencyId,
    travelerName: lead.name,
    travelerEmail: lead.email,
    travelerPhone: lead.phone,
    message: lead.message,
    requestedStartDate: lead.requestedStartDate,
    travelerCount: lead.travelerCount,
    utmSource: lead.utmSource,
    utmMedium: lead.utmMedium,
    utmCampaign: lead.utmCampaign,
    source: "google",
  });

  res.status(HTTP_STATUS.OK).json(success({ id: result.id, isDuplicate: result.isDuplicate }));
});
