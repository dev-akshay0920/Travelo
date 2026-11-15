import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { LeadPipelineService } from "./lead-pipeline.service";
import {
  createLeadPipelineSchema,
  listLeadPipelinesQuerySchema,
  updateLeadPipelineSchema,
} from "./lead-pipeline.validation";

function authenticatedUserId(req: Request): string {
  if (!req.user) throw new Error("UNAUTHORIZED");
  return req.user.sub;
}

export const createLeadPipeline = asyncHandler(async (req: Request, res: Response) => {
  const input = createLeadPipelineSchema.parse(req.body);
  const pipeline = await LeadPipelineService.create(authenticatedUserId(req), input);
  res.status(HTTP_STATUS.CREATED).json(success({ pipeline }));
});

export const listLeadPipelines = asyncHandler(async (req: Request, res: Response) => {
  const filters = listLeadPipelinesQuerySchema.parse(req.query);
  const result = await LeadPipelineService.list(authenticatedUserId(req), filters);
  res.status(HTTP_STATUS.OK).json(success(result));
});

export const getLeadPipeline = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new Error("Pipeline stage ID is required.");
  const pipeline = await LeadPipelineService.getById(authenticatedUserId(req), id);
  res.status(HTTP_STATUS.OK).json(success({ pipeline }));
});

export const updateLeadPipeline = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new Error("Pipeline stage ID is required.");
  const input = updateLeadPipelineSchema.parse(req.body);
  const pipeline = await LeadPipelineService.update(authenticatedUserId(req), id, input);
  res.status(HTTP_STATUS.OK).json(success({ pipeline }));
});

export const deleteLeadPipeline = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new Error("Pipeline stage ID is required.");
  await LeadPipelineService.delete(authenticatedUserId(req), id);
  res.status(HTTP_STATUS.OK).json(success({ message: "Pipeline stage deleted." }));
});