import { Router } from "express";
import { quotationController } from "./quotation.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createQuotationSchema,
  updateQuotationSchema,
  getQuotationSchema,
  listQuotationsSchema,
  deleteQuotationSchema,
  publicQuotationSchema,
} from "./quotation.validation";

const router = Router();

router.get("/public/:token", validate(publicQuotationSchema), quotationController.getPublic);
router.post("/public/:token/accept", validate(publicQuotationSchema), quotationController.acceptPublic);

router.use(authMiddleware);

router.post("/", validate(createQuotationSchema), quotationController.create);
router.get("/status-counts", quotationController.getStatusCounts);
router.get("/lead/:leadId", quotationController.getByLeadId);
router.get("/", validate(listQuotationsSchema), quotationController.list);
router.get("/:id", validate(getQuotationSchema), quotationController.getById);
router.put("/:id", validate(updateQuotationSchema), quotationController.update);
router.post("/:id/send", quotationController.send);
router.post("/:id/accept", quotationController.accept);
router.delete("/:id", validate(deleteQuotationSchema), quotationController.delete);

export default router;