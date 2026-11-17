import { Router } from "express";
import { bookingController } from "./booking.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { permissionMiddleware } from "../../middleware/permission.middleware";
import {
  createBookingSchema,
  updateBookingSchema,
  getBookingSchema,
  listBookingsSchema,
  deleteBookingSchema,
  updateBookingStatusSchema,
  generateVoucherSchema,
  getPublicVoucherSchema,
  addSupplierBookingSchema,
  updateSupplierBookingSchema,
} from "./booking.validation";

const router = Router();

router.get("/public/voucher/:bookingId", validate(getPublicVoucherSchema), bookingController.getPublicVoucher);

router.use(authMiddleware);

router.get("/me", bookingController.listMyBookings);
router.post("/", permissionMiddleware("bookings.write"), validate(createBookingSchema), bookingController.create);
router.get("/upcoming-departures", permissionMiddleware("bookings.read"), bookingController.getUpcomingDepartures);
router.get("/status-counts", permissionMiddleware("bookings.read"), bookingController.getStatusCounts);
router.get("/lead/:leadId", permissionMiddleware("bookings.read"), bookingController.getByLeadId);
router.get("/quotation/:quotationId", permissionMiddleware("bookings.read"), bookingController.getByQuotationId);
router.get("/", permissionMiddleware("bookings.read"), validate(listBookingsSchema), bookingController.list);
router.get("/:id", permissionMiddleware("bookings.read"), validate(getBookingSchema), bookingController.getById);
router.put("/:id", permissionMiddleware("bookings.write"), validate(updateBookingSchema), bookingController.update);
router.patch("/:id/status", permissionMiddleware("bookings.write"), validate(updateBookingStatusSchema), bookingController.updateStatus);
router.post("/:id/voucher", permissionMiddleware("bookings.write"), validate(generateVoucherSchema), bookingController.generateVoucher);
router.post(
  "/:id/supplier-bookings",
  permissionMiddleware("bookings.write"),
  validate(addSupplierBookingSchema),
  bookingController.addSupplierBooking
);
router.patch(
  "/:id/supplier-bookings/:supplierBookingId",
  permissionMiddleware("bookings.write"),
  validate(updateSupplierBookingSchema),
  bookingController.updateSupplierBooking
);
router.delete("/:id", permissionMiddleware("bookings.delete"), validate(deleteBookingSchema), bookingController.delete);

export default router;