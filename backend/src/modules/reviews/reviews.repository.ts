import { Types } from "mongoose";
import type { ReviewDocument, ReviewStatus } from "./reviews.model";
import { Review } from "./reviews.model";

export interface ReviewCreateInput {
  travellerId: Types.ObjectId;
  packageId: Types.ObjectId;
  agencyId: Types.ObjectId;
  rating: number;
  comment?: string;
}

export interface ReviewUpdateInput {
  rating?: number;
  comment?: string;
}

export interface ReviewFilters {
  packageId?: string;
  agencyId?: string;
  travellerId?: string;
  status?: ReviewStatus;
  page?: number;
  limit?: number;
}

export interface ReviewListResponse {
  items: Array<{
    id: string;
    travellerId: string;
    packageId: string;
    agencyId: string;
    rating: number;
    comment?: string;
    status: ReviewStatus;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export const ReviewsRepository = {
  async findByTravellerAndPackage(travellerId: Types.ObjectId, packageId: Types.ObjectId): Promise<ReviewDocument | null> {
    if (!Types.ObjectId.isValid(travellerId) || !Types.ObjectId.isValid(packageId)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    return await Review.findOne({ travellerId, packageId }).exec();
  },

  async create(input: ReviewCreateInput): Promise<ReviewDocument> {
    const review = new Review(input);
    return review.save();
  },

  async update(id: Types.ObjectId, data: ReviewUpdateInput): Promise<ReviewDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const updated = await Review.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
    return updated as Promise<ReviewDocument | null>;
  },

  async list(filters: ReviewFilters): Promise<ReviewListResponse> {
    const query: Record<string, unknown> = {};
    if (filters.packageId && Types.ObjectId.isValid(filters.packageId)) {
      query.packageId = filters.packageId;
    }
    if (filters.agencyId && Types.ObjectId.isValid(filters.agencyId)) {
      query.agencyId = filters.agencyId;
    }
    if (filters.travellerId && Types.ObjectId.isValid(filters.travellerId)) {
      query.travellerId = filters.travellerId;
    }
    if (filters.status) {
      query.status = filters.status;
    } else {
      query.status = "approved";
    }

    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
      Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      Review.countDocuments(query).exec(),
    ]);

    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    return {
      items: items.map((doc: ReviewDocument) => ({
        id: String(doc._id),
        travellerId: String(doc.travellerId),
        packageId: String(doc.packageId),
        agencyId: String(doc.agencyId),
        rating: doc.rating,
        comment: doc.comment,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages,
    };
  },

  async getStats(packageId?: string, agencyId?: string): Promise<ReviewStats> {
    const query: Record<string, unknown> = { status: "approved" };
    if (packageId && Types.ObjectId.isValid(packageId)) {
      query.packageId = packageId;
    }
    if (agencyId && Types.ObjectId.isValid(agencyId)) {
      query.agencyId = agencyId;
    }

    // @ts-expect-error Mongoose 8 overload resolution conflict with strict TypeScript
    const reviews = await Review.find(query, { rating: 1, _id: 0 }).exec();
    const total = reviews.length;
    const averageRating = total > 0 ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / total : 0;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r: { rating: number }) => {
      ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: total,
      ratingDistribution,
    };
  },

  async delete(id: Types.ObjectId): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await (Review as unknown as { deleteOne: (filter: Record<string, unknown>) => { exec: () => Promise<{ deletedCount: number }> } }).deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;  },
};
