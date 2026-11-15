import { Router } from "express";
import { platformInvoiceController } from "./platform-invoice.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createPlatformInvoiceSchema,
  updatePlatformInvoiceSchema,
  getPlatformInvoiceSchema,
  listPlatformInvoicesSchema,
  deletePlatformInvoiceSchema,
  recordPaymentSchema,
} from "./platform-invoice.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createPlatformInvoiceSchema), platformInvoiceController.create);
router.get("/overdue", platformInvoiceController.getOverdue);
router.get("/subscription/:subscriptionId", platformInvoiceController.getBySubscription);
router.get("/", validate(listPlatformInvoicesSchema), platformInvoiceController.list);
router.get("/:id", validate(getPlatformInvoiceSchema), platformInvoiceController.getById);
router.put("/:id", validate(updatePlatformInvoiceSchema), platformInvoiceController.update);
router.post("/:id/payment", validate(recordPaymentSchema), platformInvoiceController.recordPayment);
router.delete("/:id", validate(deletePlatformInvoiceSchema), platformInvoiceController.delete);

export default router;