import { Router } from "express";
import { bookingController } from "./booking.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createBookingSchema,
  updateBookingSchema,
  getBookingSchema,
  listBookingsSchema,
  deleteBookingSchema,
  updateBookingStatusSchema,
  addSupplierBookingSchema,
  updateSupplierBookingSchema,
} from "./booking.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createBookingSchema), bookingController.create);
router.get("/upcoming-departures", bookingController.getUpcomingDepartures);
router.get("/status-counts", bookingController.getStatusCounts);
router.get("/lead/:leadId", bookingController.getByLeadId);
router.get("/quotation/:quotationId", bookingController.getByQuotationId);
router.get("/", validate(listBookingsSchema), bookingController.list);
router.get("/:id", validate(getBookingSchema), bookingController.getById);
router.put("/:id", validate(updateBookingSchema), bookingController.update);
router.patch("/:id/status", validate(updateBookingStatusSchema), bookingController.updateStatus);
router.post(
  "/:id/supplier-bookings",
  validate(addSupplierBookingSchema),
  bookingController.addSupplierBooking
);
router.patch(
  "/:id/supplier-bookings/:supplierBookingId",
  validate(updateSupplierBookingSchema),
  bookingController.updateSupplierBooking
);
router.delete("/:id", validate(deleteBookingSchema), bookingController.delete);

export default router;