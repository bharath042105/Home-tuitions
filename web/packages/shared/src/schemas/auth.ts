import { z } from "zod";

// Single source of truth for auth form validation, consumed by both
// apps/website (React Hook Form) and any server-side re-validation.
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["STUDENT", "PARENT", "TUTOR"]),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;
