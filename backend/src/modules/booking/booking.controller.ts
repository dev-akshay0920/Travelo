import type { Request, Response } from "express";
import { Types } from "mongoose";
import { bookingService } from "./booking.service";
import { bookingRepository } from "./booking.repository";
import type { BookingListQuery } from "./booking.types";
import { asyncHandler } from "../../shared/utils/async-handler";
import { resolveAgencyId } from "../../shared/utils/agency-context";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { validateBookingStatusTransition } from "../../shared/status-transitions";
import { auditService } from "../../modules/audit/audit.service";

export class BookingController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const booking = await bookingService.create(agencyId, req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ booking }, { message: "Booking created successfully" }));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const booking = await bookingService.getById(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ booking }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const booking = await bookingService.update(req.params.id!, agencyId, req.body);
    res.status(HTTP_STATUS.OK).json(success({ booking }, { message: "Booking updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    await bookingService.delete(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Booking deleted successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const result = await bookingService.list(agencyId, req.query as BookingListQuery);
    res.status(HTTP_STATUS.OK).json(success({ bookings: result }));
  });

  getByLeadId = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const bookings = await bookingService.getByLeadId(req.params.leadId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ bookings }));
  });

  getByQuotationId = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const bookings = await bookingService.getByQuotationId(req.params.quotationId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ bookings }));
  });

  getUpcomingDepartures = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const bookings = await bookingService.getUpcomingDepartures(agencyId, days);
    res.status(HTTP_STATUS.OK).json(success({ bookings }));
  });

  getPublicVoucher = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.getPublicVoucher(req.params.bookingId!);
    res.status(HTTP_STATUS.OK).json(success({ booking }));
  });

  generateVoucher = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const booking = await bookingService.generateVoucher(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ booking }, { message: "Voucher generated." }));
  });

  getStatusCounts = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const counts = await bookingService.countByStatus(agencyId);
    res.status(HTTP_STATUS.OK).json(success({ counts }));
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const { status } = req.body;
    if (!status) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Status is required" } });
      return;
    }
    const booking = await bookingRepository.findByIdAndAgency(new Types.ObjectId(req.params.id!), agencyId);
    if (!booking) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: { code: "NOT_FOUND", message: "Booking not found." } });
      return;
    }
    validateBookingStatusTransition(booking.status, status);
    const updated = await bookingService.updateStatus(req.params.id!, agencyId, status);
    await auditService.logStatusChange(
      agencyId,
      new Types.ObjectId(req.user!.sub),
      "booking_status_changed",
      "booking",
      new Types.ObjectId(req.params.id!),
      { status: booking.status },
      { status }
    );
    res.status(HTTP_STATUS.OK).json(success({ booking: updated }, { message: "Booking status updated successfully" }));
  });

  addSupplierBooking = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const booking = await bookingService.addSupplierBooking(req.params.id!, agencyId, req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ booking }, { message: "Supplier booking added successfully" }));
  });

  updateSupplierBooking = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const { supplierBookingId } = req.params;
    const booking = await bookingService.updateSupplierBooking(req.params.id!, agencyId, supplierBookingId!, req.body);
    res.status(HTTP_STATUS.OK).json(success({ booking }, { message: "Supplier booking updated successfully" }));
  });
}

export const bookingController = new BookingController();