import { Request, Response } from "express";
import { Types } from "mongoose";
import { quotationService } from "./quotation.service";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";

export class QuotationController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const quotation = await quotationService.create(agencyId, req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ quotation }, { message: "Quotation created successfully" }));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const quotation = await quotationService.getById(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ quotation }));
  });

  getPublic = asyncHandler(async (req: Request, res: Response) => {
    const quotation = await quotationService.getByPublicLink(req.params.token!);
    res.status(HTTP_STATUS.OK).json(success({ quotation }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const quotation = await quotationService.update(req.params.id!, agencyId, req.body);
    res.status(HTTP_STATUS.OK).json(success({ quotation }, { message: "Quotation updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    await quotationService.delete(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Quotation deleted successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const result = await quotationService.list(agencyId, req.query as any);
    res.status(HTTP_STATUS.OK).json(success({ quotations: result }));
  });

  getByLeadId = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const quotations = await quotationService.getByLeadId(req.params.leadId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ quotations }));
  });

  getStatusCounts = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const counts = await quotationService.getStatusCounts(agencyId);
    res.status(HTTP_STATUS.OK).json(success({ counts }));
  });

  send = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const quotation = await quotationService.sendQuotation(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ quotation }, { message: "Quotation sent successfully" }));
  });

  accept = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const quotation = await quotationService.acceptQuotation(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ quotation }, { message: "Quotation accepted successfully" }));
  });

  acceptPublic = asyncHandler(async (req: Request, res: Response) => {
    const quotation = await quotationService.acceptQuotationPublic(req.params.token!);
    res.status(HTTP_STATUS.OK).json(success({ quotation }, { message: "Quotation accepted successfully" }));
  });
}

export const quotationController = new QuotationController();