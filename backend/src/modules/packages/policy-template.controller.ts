import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { PolicyTemplateService } from "./policy-template.service";
import { createPolicyTemplateSchema, updatePolicyTemplateSchema } from "./policy-template.validation";

export const listPolicyTemplates = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Unauthorized." },
    });
    return;
  }

  const agencyId = req.user.sub;
  const type = req.query.type as "terms" | "cancellation" | undefined;
  const search = (req.query.search as string | undefined) || undefined;

  const templates = await PolicyTemplateService.listTemplates(agencyId, { type, search });
  res.status(HTTP_STATUS.OK).json(success({ templates }));
});

export const createPolicyTemplate = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Unauthorized." },
    });
    return;
  }

  const agencyId = req.user.sub;
  const parsed = createPolicyTemplateSchema.parse(req.body);
  const template = await PolicyTemplateService.createTemplate(agencyId, { ...parsed, agencyId });
  res.status(HTTP_STATUS.CREATED).json(success({ template }));
});

export const getPolicyTemplate = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Unauthorized." },
    });
    return;
  }

  const agencyId = req.user.sub;
  const id = req.params.id;
  if (!id) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Template ID is required." },
    });
    return;
  }
  const template = await PolicyTemplateService.getTemplate(id, agencyId);
  res.status(HTTP_STATUS.OK).json(success({ template }));
});

export const updatePolicyTemplate = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Unauthorized." },
    });
    return;
  }

  const agencyId = req.user.sub;
  const id = req.params.id;
  if (!id) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Template ID is required." },
    });
    return;
  }
  const parsed = updatePolicyTemplateSchema.parse(req.body);
  const template = await PolicyTemplateService.updateTemplate(id, agencyId, parsed);
  res.status(HTTP_STATUS.OK).json(success({ template }));
});

export const deletePolicyTemplate = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Unauthorized." },
    });
    return;
  }

  const agencyId = req.user.sub;
  const id = req.params.id;
  if (!id) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Template ID is required." },
    });
    return;
  }
  await PolicyTemplateService.deleteTemplate(id, agencyId);
  res.status(HTTP_STATUS.OK).json(success({ success: true }));
});

export const duplicatePolicyTemplate = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Unauthorized." },
    });
    return;
  }

  const agencyId = req.user.sub;
  const id = req.params.id;
  if (!id) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Template ID is required." },
    });
    return;
  }
  const template = await PolicyTemplateService.duplicateTemplate(id, agencyId);
  res.status(HTTP_STATUS.CREATED).json(success({ template }));
});
