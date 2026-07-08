import { z } from "zod";

export const studentProfileSchema = z.object({
  displayName: z.string().min(1, "Required").max(150),
  grade: z.string().max(50).optional(),
  subjectsOfInterest: z.string().max(1000).optional(),
  city: z.string().max(100).optional(),
});
export type StudentProfileInput = z.infer<typeof studentProfileSchema>;

export const tutorSearchFiltersSchema = z.object({
  subject: z.string().optional(),
  mode: z.enum(["ONLINE", "OFFLINE"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  radiusKm: z.coerce.number().int().min(1).optional(),
});
export type TutorSearchFiltersInput = z.infer<typeof tutorSearchFiltersSchema>;
