import type { Request, Response } from "express";
import { Types } from "mongoose";
import { invoiceService } from "./invoice.service";
import { invoiceRepository } from "./invoice.repository";
import { bookingRepository } from "../booking/booking.repository";
import type { InvoiceListQuery } from "./invoice.types";
import { toInvoiceDTO } from "./invoice.types";
import { asyncHandler } from "../../shared/utils/async-handler";
import { resolveAgencyId } from "../../shared/utils/agency-context";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { validateInvoiceStatusTransition } from "../../shared/status-transitions";
import { auditService } from "../../modules/audit/audit.service";

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

  listMyInvoices = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || req.user.roleKey !== "traveller") {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Traveller access required." },
      });
      return;
    }
    const travellerId = new Types.ObjectId(req.user.sub);
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "Page and limit must be positive integers, with limit at most 100." },
      });
      return;
    }
    const bookingIds = await bookingRepository.getBookingIdsByTraveller(travellerId);
    const result = await invoiceRepository.listByBookingIds(bookingIds, {
      page,
      limit,
      status: req.query.status as unknown as InvoiceListQuery["status"],
      type: req.query.type as unknown as InvoiceListQuery["type"],
      search: req.query.search as string | undefined,
    });
    res.status(HTTP_STATUS.OK).json(
      success({
        invoices: {
          items: result.items.map(toInvoiceDTO),
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      })
    );
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
    const invoice = await invoiceRepository.findByIdAndAgency(new Types.ObjectId(req.params.id!), agencyId);
    if (!invoice) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: { code: "NOT_FOUND", message: "Invoice not found." } });
      return;
    }
    validateInvoiceStatusTransition(invoice.status, status);
    const updated = await invoiceService.updateStatus(req.params.id!, agencyId, status);
    await auditService.logStatusChange(
      agencyId,
      new Types.ObjectId(req.user!.sub),
      "invoice_status_changed",
      "invoice",
      new Types.ObjectId(req.params.id!),
      { status: invoice.status },
      { status }
    );
    res.status(HTTP_STATUS.OK).json(success({ invoice: updated }, { message: "Invoice status updated successfully" }));
  });

  recordPayment = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const { amount, method, transactionId, notes } = req.body;
    if (!amount || amount <= 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Amount must be greater than 0" } });
      return;
    }
    const userId = req.user?.sub ? new Types.ObjectId(req.user.sub) : undefined;
    const invoice = await invoiceRepository.findByIdAndAgency(new Types.ObjectId(req.params.id!), agencyId);
    if (!invoice) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: { code: "NOT_FOUND", message: "Invoice not found." } });
      return;
    }
    const updatedInvoice = await invoiceService.recordPayment(req.params.id!, agencyId, { amount, method, transactionId, notes }, userId);
    await auditService.logPayment(
      agencyId,
      userId,
      new Types.ObjectId(req.params.id!),
      { paidAmount: invoice.paidAmount },
      { paidAmount: updatedInvoice.paidAmount, status: updatedInvoice.status }
    );
    res.status(HTTP_STATUS.OK).json(success({ invoice: updatedInvoice }, { message: "Payment recorded successfully" }));
  });

  generatePaymentLink = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const { expiresInDays } = req.body ?? {};
    const invoice = await invoiceService.generatePaymentLink(req.params.id!, agencyId, expiresInDays);
    res.status(HTTP_STATUS.OK).json(success({ invoice }, { message: "Payment link generated successfully" }));
  });
}

export const invoiceController = new InvoiceController();