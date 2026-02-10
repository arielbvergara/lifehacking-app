import { z } from "zod";

export const signupSchema = z.object({
  name: z.string()
    .max(100, "Name is too long")
    .optional()
    .or(z.literal("")),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export type SignupFormData = z.infer<typeof signupSchema>;
