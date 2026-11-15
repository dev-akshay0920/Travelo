import { Request, Response } from "express";
import { Types } from "mongoose";
import { platformInvoiceService } from "./platform-invoice.service";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";

export class PlatformInvoiceController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const input = { ...req.body, agencyId: agencyId.toString() };
    const invoice = await platformInvoiceService.create(input);
    res.status(HTTP_STATUS.CREATED).json(success({ invoice }, { message: "Platform invoice created successfully" }));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const invoice = await platformInvoiceService.getById(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ invoice }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const invoice = await platformInvoiceService.update(req.params.id!, agencyId, req.body);
    res.status(HTTP_STATUS.OK).json(success({ invoice }, { message: "Invoice updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    await platformInvoiceService.delete(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Invoice deleted successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const result = await platformInvoiceService.list(agencyId, req.query as any);
    res.status(HTTP_STATUS.OK).json(success({ invoices: result }));
  });

  getOverdue = asyncHandler(async (_req: Request, res: Response) => {
    const invoices = await platformInvoiceService.getOverdueInvoices();
    res.status(HTTP_STATUS.OK).json(success({ invoices }));
  });

  getBySubscription = asyncHandler(async (req: Request, res: Response) => {
    const invoices = await platformInvoiceService.getBySubscriptionId(req.params.subscriptionId!);
    res.status(HTTP_STATUS.OK).json(success({ invoices }));
  });

  recordPayment = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
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