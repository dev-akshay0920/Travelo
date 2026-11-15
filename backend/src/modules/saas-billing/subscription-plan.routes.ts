import { Router } from "express";
import { subscriptionPlanController } from "./subscription-plan.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
  getSubscriptionPlanSchema,
  listSubscriptionPlansSchema,
  deleteSubscriptionPlanSchema,
} from "./subscription-plan.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createSubscriptionPlanSchema), subscriptionPlanController.create);
router.get("/active", subscriptionPlanController.getActivePlans);
router.get("/:slug", subscriptionPlanController.getBySlug);
router.get("/", validate(listSubscriptionPlansSchema), subscriptionPlanController.list);
router.get("/:id", validate(getSubscriptionPlanSchema), subscriptionPlanController.getById);
router.put("/:id", validate(updateSubscriptionPlanSchema), subscriptionPlanController.update);
router.delete("/:id", validate(deleteSubscriptionPlanSchema), subscriptionPlanController.delete);

export default router;