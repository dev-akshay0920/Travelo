import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { PackageService } from "./package.service";
import {
  createPackageSchema,
  updatePackageSchema,
  listPackagesQuerySchema,
  updatePackageStatusSchema,
  uploadPackageImagesSchema,
  setPrimaryImageSchema,
  reorderImagesSchema,
} from "./package.validation";
import { AgencyRepository } from "../agencies/agency.repository";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../shared/errors/app-error";

const getAgencyIdFromReq = async (req: Request): Promise<string> => {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required.");
  }
  if (req.user.roleKey !== "agency") {
    throw new ForbiddenError("Agency owner access is required.");
  }

  const agency = await AgencyRepository.findByOwnerUserId(req.user.sub);
  if (!agency) {
    throw new NotFoundError("Agency profile not found.");
  }

  const agencyId = req.query.agencyId;
  if (agencyId !== undefined && typeof agencyId !== "string") {
    throw new ValidationError("Agency ID must be a single value.");
  }
  if (agencyId && agencyId !== String(agency._id)) {
    throw new NotFoundError("Agency not found.");
  }

  return String(agency._id);
};

export const listPackages = asyncHandler(async (req: Request, res: Response) => {
  const agencyId = await getAgencyIdFromReq(req);
  const query = listPackagesQuerySchema.parse(req.query);
  const result = await PackageService.getPackagesByAgency(agencyId, query);
  res.status(HTTP_STATUS.OK).json(success(result));
});

export const listUpcomingPackages = asyncHandler(async (req: Request, res: Response) => {
  const agencyId = await getAgencyIdFromReq(req);
  const items = await PackageService.getUpcomingPackages(agencyId);
  res.status(HTTP_STATUS.OK).json(success({ items }));
});

export const listCurrentPackages = asyncHandler(async (req: Request, res: Response) => {
  const agencyId = await getAgencyIdFromReq(req);
  const items = await PackageService.getCurrentPackages(agencyId);
  res.status(HTTP_STATUS.OK).json(success({ items }));
});

export const listHistoryPackages = asyncHandler(async (req: Request, res: Response) => {
  const agencyId = await getAgencyIdFromReq(req);
  const items = await PackageService.getHistoryPackages(agencyId);
  res.status(HTTP_STATUS.OK).json(success({ items }));
});

export const getPackage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || typeof id !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Package ID is required." },
    });
    return;
  }

  const agencyId = await getAgencyIdFromReq(req);
  const pkg = await PackageService.getPackageById(id, agencyId);
  res.status(HTTP_STATUS.OK).json(success({ package: pkg }));
});

export const createPackage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const body = createPackageSchema.parse(req.body);
  const agencyId = await getAgencyIdFromReq(req);
  const pkg = await PackageService.createPackage({
    ...body,
    agencyId,
    ownerUserId: req.user.sub,
  });

  res.status(HTTP_STATUS.CREATED).json(success({ package: pkg }));
});

export const updatePackage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { id } = req.params;
  if (!id || typeof id !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Package ID is required." },
    });
    return;
  }

  const body = updatePackageSchema.parse(req.body);
  const agencyId = await getAgencyIdFromReq(req);
  const pkg = await PackageService.updatePackage({ id, agencyId, ...body });

  res.status(HTTP_STATUS.OK).json(success({ package: pkg }));
});

export const updatePackageStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { id } = req.params;
  if (!id || typeof id !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Package ID is required." },
    });
    return;
  }

  const body = updatePackageStatusSchema.parse(req.body);
  const agencyId = await getAgencyIdFromReq(req);
  const pkg = await PackageService.updatePackageStatus(id, agencyId, body.status);

  res.status(HTTP_STATUS.OK).json(success({ package: pkg }));
});

export const deletePackage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { id } = req.params;
  if (!id || typeof id !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Package ID is required." },
    });
    return;
  }

  const agencyId = await getAgencyIdFromReq(req);
  await PackageService.deletePackage(id, agencyId);

  res.status(HTTP_STATUS.NO_CONTENT).json(null);
});

export const uploadPackageImages = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { id } = req.params;
  if (!id || typeof id !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Package ID is required." },
    });
    return;
  }

  const body = uploadPackageImagesSchema.parse(req.body);
  const agencyId = await getAgencyIdFromReq(req);
  const pkg = await PackageService.uploadPackageImages({
    packageId: id,
    agencyId,
    files: body.files,
  });

  res.status(HTTP_STATUS.OK).json(success({ package: pkg }));
});

export const deletePackageImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { id, imageId } = req.params;
  if (!id || typeof id !== "string" || !imageId || typeof imageId !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Package ID and Image ID are required." },
    });
    return;
  }

  const agencyId = await getAgencyIdFromReq(req);
  const pkg = await PackageService.deletePackageImage({
    packageId: id,
    agencyId,
    imageKey: imageId,
  });

  res.status(HTTP_STATUS.OK).json(success({ package: pkg }));
});

export const setPrimaryImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { id, imageId } = req.params;
  if (!id || typeof id !== "string" || !imageId || typeof imageId !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Package ID and Image ID are required." },
    });
    return;
  }

  const body = setPrimaryImageSchema.parse(req.body);
  const agencyId = await getAgencyIdFromReq(req);
  const pkg = await PackageService.setPrimaryImage({
    packageId: id,
    agencyId,
    imageKey: body.imageId || imageId,
  });

  res.status(HTTP_STATUS.OK).json(success({ package: pkg }));
});

export const reorderImages = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { id } = req.params;
  if (!id || typeof id !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Package ID is required." },
    });
    return;
  }

  const body = reorderImagesSchema.parse(req.body);
  const agencyId = await getAgencyIdFromReq(req);
  const pkg = await PackageService.reorderImages({
    packageId: id,
    agencyId,
    imageKeys: body.imageIds,
  });

  res.status(HTTP_STATUS.OK).json(success({ package: pkg }));
});

export const getPresignedUploadUrl = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { id } = req.params;
  if (!id || typeof id !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Package ID is required." },
    });
    return;
  }

  const { mimeType, fileName } = req.query;
  if (!mimeType || typeof mimeType !== "string" || !fileName || typeof fileName !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "mimeType and fileName query parameters are required." },
    });
    return;
  }

  const agencyId = await getAgencyIdFromReq(req);
  const result = await PackageService.getPresignedUploadUrl(id, agencyId, mimeType, fileName);

  res.status(HTTP_STATUS.OK).json(success(result));
});