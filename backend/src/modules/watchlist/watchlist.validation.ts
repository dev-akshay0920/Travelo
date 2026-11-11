import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID.");

export const toggleWatchlistSchema = z.discriminatedUnion("itemType", [
  z.object({ itemType: z.literal("package"), packageId: objectIdSchema }).strict(),
  z.object({ itemType: z.literal("agency"), agencyId: objectIdSchema }).strict(),
]);

export const listWatchlistQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    itemType: z.enum(["package", "agency"]).optional(),
  })
  .strict();

export const savedStatusSchema = z.object({
  packageIds: z.array(objectIdSchema).max(100).default([]),
  agencyIds: z.array(objectIdSchema).max(100).default([]),
}).strict().refine((value) => value.packageIds.length + value.agencyIds.length > 0, {
  message: "Provide at least one package or agency ID.",
});

export const watchlistIdParamsSchema = z.object({ packageId: objectIdSchema }).strict();
export const watchlistAgencyIdParamsSchema = z.object({ agencyId: objectIdSchema }).strict();

export type ToggleWatchlistInput = z.infer<typeof toggleWatchlistSchema>;
export type ListWatchlistQuery = z.infer<typeof listWatchlistQuerySchema>;
export type SavedStatusInput = z.infer<typeof savedStatusSchema>;
