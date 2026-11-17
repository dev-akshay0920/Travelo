import { Router } from "express";
import { validate } from "../../middleware/validation.middleware";
import {
  metaWebhookVerify,
  metaWebhookLead,
  googleWebhookLead,
} from "./lead-webhook.controller";
import { metaWebhookVerifySchema, googleWebhookSchema } from "./lead-webhook.validation";

const router = Router();

// Meta Lead Ads webhook verification (GET) and lead ingestion (POST).
router.get("/meta", validate(metaWebhookVerifySchema, "query"), metaWebhookVerify);
router.post("/meta", metaWebhookLead);

// Google Lead Form webhook ingestion.
router.post("/google", validate(googleWebhookSchema), googleWebhookLead);

export const leadWebhookRouter = router;
