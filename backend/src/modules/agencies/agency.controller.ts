import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { AgencyService } from "./agency.service";
import { AgencyLogoStorage } from "./agency-logo.storage";
import { updateAgencySchema, submitAgencySchema, createAgencySchema } from "./agency.validation";
import { AppError, NotFoundError, ServiceUnavailableError, ValidationError } from "../../shared/errors/app-error";

export const getPublicAgency = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!slug || typeof slug !== "string") {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Agency not found." },
    });
    return;
  }

  const agency = await AgencyService.getPublicAgency(slug);
  if (!agency) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Agency not found." },
    });
    return;
  }

  res.status(HTTP_STATUS.OK).json(success({ agency }));
});

export const getMyAgency = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const agency = await AgencyService.getMyAgency(req.user.sub);
  if (!agency) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Agency profile not found." },
    });
    return;
  }

  res.status(HTTP_STATUS.OK).json(success({ agency }));
});

export const updateMyAgency = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  try {
    const input = updateAgencySchema.parse(req.body);
    const agency = await AgencyService.updateMyAgency(req.user.sub, input);
    res.status(HTTP_STATUS.OK).json(success({ agency }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request payload",
          details: error.format(),
        },
      });
      return;
    }
    throw error;
  }
});

export const uploadMyAgencyLogo = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  if (!req.file) {
    throw new ValidationError("Choose an image to upload.");
  }

  const currentAgency = await AgencyService.getMyAgency(req.user.sub);
  if (!currentAgency) {
    throw new NotFoundError("Agency profile not found.");
  }
  if (currentAgency.status !== "draft" && currentAgency.status !== "pending") {
    throw new ValidationError("Agency profile image cannot be changed in its current status.");
  }

  const storedLogo = await AgencyLogoStorage.upload(String(currentAgency._id), req.file.buffer);
  let result: Awaited<ReturnType<typeof AgencyService.updateMyAgencyLogo>>;

  try {
    result = await AgencyService.updateMyAgencyLogo(req.user.sub, {
      url: storedLogo.url,
      key: storedLogo.key,
      altText: currentAgency.name,
    });
  } catch (error) {
    await AgencyLogoStorage.deleteOwnedAgencyLogo(String(currentAgency._id), storedLogo.key);
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Agency profile image could not be saved.", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    throw new ServiceUnavailableError("Agency profile image could not be saved.");
  }

  const previousKey = result.previousLogo?.key;
  if (previousKey && previousKey !== storedLogo.key) {
    await AgencyLogoStorage.deleteOwnedAgencyLogo(String(currentAgency._id), previousKey);
  }

  res.status(HTTP_STATUS.OK).json(success({ agency: result.agency }));
});

export const submitMyAgency = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const input = submitAgencySchema.parse(req.body);
  const agency = await AgencyService.submitForApproval(req.user.sub, input);

  res.status(HTTP_STATUS.OK).json(success({ agency }));
});

export const createMyAgency = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const input = createAgencySchema.parse(req.body);
  const agency = await AgencyService.createDraft({
    ownerUserId: req.user.sub,
    name: input.name,
  });

  res.status(HTTP_STATUS.CREATED).json(success({ agency }));
});

export const checkSlugAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.query;
  const excludeAgencyId = req.query.excludeAgencyId as string | undefined;

  if (!slug || typeof slug !== "string" || !slug.trim()) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Slug is required." },
    });
    return;
  }

  const trimmed = slug.trim();

  if (trimmed.length < 6) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Slug must be at least 6 characters." },
    });
    return;
  }

  if (trimmed.length > 40) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Slug cannot exceed 40 characters." },
    });
    return;
  }

  if (!/^[a-z0-9-]+$/.test(trimmed)) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Slug can only contain lowercase letters, numbers, and hyphens." },
    });
    return;
  }

  const existing = await AgencyService.findBySlugForUser(trimmed, excludeAgencyId);
  const available = !existing;

  res.status(HTTP_STATUS.OK).json(success({ available, slug: trimmed }));
});
