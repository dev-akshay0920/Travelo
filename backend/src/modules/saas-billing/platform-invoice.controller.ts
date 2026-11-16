import type { Request, Response } from "express";
import { platformInvoiceService } from "./platform-invoice.service";
import type { PlatformInvoiceListQuery } from "./platform-invoice.types";
import { asyncHandler } from "../../shared/utils/async-handler";
import { resolveAgencyId } from "../../shared/utils/agency-context";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";

export class PlatformInvoiceController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const input = { ...req.body, agencyId: agencyId.toString() };
    const invoice = await platformInvoiceService.create(input);
    res.status(HTTP_STATUS.CREATED).json(success({ invoice }, { message: "Platform invoice created successfully" }));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const invoice = await platformInvoiceService.getById(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ invoice }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const invoice = await platformInvoiceService.update(req.params.id!, agencyId, req.body);
    res.status(HTTP_STATUS.OK).json(success({ invoice }, { message: "Invoice updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    await platformInvoiceService.delete(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Invoice deleted successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const result = await platformInvoiceService.list(agencyId, req.query as PlatformInvoiceListQuery);
    res.status(HTTP_STATUS.OK).json(success({ invoices: result }));
  });

  getOverdue = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const invoices = await platformInvoiceService.getOverdueInvoices(agencyId);
    res.status(HTTP_STATUS.OK).json(success({ invoices }));
  });

  getBySubscription = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const invoices = await platformInvoiceService.getBySubscriptionId(req.params.subscriptionId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ invoices }));
  });

  recordPayment = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const { paymentMethod, reference, paidAt } = req.body;
    const invoice = await platformInvoiceService.recordPayment(agencyId, req.params.id!, paymentMethod, reference, paidAt);
    res.status(HTTP_STATUS.OK).json(success({ invoice }, { message: "Payment recorded successfully" }));
  });

  // Admin-only endpoints
  listAll = asyncHandler(async (_req: Request, res: Response) => {
    const result = await platformInvoiceService.listAll({});
    res.status(HTTP_STATUS.OK).json(success({ invoices: result }));
  });
}

export const platformInvoiceController = new PlatformInvoiceController();