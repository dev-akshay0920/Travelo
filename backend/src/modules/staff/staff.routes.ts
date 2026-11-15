import { Router } from "express";
import { staffController } from "./staff.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createStaffSchema,
  updateStaffSchema,
  getStaffSchema,
  listStaffSchema,
  deleteStaffSchema,
  updateStaffRoleSchema,
} from "./staff.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createStaffSchema), staffController.create);
router.get("/role-counts", staffController.getRoleCounts);
router.get("/role/:role", staffController.getByRole);
router.get("/", validate(listStaffSchema), staffController.list);
router.get("/:id", validate(getStaffSchema), staffController.getById);
router.put("/:id", validate(updateStaffSchema), staffController.update);
router.patch("/:id/role", validate(updateStaffRoleSchema), staffController.update);
router.delete("/:id", validate(deleteStaffSchema), staffController.delete);

export default router;