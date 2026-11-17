import { Router } from "express";
import { invoiceController } from "./invoice.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { permissionMiddleware } from "../../middleware/permission.middleware";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  getInvoiceSchema,
  listInvoicesSchema,
  deleteInvoiceSchema,
  updateInvoiceStatusSchema,
  recordPaymentSchema,
  generatePaymentLinkSchema,
} from "./invoice.validation";

const router = Router();

router.use(authMiddleware);

router.get("/me", invoiceController.listMyInvoices);
router.post("/", permissionMiddleware("invoices.write"), validate(createInvoiceSchema), invoiceController.create);
router.get("/overdue", permissionMiddleware("invoices.read"), invoiceController.getOverdueInvoices);
router.get("/status-counts", permissionMiddleware("invoices.read"), invoiceController.getStatusCounts);
router.get("/booking/:bookingId", permissionMiddleware("invoices.read"), invoiceController.getByBookingId);
router.get("/lead/:leadId", permissionMiddleware("invoices.read"), invoiceController.getByLeadId);
router.get("/", permissionMiddleware("invoices.read"), validate(listInvoicesSchema), invoiceController.list);
router.get("/:id", permissionMiddleware("invoices.read"), validate(getInvoiceSchema), invoiceController.getById);
router.put("/:id", permissionMiddleware("invoices.write"), validate(updateInvoiceSchema), invoiceController.update);
router.patch("/:id/status", permissionMiddleware("invoices.write"), validate(updateInvoiceStatusSchema), invoiceController.updateStatus);
router.post("/:id/payment", permissionMiddleware("payments.write"), validate(recordPaymentSchema), invoiceController.recordPayment);
router.post("/:id/payment-link", permissionMiddleware("invoices.write"), validate(generatePaymentLinkSchema), invoiceController.generatePaymentLink);
router.delete("/:id", permissionMiddleware("invoices.delete"), validate(deleteInvoiceSchema), invoiceController.delete);

export default router;