import { Router } from "express";
import { invoiceController } from "./invoice.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  getInvoiceSchema,
  listInvoicesSchema,
  deleteInvoiceSchema,
  updateInvoiceStatusSchema,
  recordPaymentSchema,
} from "./invoice.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createInvoiceSchema), invoiceController.create);
router.get("/overdue", invoiceController.getOverdueInvoices);
router.get("/status-counts", invoiceController.getStatusCounts);
router.get("/booking/:bookingId", invoiceController.getByBookingId);
router.get("/lead/:leadId", invoiceController.getByLeadId);
router.get("/", validate(listInvoicesSchema), invoiceController.list);
router.get("/:id", validate(getInvoiceSchema), invoiceController.getById);
router.put("/:id", validate(updateInvoiceSchema), invoiceController.update);
router.patch("/:id/status", validate(updateInvoiceStatusSchema), invoiceController.updateStatus);
router.post("/:id/payment", validate(recordPaymentSchema), invoiceController.recordPayment);
router.delete("/:id", validate(deleteInvoiceSchema), invoiceController.delete);

export default router;