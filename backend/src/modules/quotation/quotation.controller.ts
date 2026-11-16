import type { Request, Response } from "express";
import { quotationService } from "./quotation.service";
import type { QuotationListQuery } from "./quotation.types";
import { asyncHandler } from "../../shared/utils/async-handler";
import { resolveAgencyId } from "../../shared/utils/agency-context";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";

export class QuotationController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const quotation = await quotationService.create(agencyId, req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ quotation }, { message: "Quotation created successfully" }));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const quotation = await quotationService.getById(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ quotation }));
  });

  getPublic = asyncHandler(async (req: Request, res: Response) => {
    const quotation = await quotationService.getByPublicLink(req.params.token!);
    res.status(HTTP_STATUS.OK).json(success({ quotation }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const quotation = await quotationService.update(req.params.id!, agencyId, req.body);
    res.status(HTTP_STATUS.OK).json(success({ quotation }, { message: "Quotation updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    await quotationService.delete(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Quotation deleted successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const result = await quotationService.list(agencyId, req.query as QuotationListQuery);
    res.status(HTTP_STATUS.OK).json(success({ quotations: result }));
  });

  getByLeadId = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const quotations = await quotationService.getByLeadId(req.params.leadId!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ quotations }));
  });

  getStatusCounts = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const counts = await quotationService.getStatusCounts(agencyId);
    res.status(HTTP_STATUS.OK).json(success({ counts }));
  });

  send = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const quotation = await quotationService.sendQuotation(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ quotation }, { message: "Quotation sent successfully" }));
  });

  accept = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const quotation = await quotationService.acceptQuotation(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ quotation }, { message: "Quotation accepted successfully" }));
  });

  acceptPublic = asyncHandler(async (req: Request, res: Response) => {
    const result = await quotationService.acceptQuotationPublic(req.params.token!);
    res.status(HTTP_STATUS.OK).json(
      success(
        {
          quotation: result.quotation,
          bookingId: result.bookingId,
          bookingNumber: result.bookingNumber,
        },
        { message: "Quotation accepted successfully" }
      )
    );
  });
}

export const quotationController = new QuotationController();