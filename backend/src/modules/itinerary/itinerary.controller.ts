import type { Request, Response } from "express";
import { itineraryService } from "./itinerary.service";
import type { ItineraryListQuery } from "./itinerary.types";
import { asyncHandler } from "../../shared/utils/async-handler";
import { resolveAgencyId } from "../../shared/utils/agency-context";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";

export class ItineraryController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const itinerary = await itineraryService.create(agencyId, req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ itinerary }, { message: "Itinerary created successfully" }));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const itinerary = await itineraryService.getById(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ itinerary }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const itinerary = await itineraryService.update(req.params.id!, agencyId, req.body);
    res.status(HTTP_STATUS.OK).json(success({ itinerary }, { message: "Itinerary updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    await itineraryService.delete(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Itinerary deleted successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const result = await itineraryService.list(agencyId, req.query as ItineraryListQuery);
    res.status(HTTP_STATUS.OK).json(success({ itineraries: result }));
  });

  generateAi = asyncHandler(async (req: Request, res: Response) => {
    const draft = await itineraryService.generateAiDraft(req.body);
    res.status(HTTP_STATUS.OK).json(success({ draft }));
  });

  getTemplates = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const templates = await itineraryService.getTemplates(agencyId);
    res.status(HTTP_STATUS.OK).json(success({ templates }));
  });

  duplicate = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = resolveAgencyId(req);
    const { newName } = req.body;
    if (!newName) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { code: "VALIDATION_ERROR", message: "New name is required" } });
      return;
    }
    const itinerary = await itineraryService.duplicate(req.params.id!, agencyId, newName);
    res.status(HTTP_STATUS.CREATED).json(success({ itinerary }, { message: "Itinerary duplicated successfully" }));
  });
}

export const itineraryController = new ItineraryController();