import { Router } from "express";
import { bookingPaymentController } from "./booking-payment.controller";
import { validate } from "../../middleware/validation.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createBookingPaymentSchema,
  updateBookingPaymentSchema,
  getBookingPaymentSchema,
  listBookingPaymentsSchema,
  deleteBookingPaymentSchema,
} from "./booking-payment.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createBookingPaymentSchema), bookingPaymentController.create);
router.get("/booking/:bookingId", bookingPaymentController.getByBookingId);
router.get("/booking/:bookingId/total", bookingPaymentController.getTotalPaidForBooking);
router.get("/", validate(listBookingPaymentsSchema), bookingPaymentController.list);
router.get("/:id", validate(getBookingPaymentSchema), bookingPaymentController.getById);
router.put("/:id", validate(updateBookingPaymentSchema), bookingPaymentController.update);
router.delete("/:id", validate(deleteBookingPaymentSchema), bookingPaymentController.delete);

export default router;