import { Router } from "express";
import { taskController } from "./task.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { permissionMiddleware } from "../../middleware/permission.middleware";
import { crmWriteRateLimiter } from "../../middleware/rate-limit.middleware";
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

router.post("/", permissionMiddleware("tasks.write"), crmWriteRateLimiter, validate(createTaskSchema), taskController.create);
router.get("/my-tasks", permissionMiddleware("tasks.read"), taskController.getMyTasks);
router.get("/upcoming", permissionMiddleware("tasks.read"), taskController.getUpcoming);
router.get("/overdue", permissionMiddleware("tasks.read"), taskController.getOverdue);
router.get("/status-counts", permissionMiddleware("tasks.read"), taskController.getStatusCounts);
router.get("/lead/:leadId", permissionMiddleware("tasks.read"), taskController.getByLeadId);
router.get("/booking/:bookingId", permissionMiddleware("tasks.read"), taskController.getByBookingId);
router.get("/", permissionMiddleware("tasks.read"), validate(listTasksSchema), taskController.list);
router.get("/:id", permissionMiddleware("tasks.read"), validate(getTaskSchema), taskController.getById);
router.put("/:id", permissionMiddleware("tasks.write"), crmWriteRateLimiter, validate(updateTaskSchema), taskController.update);
router.patch("/:id/status", permissionMiddleware("tasks.write"), crmWriteRateLimiter, validate(updateTaskStatusSchema), taskController.updateStatus);
router.patch("/:id/reminder-sent", permissionMiddleware("tasks.write"), crmWriteRateLimiter, taskController.markReminderSent);
router.delete("/:id", permissionMiddleware("tasks.delete"), crmWriteRateLimiter, validate(deleteTaskSchema), taskController.delete);

export default router;