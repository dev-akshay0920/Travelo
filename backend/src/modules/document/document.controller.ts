import { Request, Response } from "express";
import { Types } from "mongoose";
import { documentService } from "./document.service";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";

export class DocumentController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const userId = new Types.ObjectId((req as any).user.sub);
    const document = await documentService.create(agencyId, userId, req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ document }, { message: "Document uploaded successfully" }));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const document = await documentService.getById(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ document }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const document = await documentService.update(req.params.id!, agencyId, req.body);
    res.status(HTTP_STATUS.OK).json(success({ document }, { message: "Document updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    await documentService.delete(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Document deleted successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const result = await documentService.list(agencyId, req.query as any);
    res.status(HTTP_STATUS.OK).json(success({ documents: result }));
  });

  getByLeadId = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const documents = await documentService.getByLeadId(req.params.leadId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ documents }));
  });

  getByBookingId = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const documents = await documentService.getByBookingId(req.params.bookingId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ documents }));
  });

  getByInvoiceId = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const documents = await documentService.getByInvoiceId(req.params.invoiceId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ documents }));
  });
}

export const documentController = new DocumentController();