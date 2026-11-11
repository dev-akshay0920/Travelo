import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { PolicyTemplateService } from "./policy-template.service";
import {
  createPolicyTemplateSchema,
  listPolicyTemplatesQuerySchema,
  updatePolicyTemplateSchema,
} from "./policy-template.validation";
import { AgencyRepository } from "../agencies/agency.repository";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../../shared/errors/app-error";

async function getAgencyId(req: Request): Promise<string> {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  if (req.user.roleKey !== "agency") {
    throw new ForbiddenError("Agency owner access is required.");
  }
  const agency = await AgencyRepository.findByOwnerUserId(req.user.sub);
  if (!agency) {
    throw new NotFoundError("Agency profile not found.");
  }
  return String(agency._id);
}

export const listPolicyTemplates = asyncHandler(async (req: Request, res: Response) => {
  const agencyId = await getAgencyId(req);
  const filters = listPolicyTemplatesQuerySchema.parse(req.query);
  const templates = await PolicyTemplateService.listTemplates(agencyId, filters);
  res.status(HTTP_STATUS.OK).json(success({ templates }));
});

export const createPolicyTemplate = asyncHandler(async (req: Request, res: Response) => {
  const agencyId = await getAgencyId(req);
  const parsed = createPolicyTemplateSchema.parse(req.body);
  const template = await PolicyTemplateService.createTemplate(agencyId, { ...parsed, agencyId });
  res.status(HTTP_STATUS.CREATED).json(success({ template }));
});

export const getPolicyTemplate = asyncHandler(async (req: Request, res: Response) => {
  const agencyId = await getAgencyId(req);
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
  const agencyId = await getAgencyId(req);
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
  const agencyId = await getAgencyId(req);
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
  const agencyId = await getAgencyId(req);
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
