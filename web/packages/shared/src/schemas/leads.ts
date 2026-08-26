import { z } from "zod";

// Mirrors backend/.../leads/dto/SubmitTuitionInquiryRequest.java field-for-field.
export const tuitionInquirySchema = z.object({
  grade: z.string().min(1, "Required").max(50),
  board: z.string().min(1, "Required").max(50),
  subjects: z.array(z.string().min(1)).min(1, "Select at least one subject"),
  tuitionMode: z.string().min(1).max(20),
  address: z.string().max(2000).optional(),
  timings: z.string().min(1, "Required").max(100),
  frequency: z.string().max(50).optional(),
  parentName: z.string().min(1, "Required").max(150),
  mobile: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().email().max(200).optional().or(z.literal("")),
  budget: z.string().max(50).optional(),
  remarks: z.string().max(5000).optional(),
});
export type TuitionInquiryInput = z.infer<typeof tuitionInquirySchema>;

// Mirrors backend/.../leads/dto/SubmitTutorApplicationRequest.java field-for-field.
export const tutorApplicationSchema = z.object({
  name: z.string().min(1, "Required").max(150),
  fatherName: z.string().max(150).optional(),
  qualification: z.string().min(1, "Required").max(150),
  college: z.string().min(1, "Required").max(200),
  percentage: z.string().min(1, "Required").max(10),
  passYear: z.string().regex(/^\d{4}$/, "Enter a valid 4-digit year"),
  interCollege: z.string().max(200).optional(),
  interPercentage: z.string().max(10).optional(),
  schoolName: z.string().max(200).optional(),
  schoolPercentage: z.string().max(10).optional(),
  localities: z.string().min(1, "Required").max(2000),
  commuteDistance: z.string().max(50).optional(),
  grades: z.array(z.string().min(1)).min(1, "Select at least one grade"),
  subjects: z.array(z.string().min(1)).min(1, "Select at least one subject"),
  boards: z.array(z.string().min(1)).min(1, "Select at least one board"),
  medium: z.string().max(50).optional(),
  mode: z.string().min(1).max(20),
  mobile: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  whatsapp: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit WhatsApp number"),
  alternativePhone: z.string().regex(/^\d{10}$/).optional().or(z.literal("")),
  email: z.string().email().max(200),
  occupation: z.string().max(50).optional(),
  experience: z.string().max(50).optional(),
  expectedRate: z.string().min(1, "Required").max(50),
  timings: z.string().max(100).optional(),
  bio: z.string().max(5000).optional(),
});
export type TutorApplicationInput = z.infer<typeof tutorApplicationSchema>;

// Mirrors backend/.../leads/dto/SubmitContactMessageRequest.java field-for-field.
export const contactMessageSchema = z.object({
  name: z.string().min(1, "Required").max(150),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
  email: z.string().email().max(200).optional().or(z.literal("")),
  message: z.string().min(1, "Required").max(5000),
});
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export type LeadStatus = "NEW" | "CONTACTED" | "CLOSED";
