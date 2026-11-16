import { Router } from "express";
import { bookingPaymentController } from "./booking-payment.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { permissionMiddleware } from "../../middleware/permission.middleware";
import {
  createBookingPaymentSchema,
  updateBookingPaymentSchema,
  getBookingPaymentSchema,
  listBookingPaymentsSchema,
  deleteBookingPaymentSchema,
} from "./booking-payment.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", permissionMiddleware("payments.write"), validate(createBookingPaymentSchema), bookingPaymentController.create);
router.get("/booking/:bookingId", permissionMiddleware("payments.read"), bookingPaymentController.getByBookingId);
router.get("/booking/:bookingId/total", permissionMiddleware("payments.read"), bookingPaymentController.getTotalPaidForBooking);
router.get("/", permissionMiddleware("payments.read"), validate(listBookingPaymentsSchema), bookingPaymentController.list);
router.get("/:id", permissionMiddleware("payments.read"), validate(getBookingPaymentSchema), bookingPaymentController.getById);
router.put("/:id", permissionMiddleware("payments.write"), validate(updateBookingPaymentSchema), bookingPaymentController.update);
router.delete("/:id", permissionMiddleware("payments.delete"), validate(deleteBookingPaymentSchema), bookingPaymentController.delete);

export default router;