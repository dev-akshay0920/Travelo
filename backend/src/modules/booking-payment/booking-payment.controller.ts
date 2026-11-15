import { Request, Response } from "express";
import { Types } from "mongoose";
import { bookingPaymentService } from "./booking-payment.service";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";

export class BookingPaymentController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const userId = new Types.ObjectId((req as any).user.sub);
    const payment = await bookingPaymentService.create(agencyId, userId, req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ payment }, { message: "Payment recorded successfully" }));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const payment = await bookingPaymentService.getById(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ payment }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const payment = await bookingPaymentService.update(req.params.id!, agencyId, req.body);
    res.status(HTTP_STATUS.OK).json(success({ payment }, { message: "Payment updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    await bookingPaymentService.delete(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Payment deleted successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const result = await bookingPaymentService.list(agencyId, req.query as any);
    res.status(HTTP_STATUS.OK).json(success({ payments: result }));
  });

  getByBookingId = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const payments = await bookingPaymentService.getByBookingId(req.params.bookingId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ payments }));
  });

  getTotalPaidForBooking = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const total = await bookingPaymentService.getTotalPaidForBooking(req.params.bookingId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ total }));
  });
}

export const bookingPaymentController = new BookingPaymentController();