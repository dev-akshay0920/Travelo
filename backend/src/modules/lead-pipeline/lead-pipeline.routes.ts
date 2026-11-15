import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import {
  createLeadPipeline,
  deleteLeadPipeline,
  getLeadPipeline,
  listLeadPipelines,
  updateLeadPipeline,
} from "./lead-pipeline.controller";
import {
  createLeadPipelineSchema,
  listLeadPipelinesQuerySchema,
  updateLeadPipelineSchema,
} from "./lead-pipeline.validation";

const router = Router();

router.use(authMiddleware);
router.post("/", validate(createLeadPipelineSchema), createLeadPipeline);
router.get("/", validate(listLeadPipelinesQuerySchema, "query"), listLeadPipelines);
router.get("/:id", getLeadPipeline);
router.patch("/:id", validate(updateLeadPipelineSchema), updateLeadPipeline);
router.delete("/:id", deleteLeadPipeline);

export const leadPipelineRouter = router;