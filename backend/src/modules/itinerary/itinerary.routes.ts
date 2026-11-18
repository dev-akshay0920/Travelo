import { Router } from "express";
import { itineraryController } from "./itinerary.controller";
import { validate } from "../../middleware/validation.middleware";
import { crmWriteRateLimiter, crmWriteStrictRateLimiter } from "../../middleware/rate-limit.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createItinerarySchema,
  updateItinerarySchema,
  getItinerarySchema,
  listItinerariesSchema,
  deleteItinerarySchema,
  aiGenerateItinerarySchema,
} from "./itinerary.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createItinerarySchema), crmWriteRateLimiter, itineraryController.create);
router.post("/ai-generate", validate(aiGenerateItinerarySchema), crmWriteStrictRateLimiter, itineraryController.generateAi);
router.get("/templates", itineraryController.getTemplates);
router.get("/", validate(listItinerariesSchema), itineraryController.list);
router.get("/:id", validate(getItinerarySchema), itineraryController.getById);
router.put("/:id", validate(updateItinerarySchema), crmWriteRateLimiter, itineraryController.update);
router.post("/:id/duplicate", crmWriteRateLimiter, itineraryController.duplicate);
router.delete("/:id", validate(deleteItinerarySchema), crmWriteRateLimiter, itineraryController.delete);

export default router;