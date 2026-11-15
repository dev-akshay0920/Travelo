import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import {
  createLeadSource,
  deleteLeadSource,
  getLeadSource,
  listLeadSources,
  updateLeadSource,
} from "./lead-source.controller";
import {
  createLeadSourceSchema,
  listLeadSourcesQuerySchema,
  updateLeadSourceSchema,
} from "./lead-source.validation";

const router = Router();

router.use(authMiddleware);
router.post("/", validate(createLeadSourceSchema), createLeadSource);
router.get("/", validate(listLeadSourcesQuerySchema, "query"), listLeadSources);
router.get("/:id", getLeadSource);
router.patch("/:id", validate(updateLeadSourceSchema), updateLeadSource);
router.delete("/:id", deleteLeadSource);

export const leadSourceRouter = router;