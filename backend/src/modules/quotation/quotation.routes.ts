import { Router } from "express";
import { quotationController } from "./quotation.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { permissionMiddleware } from "../../middleware/permission.middleware";
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

router.post("/", permissionMiddleware("quotations.write"), validate(createQuotationSchema), quotationController.create);
router.get("/status-counts", permissionMiddleware("quotations.read"), quotationController.getStatusCounts);
router.get("/lead/:leadId", permissionMiddleware("quotations.read"), quotationController.getByLeadId);
router.get("/", permissionMiddleware("quotations.read"), validate(listQuotationsSchema), quotationController.list);
router.get("/:id", permissionMiddleware("quotations.read"), validate(getQuotationSchema), quotationController.getById);
router.put("/:id", permissionMiddleware("quotations.write"), validate(updateQuotationSchema), quotationController.update);
router.post("/:id/send", permissionMiddleware("quotations.write"), quotationController.send);
router.post("/:id/accept", permissionMiddleware("quotations.write"), quotationController.accept);
router.delete("/:id", permissionMiddleware("quotations.delete"), validate(deleteQuotationSchema), quotationController.delete);

export default router;