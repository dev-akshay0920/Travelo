import { Router } from "express";
import { staffController } from "./staff.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { permissionMiddleware } from "../../middleware/permission.middleware";
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

router.post("/invite", permissionMiddleware("staff.write"), validate(inviteStaffSchema), staffController.invite);
router.post("/", permissionMiddleware("staff.write"), validate(createStaffSchema), staffController.create);
router.get("/role-counts", permissionMiddleware("staff.read"), staffController.getRoleCounts);
router.get("/role/:role", permissionMiddleware("staff.read"), staffController.getByRole);
router.get("/", permissionMiddleware("staff.read"), validate(listStaffSchema), staffController.list);
router.get("/:id", permissionMiddleware("staff.read"), validate(getStaffSchema), staffController.getById);
router.put("/:id", permissionMiddleware("staff.write"), validate(updateStaffSchema), staffController.update);
router.patch("/:id/role", permissionMiddleware("staff.write"), validate(updateStaffRoleSchema), staffController.update);
router.delete("/:id", permissionMiddleware("staff.delete"), validate(deleteStaffSchema), staffController.delete);

export default router;