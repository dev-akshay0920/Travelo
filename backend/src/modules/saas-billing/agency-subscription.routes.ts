import { Router } from "express";
import { agencySubscriptionController } from "./agency-subscription.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createAgencySubscriptionSchema,
  updateAgencySubscriptionSchema,
  getAgencySubscriptionSchema,
  listAgencySubscriptionsSchema,
  deleteAgencySubscriptionSchema,
  cancelSubscriptionSchema,
  reactivateSubscriptionSchema,
} from "./agency-subscription.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createAgencySubscriptionSchema), agencySubscriptionController.create);
router.get("/my", agencySubscriptionController.getMySubscription);
router.get("/expiring-trials", agencySubscriptionController.getExpiringTrials);
router.get("/past-due", agencySubscriptionController.getPastDue);
router.get("/upcoming-renewals", agencySubscriptionController.getUpcomingRenewals);
router.get("/status-counts", agencySubscriptionController.getStatusCounts);
router.get("/", validate(listAgencySubscriptionsSchema), agencySubscriptionController.list);
router.get("/:id", validate(getAgencySubscriptionSchema), agencySubscriptionController.getById);
router.put("/:id", validate(updateAgencySubscriptionSchema), agencySubscriptionController.update);
router.post("/:id/cancel", validate(cancelSubscriptionSchema), agencySubscriptionController.cancel);
router.post("/:id/reactivate", validate(reactivateSubscriptionSchema), agencySubscriptionController.reactivate);
router.post("/:id/payment", agencySubscriptionController.recordPayment);
router.delete("/:id", validate(deleteAgencySubscriptionSchema), agencySubscriptionController.delete);

export default router;