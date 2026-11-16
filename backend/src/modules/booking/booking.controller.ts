import type { Request, Response } from "express";
import { bookingService } from "./booking.service";
import type { BookingListQuery } from "./booking.types";
import { asyncHandler } from "../../shared/utils/async-handler";
import { resolveAgencyId } from "../../shared/utils/agency-context";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";

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
    const booking = await bookingService.updateStatus(req.params.id!, agencyId, status);
    res.status(HTTP_STATUS.OK).json(success({ booking }, { message: "Booking status updated successfully" }));
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