import { Router } from "express";
import { subscriptionPlanController } from "./subscription-plan.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
  getSubscriptionPlanSchema,
  listSubscriptionPlansSchema,
  deleteSubscriptionPlanSchema,
} from "./subscription-plan.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", roleMiddleware("admin"), validate(createSubscriptionPlanSchema), subscriptionPlanController.create);
router.get("/active", subscriptionPlanController.getActivePlans);
router.get("/", validate(listSubscriptionPlansSchema), subscriptionPlanController.list);
router.get(
  "/:id([0-9a-fA-F]{24})",
  validate(getSubscriptionPlanSchema),
  subscriptionPlanController.getById
);
router.get("/:slug", subscriptionPlanController.getBySlug);
router.put(
  "/:id([0-9a-fA-F]{24})",
  roleMiddleware("admin"),
  validate(updateSubscriptionPlanSchema),
  subscriptionPlanController.update
);
router.delete(
  "/:id([0-9a-fA-F]{24})",
  roleMiddleware("admin"),
  validate(deleteSubscriptionPlanSchema),
  subscriptionPlanController.delete
);

export default router;
