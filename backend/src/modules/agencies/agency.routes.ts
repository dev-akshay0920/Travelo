import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { singleFileUpload } from "../../shared/uploads/single-file-upload.middleware";
import {
  getPublicAgency,
  getMyAgency,
  updateMyAgency,
  submitMyAgency,
  createMyAgency,
  checkSlugAvailability,
  uploadMyAgencyLogo,
} from "./agency.controller";
import {
  updateAgencySchema,
  submitAgencySchema,
  createAgencySchema,
} from "./agency.validation";
import { MAX_AGENCY_LOGO_SIZE } from "./agency-logo.storage";

const router = Router();

const agencyLogoRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many image uploads. Please try again later.",
    },
  },
});

router.get("/me", authMiddleware, getMyAgency);
router.get("/slug/check", authMiddleware, checkSlugAvailability);
router.get("/:slug", getPublicAgency);
router.post("/me", authMiddleware, validate(createAgencySchema), createMyAgency);
router.post(
  "/me/logo",
  authMiddleware,
  agencyLogoRateLimiter,
  singleFileUpload("file", MAX_AGENCY_LOGO_SIZE),
  uploadMyAgencyLogo
);
router.patch("/me", authMiddleware, validate(updateAgencySchema), updateMyAgency);
router.post("/me/submit", authMiddleware, validate(submitAgencySchema), submitMyAgency);

export const agencyRouter = router;
