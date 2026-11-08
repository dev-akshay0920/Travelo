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

router.use(authMiddleware);
router.get("/me", getMyAgency);
router.post("/me", validate(createAgencySchema), createMyAgency);
router.post(
  "/me/logo",
  agencyLogoRateLimiter,
  singleFileUpload("file", MAX_AGENCY_LOGO_SIZE),
  uploadMyAgencyLogo
);
router.patch("/me", validate(updateAgencySchema), updateMyAgency);
router.post("/me/submit", validate(submitAgencySchema), submitMyAgency);

router.get("/slug/check", checkSlugAvailability);

router.get("/:slug", getPublicAgency);

export const agencyRouter = router;
