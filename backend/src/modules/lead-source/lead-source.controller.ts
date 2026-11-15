import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { LeadSourceService } from "./lead-source.service";
import {
  createLeadSourceSchema,
  listLeadSourcesQuerySchema,
  updateLeadSourceSchema,
} from "./lead-source.validation";

function authenticatedUserId(req: Request): string {
  if (!req.user) throw new Error("UNAUTHORIZED");
  return req.user.sub;
}

export const createLeadSource = asyncHandler(async (req: Request, res: Response) => {
  const input = createLeadSourceSchema.parse(req.body);
  const source = await LeadSourceService.create(authenticatedUserId(req), input);
  res.status(HTTP_STATUS.CREATED).json(success({ source }));
});

export const listLeadSources = asyncHandler(async (req: Request, res: Response) => {
  const filters = listLeadSourcesQuerySchema.parse(req.query);
  const result = await LeadSourceService.list(authenticatedUserId(req), filters);
  res.status(HTTP_STATUS.OK).json(success(result));
});

export const getLeadSource = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new Error("Lead source ID is required.");
  const source = await LeadSourceService.getById(authenticatedUserId(req), id);
  res.status(HTTP_STATUS.OK).json(success({ source }));
});

export const updateLeadSource = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new Error("Lead source ID is required.");
  const input = updateLeadSourceSchema.parse(req.body);
  const source = await LeadSourceService.update(authenticatedUserId(req), id, input);
  res.status(HTTP_STATUS.OK).json(success({ source }));
});

export const deleteLeadSource = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new Error("Lead source ID is required.");
  await LeadSourceService.delete(authenticatedUserId(req), id);
  res.status(HTTP_STATUS.OK).json(success({ message: "Lead source deleted." }));
});