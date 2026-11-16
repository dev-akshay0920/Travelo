import { Router } from "express";
import { documentController } from "./document.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createDocumentSchema,
  updateDocumentSchema,
  getDocumentSchema,
  listDocumentsSchema,
  deleteDocumentSchema,
  uploadDocumentSchema,
} from "./document.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createDocumentSchema), documentController.create);
router.get("/lead/:leadId", documentController.getByLeadId);
router.get("/booking/:bookingId", documentController.getByBookingId);
router.get("/invoice/:invoiceId", documentController.getByInvoiceId);
router.get("/", validate(listDocumentsSchema), documentController.list);
router.post("/upload", validate(uploadDocumentSchema), documentController.upload);
router.get("/:id", validate(getDocumentSchema), documentController.getById);
router.put("/:id", validate(updateDocumentSchema), documentController.update);
router.delete("/:id", validate(deleteDocumentSchema), documentController.delete);

export default router;