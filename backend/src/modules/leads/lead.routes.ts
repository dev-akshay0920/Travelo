import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../../middleware/auth.middleware";
import { permissionMiddleware } from "../../middleware/permission.middleware";
import { validate } from "../../middleware/validation.middleware";
import { mergeLeadsSchema } from "./lead.validation";
import {
  bulkImportLeads,
  createAgencyLead,
  createLead,
  getAgencyDashboard,
  getMyLead,
  getLead,
  listMyLeads,
  listLeads,
  mergeLeads,
  restoreLead,
  softDeleteLead,
  updateLead,
} from "./lead.controller";

const router = Router();

const createLeadIpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many inquiries. Please try again later.",
    },
  },
});

const createLeadAccountRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => req.user?.sub ?? "unauthenticated",
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many inquiries. Please try again later.",
    },
  },
});

router.use(authMiddleware);
router.post("/", createLeadIpRateLimit, createLeadAccountRateLimit, createLead);
router.post("/agency", permissionMiddleware("leads.write"), createAgencyLead);
router.post("/bulk-import", bulkImportLeads);
router.get("/dashboard", permissionMiddleware("leads.read"), getAgencyDashboard);
router.get("/mine", listMyLeads);
router.get("/mine/:id", getMyLead);
router.get("/", permissionMiddleware("leads.read"), listLeads);
router.get("/:id", permissionMiddleware("leads.read"), getLead);
router.patch("/:id", permissionMiddleware("leads.write"), updateLead);
router.patch("/:id/soft-delete", permissionMiddleware("leads.write"), softDeleteLead);
router.patch("/:id/restore", permissionMiddleware("leads.write"), restoreLead);
router.post("/:id/merge", permissionMiddleware("leads.write"), validate(mergeLeadsSchema), mergeLeads);

export const leadRouter = router;
