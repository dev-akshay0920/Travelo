import { z } from "zod";

export const updateAgencySchema = z.object({
  name: z.string().trim().max(100),
  slug: z.string().trim().min(6, "Slug must be at least 6 characters.").max(40, "Slug cannot exceed 40 characters.").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  about: z.string().trim().max(5000).optional(),
  yearEstablished: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  location: z
    .object({
      country: z.string().trim().max(80).optional(),
      state: z.string().trim().max(80).optional(),
      city: z.string().trim().max(80).optional(),
      address: z.string().trim().max(255).optional(),
      pincode: z.string().trim().max(10).optional(),
    })
    .optional(),
  contact: z
    .object({
      phone: z.string().trim().max(20).optional(),
      email: z.string().trim().email("Invalid email address.").max(120).optional(),
      website: z.string().trim().url("Invalid website URL.").optional(),
    })
    .optional(),
  services: z.array(z.enum(["tour_packages", "flight_booking", "hotel_booking", "honeymoon_trips", "family_holidays", "adventure_trips", "pilgrimage_tours", "corporate_travel", "visa_assistance", "international_tours", "domestic_tours"])).max(20).optional(),
});

export type UpdateAgencyInput = z.infer<typeof updateAgencySchema>;

export const submitAgencySchema = updateAgencySchema.extend({
  action: z.enum(["submit"]),
});

export type SubmitAgencyInput = z.infer<typeof submitAgencySchema>;

export const getMyAgencySchema = z.object({});

export const createAgencySchema = z.object({
  name: z.string().trim().min(2, "Agency name is required").max(100),
});
