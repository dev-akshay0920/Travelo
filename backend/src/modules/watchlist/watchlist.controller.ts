import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { WatchlistService } from "./watchlist.service";
import {
  listWatchlistQuerySchema,
  savedStatusSchema,
  toggleWatchlistSchema,
} from "./watchlist.validation";

export const getSavedStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }
  const input = savedStatusSchema.parse(req.body);
  const result = await WatchlistService.getSavedStatus(req.user.sub, input);
  res.status(HTTP_STATUS.OK).json(success(result));
});

export const toggleWatchlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const input = toggleWatchlistSchema.parse(req.body);
  const result = await WatchlistService.toggleWatchlist({
    travellerId: req.user.sub,
    ...input,
  });

  res.status(HTTP_STATUS.OK).json(success(result));
});

export const getWatchlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { page, limit, itemType } = listWatchlistQuerySchema.parse(req.query);

  const result = await WatchlistService.getWatchlist({
    travellerId: req.user.sub,
    itemType,
    status: "active",
    page,
    limit,
  });

  res.status(HTTP_STATUS.OK).json(success(result));
});

export const isPackageSaved = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { packageId } = req.params;
  if (!packageId || typeof packageId !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Package ID is required." },
    });
    return;
  }

  const saved = await WatchlistService.isPackageSaved(req.user.sub, packageId);
  res.status(HTTP_STATUS.OK).json(success({ saved }));
});

export const isAgencySaved = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { agencyId } = req.params;
  if (!agencyId || typeof agencyId !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Agency ID is required." },
    });
    return;
  }

  const saved = await WatchlistService.isAgencySaved(req.user.sub, agencyId);
  res.status(HTTP_STATUS.OK).json(success({ saved }));
});
