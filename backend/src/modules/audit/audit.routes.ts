import { Router } from "express";
import { auditController } from "./audit.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { permissionMiddleware } from "../../middleware/permission.middleware";
import { z } from "zod";

const listAuditLogsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    action: z.string().optional(),
    entityType: z.string().optional(),
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  }),
});

const router = Router();

router.use(authMiddleware);

router.get(
  "/audit-logs",
  permissionMiddleware("audit_logs.read"),
  validate(listAuditLogsSchema),
  auditController.list
);

export default router;
