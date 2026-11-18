import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import { crmWriteRateLimiter } from "../../middleware/rate-limit.middleware";
import {
  createFollowUpReminder,
  deleteFollowUpReminder,
  getDueFollowUpReminders,
  listFollowUpReminders,
  updateFollowUpReminder,
} from "./follow-up-reminder.controller";
import {
  createFollowUpReminderSchema,
  listFollowUpRemindersQuerySchema,
  updateFollowUpReminderSchema,
} from "./follow-up-reminder.validation";

const router = Router();

router.use(authMiddleware);
router.post("/", validate(createFollowUpReminderSchema), crmWriteRateLimiter, createFollowUpReminder);
router.get("/", validate(listFollowUpRemindersQuerySchema, "query"), listFollowUpReminders);
router.get("/due", getDueFollowUpReminders);
router.patch("/:id", validate(updateFollowUpReminderSchema), crmWriteRateLimiter, updateFollowUpReminder);
router.delete("/:id", crmWriteRateLimiter, deleteFollowUpReminder);

export const followUpReminderRouter = router;