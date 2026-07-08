import { z } from "zod";

export const parentProfileSchema = z.object({
  displayName: z.string().min(1, "Required").max(150),
});
export type ParentProfileInput = z.infer<typeof parentProfileSchema>;

// Children are StudentProfiles created by a parent - same shape as a student's
// own profile edit form (see schemas/student.ts's studentProfileSchema), reused
// here rather than duplicated.
export { studentProfileSchema as childProfileSchema } from "./student";
export type { StudentProfileInput as ChildProfileInput } from "./student";
