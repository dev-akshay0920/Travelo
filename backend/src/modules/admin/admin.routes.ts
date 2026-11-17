import { Router } from "express";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import { adminController } from "./admin.controller";
import {
  listAgenciesSchema,
  getAgencySchema,
  updateAgencyStatusSchema,
  listUsersSchema,
  getUserSchema,
  updateUserStatusSchema,
  createPayoutSchema,
  listPayoutsSchema,
} from "./admin.validation";

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/agencies", validate(listAgenciesSchema), adminController.listAgencies);
router.get("/agencies/:id", validate(getAgencySchema), adminController.getAgency);
router.patch(
  "/agencies/:id/status",
  validate(updateAgencyStatusSchema),
  adminController.updateAgencyStatus
);
router.get("/users", validate(listUsersSchema), adminController.listUsers);
router.get("/users/:id", validate(getUserSchema), adminController.getUser);
router.patch(
  "/users/:id/status",
  validate(updateUserStatusSchema),
  adminController.updateUserStatus
);
router.post("/payouts", validate(createPayoutSchema), adminController.createPayout);
router.get("/payouts", validate(listPayoutsSchema), adminController.listPayouts);

export default router;
