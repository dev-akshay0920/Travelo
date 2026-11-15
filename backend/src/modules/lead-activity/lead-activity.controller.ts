import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { LeadActivityService } from "./lead-activity.service";
import {
  createLeadActivitySchema,
  listLeadActivitiesQuerySchema,
} from "./lead-activity.validation";

function authenticatedUserId(req: Request): string {
  if (!req.user) throw new Error("UNAUTHORIZED");
  return req.user.sub;
}

export const createLeadActivity = asyncHandler(async (req: Request, res: Response) => {
  const input = createLeadActivitySchema.parse(req.body);
  const activity = await LeadActivityService.create(authenticatedUserId(req), input);
  res.status(HTTP_STATUS.CREATED).json(success({ activity }));
});

export const listLeadActivities = asyncHandler(async (req: Request, res: Response) => {
  const { leadId } = req.params;
  if (!leadId) throw new Error("Lead ID is required.");
  const filters = listLeadActivitiesQuerySchema.parse(req.query);
  const result = await LeadActivityService.list(authenticatedUserId(req), leadId, filters);
  res.status(HTTP_STATUS.OK).json(success(result));
});