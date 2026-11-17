import { Router } from "express";
import { reportController } from "./report.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { permissionMiddleware } from "../../middleware/permission.middleware";
import {
  listOutstandingReportSchema,
  commissionReportSchema,
} from "./report.validation";

const router = Router();

router.use(authMiddleware);

router.get(
  "/outstanding",
  permissionMiddleware("reports.read"),
  validate(listOutstandingReportSchema),
  reportController.outstanding
);
router.get(
  "/commission",
  permissionMiddleware("reports.read"),
  validate(commissionReportSchema),
  reportController.commission
);

export default router;
