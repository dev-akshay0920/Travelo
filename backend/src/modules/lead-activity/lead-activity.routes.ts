import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import { createLeadActivity, listLeadActivities } from "./lead-activity.controller";
import {
  createLeadActivitySchema,
  listLeadActivitiesQuerySchema,
} from "./lead-activity.validation";

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.post("/", validate(createLeadActivitySchema), createLeadActivity);
router.get("/", validate(listLeadActivitiesQuerySchema, "query"), listLeadActivities);

export const leadActivityRouter = router;