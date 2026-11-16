import type { Request, Response } from "express";
import { Types } from "mongoose";
import { invoiceService } from "./invoice.service";
import type { InvoiceListQuery } from "./invoice.types";
import { asyncHandler } from "../../shared/utils/async-handler";
import { resolveAgencyId } from "../../shared/utils/agency-context";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";

export class InvoiceController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const invoice = await invoiceService.create(agencyId, req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ invoice }, { message: "Invoice created successfully" }));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const invoice = await invoiceService.getById(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ invoice }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const invoice = await invoiceService.update(req.params.id!, agencyId, req.body);
    res.status(HTTP_STATUS.OK).json(success({ invoice }, { message: "Invoice updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    await invoiceService.delete(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Invoice deleted successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const result = await invoiceService.list(agencyId, req.query as InvoiceListQuery);
    res.status(HTTP_STATUS.OK).json(success({ invoices: result }));
  });

  getByBookingId = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const invoices = await invoiceService.getByBookingId(req.params.bookingId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ invoices }));
  });

  getByLeadId = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const invoices = await invoiceService.getByLeadId(req.params.leadId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ invoices }));
  });

  getStatusCounts = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const counts = await invoiceService.countByStatus(agencyId);
    res.status(HTTP_STATUS.OK).json(success({ counts }));
  });

  getOverdueInvoices = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const invoices = await invoiceService.getOverdueInvoices(agencyId);
    res.status(HTTP_STATUS.OK).json(success({ invoices }));
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const { status } = req.body;
    if (!status) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Status is required" } });
      return;
    }
    const invoice = await invoiceService.updateStatus(req.params.id!, agencyId, status);
    res.status(HTTP_STATUS.OK).json(success({ invoice }, { message: "Invoice status updated successfully" }));
  });

  recordPayment = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const { amount, method, transactionId, notes } = req.body;
    if (!amount || amount <= 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Amount must be greater than 0" } });
      return;
    }
    const userId = req.user?.sub ? new Types.ObjectId(req.user.sub) : undefined;
    const invoice = await invoiceService.recordPayment(req.params.id!, agencyId, { amount, method, transactionId, notes }, userId);
    res.status(HTTP_STATUS.OK).json(success({ invoice }, { message: "Payment recorded successfully" }));
  });
}

export const invoiceController = new InvoiceController();