import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createLead,
  getAgencyDashboard,
  getLead,
  listLeads,
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
router.get("/dashboard", getAgencyDashboard);
router.get("/", listLeads);
router.get("/:id", getLead);
router.patch("/:id", updateLead);

export const leadRouter = router;
