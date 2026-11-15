import { Router } from "express";
import { taskController } from "./task.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createTaskSchema,
  updateTaskSchema,
  getTaskSchema,
  listTasksSchema,
  deleteTaskSchema,
  updateTaskStatusSchema,
} from "./task.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createTaskSchema), taskController.create);
router.get("/my-tasks", taskController.getMyTasks);
router.get("/upcoming", taskController.getUpcoming);
router.get("/overdue", taskController.getOverdue);
router.get("/status-counts", taskController.getStatusCounts);
router.get("/lead/:leadId", taskController.getByLeadId);
router.get("/booking/:bookingId", taskController.getByBookingId);
router.get("/", validate(listTasksSchema), taskController.list);
router.get("/:id", validate(getTaskSchema), taskController.getById);
router.put("/:id", validate(updateTaskSchema), taskController.update);
router.patch("/:id/status", validate(updateTaskStatusSchema), taskController.updateStatus);
router.patch("/:id/reminder-sent", taskController.markReminderSent);
router.delete("/:id", validate(deleteTaskSchema), taskController.delete);

export default router;