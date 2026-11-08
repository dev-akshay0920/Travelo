import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  listPackages,
  listUpcomingPackages,
  listCurrentPackages,
  listHistoryPackages,
  getPackage,
  createPackage,
  updatePackage,
  updatePackageStatus,
  deletePackage,
  uploadPackageImages,
  deletePackageImage,
  setPrimaryImage,
  reorderImages,
  getPresignedUploadUrl,
} from "./package.controller";
import { policyTemplateRouter } from "./policy-template.routes";

const router = Router();

router.use(authMiddleware);

router.use("/templates", policyTemplateRouter);

router.get("/", listPackages);
router.get("/upcoming", listUpcomingPackages);
router.get("/current", listCurrentPackages);
router.get("/history", listHistoryPackages);
router.get("/:id", getPackage);
router.post("/", createPackage);
router.patch("/:id", updatePackage);
router.patch("/:id/status", updatePackageStatus);
router.delete("/:id", deletePackage);

router.post("/:id/images", uploadPackageImages);
router.get("/:id/images/presigned-url", getPresignedUploadUrl);
router.delete("/:id/images/:imageId", deletePackageImage);
router.patch("/:id/images/:imageId/primary", setPrimaryImage);
router.patch("/:id/images/reorder", reorderImages);

export const packageRouter = router;