import type {
  ReviewUpdateInput,
  ReviewFilters,
  ReviewListResponse,
  ReviewStats,
} from "./reviews.repository";
import { ReviewsRepository } from "./reviews.repository";
import { Review } from "./reviews.model";
import { ValidationError, ConflictError, NotFoundError } from "../../shared/errors/app-error";
import { Types } from "mongoose";

export interface SubmitReviewInput {
  travellerId: string;
  packageId: string;
  agencyId: string;
  rating: number;
  comment?: string;
}

export interface ReviewDTO {
  id: string;
  travellerId: string;
  packageId: string;
  agencyId: string;
  rating: number;
  comment?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const ReviewsService = {
  async submitReview(input: SubmitReviewInput): Promise<ReviewDTO> {
    const { travellerId, packageId, agencyId, rating, comment } = input;

    if (!Types.ObjectId.isValid(travellerId)) {
      throw new ValidationError("Invalid traveller ID.");
    }
    if (!Types.ObjectId.isValid(packageId)) {
      throw new ValidationError("Invalid package ID.");
    }
    if (!Types.ObjectId.isValid(agencyId)) {
      throw new ValidationError("Invalid agency ID.");
    }
    if (!rating || rating < 1 || rating > 5) {
      throw new ValidationError("Rating must be between 1 and 5.");
    }

    const existing = await ReviewsRepository.findByTravellerAndPackage(
      new Types.ObjectId(travellerId),
      new Types.ObjectId(packageId)
    );

    if (existing) {
      throw new ConflictError("You have already reviewed this package.");
    }

    const created = await ReviewsRepository.create({
      travellerId: new Types.ObjectId(travellerId),
      packageId: new Types.ObjectId(packageId),
      agencyId: new Types.ObjectId(agencyId),
      rating,
      comment: comment?.trim(),
    });

    return {
      id: String(created._id),
      travellerId: String(created.travellerId),
      packageId: String(created.packageId),
      agencyId: String(created.agencyId),
      rating: created.rating,
      comment: created.comment,
      status: created.status,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  },

  async updateReview(id: string, travellerId: string, data: ReviewUpdateInput): Promise<ReviewDTO | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid review ID.");
    }
    if (!Types.ObjectId.isValid(travellerId)) {
      throw new ValidationError("Invalid traveller ID.");
    }

    // Verify ownership
    const owned = await (Review as unknown as { findOne: (filter: Record<string, unknown>) => { exec: () => Promise<{ _id: Types.ObjectId; travellerId: Types.ObjectId } | null> } }).findOne({ _id: new Types.ObjectId(id), travellerId: new Types.ObjectId(travellerId) }).exec();
    if (!owned) {
      throw new NotFoundError("Review not found or you do not own it.");
    }

    const updated = await ReviewsRepository.update(new Types.ObjectId(id), data);
    if (!updated) {
      throw new NotFoundError("Review not found.");
    }

    return {
      id: String(updated._id),
      travellerId: String(updated.travellerId),
      packageId: String(updated.packageId),
      agencyId: String(updated.agencyId),
      rating: updated.rating,
      comment: updated.comment,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  },

  async getReviews(filters: ReviewFilters): Promise<ReviewListResponse> {
    return ReviewsRepository.list(filters);
  },

  async getStats(packageId?: string, agencyId?: string): Promise<ReviewStats> {
    return ReviewsRepository.getStats(packageId, agencyId);
  },

  async deleteReview(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    return ReviewsRepository.delete(new Types.ObjectId(id));
  },
};
