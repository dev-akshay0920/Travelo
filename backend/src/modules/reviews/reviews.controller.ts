import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { success } from "../../shared/responses/api-response";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ReviewsService } from "./reviews.service";

export const submitReview = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
    return;
  }

  const { packageId, agencyId, rating, comment } = req.body;
  if (!packageId || typeof packageId !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Package ID is required." },
    });
    return;
  }
  if (!agencyId || typeof agencyId !== "string") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Agency ID is required." },
    });
    return;
  }
  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Rating must be between 1 and 5." },
    });
    return;
  }

  const review = await ReviewsService.submitReview({
    travellerId: req.user.sub,
    packageId,
    agencyId,
    rating,
    comment,
  });

  res.status(HTTP_STATUS.OK).json(success({ review }));
});

export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const { packageId, agencyId } = req.query;
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;

  const result = await ReviewsService.getReviews({
    packageId: typeof packageId === "string" ? packageId : undefined,
    agencyId: typeof agencyId === "string" ? agencyId : undefined,
    status: "approved",
    page,
    limit,
  });

  res.status(HTTP_STATUS.OK).json(success(result));
});

export const getReviewStats = asyncHandler(async (req: Request, res: Response) => {
  const { packageId, agencyId } = req.query;

  const stats = await ReviewsService.getStats(
    typeof packageId === "string" ? packageId : undefined,
    typeof agencyId === "string" ? agencyId : undefined
  );

  res.status(HTTP_STATUS.OK).json(success(stats));
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
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
      error: { code: "BAD_REQUEST", message: "Review ID is required." },
    });
    return;
  }

  const { rating, comment } = req.body;
  const review = await ReviewsService.updateReview(id, req.user.sub, {
    ...(rating !== undefined && { rating }),
    ...(comment !== undefined && { comment }),
  });

  if (!review) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Review not found." },
    });
    return;
  }

  res.status(HTTP_STATUS.OK).json(success({ review }));
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
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
      error: { code: "BAD_REQUEST", message: "Review ID is required." },
    });
    return;
  }

  const deleted = await ReviewsService.deleteReview(id);
  if (!deleted) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Review not found." },
    });
    return;
  }

  res.status(HTTP_STATUS.OK).json(success({ deleted: true }));
});
