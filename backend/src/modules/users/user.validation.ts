import { z } from "zod";

export const updateMyProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
  })
  .strict();

export type UpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>;
