import { z } from "zod";

export const tutorProfileSchema = z.object({
  displayName: z.string().min(1, "Required").max(150),
  bio: z.string().max(2000).optional(),
  subjects: z.array(z.string().min(1)).min(1, "Add at least one subject"),
  hourlyRate: z.coerce.number().min(0),
  teachingMode: z.enum(["ONLINE", "OFFLINE", "BOTH"]),
  serviceRadiusKm: z.coerce.number().int().min(1).optional(),
});
export type TutorProfileInput = z.infer<typeof tutorProfileSchema>;

export const availabilityRuleSchema = z
  .object({
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });
export type AvailabilityRuleInput = z.infer<typeof availabilityRuleSchema>;

export const uploadUrlRequestSchema = z.object({
  docType: z.enum(["ID_PROOF", "QUALIFICATION"]),
  filename: z.string().min(1),
  contentType: z.string().min(1),
});
export type UploadUrlRequestInput = z.infer<typeof uploadUrlRequestSchema>;
