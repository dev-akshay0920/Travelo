import { Router } from "express";
import { documentController } from "./document.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { permissionMiddleware } from "../../middleware/permission.middleware";
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

router.post("/", permissionMiddleware("documents.write"), validate(createDocumentSchema), documentController.create);
router.get("/lead/:leadId", permissionMiddleware("documents.read"), documentController.getByLeadId);
router.get("/booking/:bookingId", permissionMiddleware("documents.read"), documentController.getByBookingId);
router.get("/invoice/:invoiceId", permissionMiddleware("documents.read"), documentController.getByInvoiceId);
router.get("/", permissionMiddleware("documents.read"), validate(listDocumentsSchema), documentController.list);
router.post("/upload", permissionMiddleware("documents.write"), validate(uploadDocumentSchema), documentController.upload);
router.get("/:id", permissionMiddleware("documents.read"), validate(getDocumentSchema), documentController.getById);
router.put("/:id", permissionMiddleware("documents.write"), validate(updateDocumentSchema), documentController.update);
router.delete("/:id", permissionMiddleware("documents.delete"), validate(deleteDocumentSchema), documentController.delete);

export default router;