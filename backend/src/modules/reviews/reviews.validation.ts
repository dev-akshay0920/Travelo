import { z } from "zod";

export const submitReviewSchema = z.object({
  packageId: z.string().trim().min(1, "Package ID is required."),
  agencyId: z.string().trim().min(1, "Agency ID is required."),
  rating: z.coerce.number().min(1, "Minimum rating is 1.").max(5, "Maximum rating is 5."),
  comment: z.string().trim().max(2000).optional(),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;

export const updateReviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5).optional(),
  comment: z.string().trim().max(2000).optional(),
});

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
