import { z } from "zod";

export const toggleWatchlistSchema = z.object({
  packageId: z.string().trim().min(1, "Package ID is required."),
});

export type ToggleWatchlistInput = z.infer<typeof toggleWatchlistSchema>;
