import { Request, Response } from "express";
import { Types } from "mongoose";
import { itineraryService } from "./itinerary.service";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";

export class ItineraryController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const itinerary = await itineraryService.create(agencyId, req.body);
    res.status(HTTP_STATUS.CREATED).json(success({ itinerary }, { message: "Itinerary created successfully" }));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const itinerary = await itineraryService.getById(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success({ itinerary }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const itinerary = await itineraryService.update(req.params.id!, agencyId, req.body);
    res.status(HTTP_STATUS.OK).json(success({ itinerary }, { message: "Itinerary updated successfully" }));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    await itineraryService.delete(req.params.id!, agencyId);
    res.status(HTTP_STATUS.OK).json(success(null, { message: "Itinerary deleted successfully" }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const result = await itineraryService.list(agencyId, req.query as any);
    res.status(HTTP_STATUS.OK).json(success({ itineraries: result }));
  });

  getTemplates = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
    const templates = await itineraryService.getTemplates(agencyId);
    res.status(HTTP_STATUS.OK).json(success({ templates }));
  });

  duplicate = asyncHandler(async (req: Request, res: Response) => {
    const agencyId = new Types.ObjectId((req as any).user.agencyId);
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