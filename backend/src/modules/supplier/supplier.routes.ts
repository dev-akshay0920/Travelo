import { Router } from "express";
import { supplierController } from "./supplier.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
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

router.post("/", validate(createSupplierSchema), supplierController.create);
router.get("/category-counts", supplierController.getCategoryCounts);
router.get("/category/:category", supplierController.getByCategory);
router.get("/", validate(listSuppliersSchema), supplierController.list);
router.get("/:id", validate(getSupplierSchema), supplierController.getById);
router.put("/:id", validate(updateSupplierSchema), supplierController.update);
router.delete("/:id", validate(deleteSupplierSchema), supplierController.delete);

// Rate Card routes (nested under supplier)
router.post("/:supplierId/rate-cards", validate(createSupplierRateCardSchema), supplierController.createRateCard);
router.get("/:supplierId/rate-cards", validate(listSupplierRateCardsSchema), supplierController.listRateCards);
router.get("/:supplierId/rate-cards/:rateCardId", validate(getSupplierRateCardSchema), supplierController.getRateCard);
router.put("/:supplierId/rate-cards/:rateCardId", validate(updateSupplierRateCardSchema), supplierController.updateRateCard);
router.delete("/:supplierId/rate-cards/:rateCardId", validate(deleteSupplierRateCardSchema), supplierController.deleteRateCard);

export default router;