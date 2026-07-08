import { z } from "zod";

export const createBookingSchema = z.object({
  tutorId: z.string().uuid(),
  studentProfileId: z.string().uuid().optional(), // required when booking as a parent
  subject: z.string().min(1),
  startTime: z.string().datetime({ offset: true }),
  endTime: z.string().datetime({ offset: true }),
  mode: z.enum(["ONLINE", "OFFLINE"]),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
