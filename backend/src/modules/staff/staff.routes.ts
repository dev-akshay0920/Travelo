import { Router } from "express";
import { staffController } from "./staff.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { permissionMiddleware } from "../../middleware/permission.middleware";
import { crmWriteRateLimiter, crmWriteStrictRateLimiter } from "../../middleware/rate-limit.middleware";
import {
  createStaffSchema,
  updateStaffSchema,
  getStaffSchema,
  listStaffSchema,
  deleteStaffSchema,
  inviteStaffSchema,
  updateStaffRoleSchema,
} from "./staff.validation";

const router = Router();

router.use(authMiddleware);

router.post("/invite", permissionMiddleware("staff.write"), crmWriteStrictRateLimiter, validate(inviteStaffSchema), staffController.invite);
router.post("/", permissionMiddleware("staff.write"), crmWriteRateLimiter, validate(createStaffSchema), staffController.create);
router.get("/role-counts", permissionMiddleware("staff.read"), staffController.getRoleCounts);
router.get("/role/:role", permissionMiddleware("staff.read"), staffController.getByRole);
router.get("/", permissionMiddleware("staff.read"), validate(listStaffSchema), staffController.list);
router.get("/:id", permissionMiddleware("staff.read"), validate(getStaffSchema), staffController.getById);
router.put("/:id", permissionMiddleware("staff.write"), crmWriteRateLimiter, validate(updateStaffSchema), staffController.update);
router.patch("/:id/role", permissionMiddleware("staff.write"), crmWriteRateLimiter, validate(updateStaffRoleSchema), staffController.update);
router.delete("/:id", permissionMiddleware("staff.delete"), crmWriteRateLimiter, validate(deleteStaffSchema), staffController.delete);

export default router;