import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["traveller", "agency"], { message: "Invalid role" }),
  agencyName: z.string().trim().max(100).optional(),
}).refine((data) => {
  if (data.role === "agency" && !data.agencyName?.trim()) {
    return false;
  }
  return true;
}, {
  message: "Agency name is required for agency signup",
  path: ["agencyName"],
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.infer<typeof signInSchema>;
