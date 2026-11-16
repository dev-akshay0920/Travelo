import type { Request, Response } from "express";
import { Types } from "mongoose";
import { documentService } from "./document.service";
import type { DocumentListQuery } from "./document.types";
import { asyncHandler } from "../../shared/utils/async-handler";
import { resolveAgencyId } from "../../shared/utils/agency-context";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";

export class DocumentController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const userId = new Types.ObjectId(req.user!.sub);
    const document = await documentService.create(agencyId, userId, req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ document }, { message: "Document uploaded successfully" }));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const document = await documentService.getById(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ document }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const document = await documentService.update(req.params.id!, agencyId, req.body);
    res.status(HTTP_STATUS.OK).json(success({ document }, { message: "Document updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    await documentService.delete(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Document deleted successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const result = await documentService.list(agencyId, req.query as DocumentListQuery);
    res.status(HTTP_STATUS.OK).json(success({ documents: result }));
  });

  getByLeadId = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const documents = await documentService.getByLeadId(req.params.leadId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ documents }));
  });

  getByBookingId = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const documents = await documentService.getByBookingId(req.params.bookingId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ documents }));
  });

  getByInvoiceId = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const documents = await documentService.getByInvoiceId(req.params.invoiceId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ documents }));
  });
}

export const documentController = new DocumentController();