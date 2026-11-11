import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { UnauthorizedError, ValidationError } from "../../shared/errors/app-error";
import { LeadService } from "./lead.service";
import {
  createLeadSchema,
  listLeadsQuerySchema,
  updateLeadSchema,
} from "./lead.validation";

function authenticatedUserId(req: Request): string {
  if (!req.user) throw new UnauthorizedError();
  return req.user.sub;
}

function getLeadId(req: Request): string {
  const { id } = req.params;
  if (!id) throw new ValidationError("Inquiry ID is required.");
  return id;
}

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const input = createLeadSchema.parse(req.body);
  const lead = await LeadService.create(authenticatedUserId(req), input);
  res.status(HTTP_STATUS.CREATED).json(success({ lead }));
});

export const listLeads = asyncHandler(async (req: Request, res: Response) => {
  const filters = listLeadsQuerySchema.parse(req.query);
  const result = await LeadService.list(authenticatedUserId(req), filters);
  res.status(HTTP_STATUS.OK).json(success(result));
});

export const getLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await LeadService.getById(authenticatedUserId(req), getLeadId(req));
  res.status(HTTP_STATUS.OK).json(success({ lead }));
});

export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const input = updateLeadSchema.parse(req.body);
  const lead = await LeadService.update(authenticatedUserId(req), getLeadId(req), input);
  res.status(HTTP_STATUS.OK).json(success({ lead }));
});

export const getAgencyDashboard = asyncHandler(async (req: Request, res: Response) => {
  const dashboard = await LeadService.getDashboard(authenticatedUserId(req));
  res.status(HTTP_STATUS.OK).json(success({ dashboard }));
});
