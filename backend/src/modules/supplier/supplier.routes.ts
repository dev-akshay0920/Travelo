import { Router } from "express";
import { supplierController } from "./supplier.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { permissionMiddleware } from "../../middleware/permission.middleware";
import { crmWriteRateLimiter } from "../../middleware/rate-limit.middleware";
import {
  createSupplierSchema,
  updateSupplierSchema,
  getSupplierSchema,
  listSuppliersSchema,
  deleteSupplierSchema,
  createSupplierRateCardSchema,
  updateSupplierRateCardSchema,
  getSupplierRateCardSchema,
  listSupplierRateCardsSchema,
  deleteSupplierRateCardSchema,
} from "./supplier.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", permissionMiddleware("suppliers.write"), crmWriteRateLimiter, validate(createSupplierSchema), supplierController.create);
router.get("/category-counts", permissionMiddleware("suppliers.read"), supplierController.getCategoryCounts);
router.get("/category/:category", permissionMiddleware("suppliers.read"), supplierController.getByCategory);
router.get("/", permissionMiddleware("suppliers.read"), validate(listSuppliersSchema), supplierController.list);
router.get("/:id", permissionMiddleware("suppliers.read"), validate(getSupplierSchema), supplierController.getById);
router.put("/:id", permissionMiddleware("suppliers.write"), crmWriteRateLimiter, validate(updateSupplierSchema), supplierController.update);
router.delete("/:id", permissionMiddleware("suppliers.delete"), crmWriteRateLimiter, validate(deleteSupplierSchema), supplierController.delete);

// Rate Card routes (nested under supplier)
router.post("/:supplierId/rate-cards", permissionMiddleware("suppliers.write"), crmWriteRateLimiter, validate(createSupplierRateCardSchema), supplierController.createRateCard);
router.get("/:supplierId/rate-cards", permissionMiddleware("suppliers.read"), validate(listSupplierRateCardsSchema), supplierController.listRateCards);
router.get("/:supplierId/rate-cards/:rateCardId", permissionMiddleware("suppliers.read"), validate(getSupplierRateCardSchema), supplierController.getRateCard);
router.put("/:supplierId/rate-cards/:rateCardId", permissionMiddleware("suppliers.write"), crmWriteRateLimiter, validate(updateSupplierRateCardSchema), supplierController.updateRateCard);
router.delete("/:supplierId/rate-cards/:rateCardId", permissionMiddleware("suppliers.delete"), crmWriteRateLimiter, validate(deleteSupplierRateCardSchema), supplierController.deleteRateCard);

export default router;