import { z } from "zod";

const indianPhoneRegex = /^[6-9]\d{9}$/;
const indianPhoneMessage = "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9";

// Mirrors backend/.../leads/dto/SubmitTuitionInquiryRequest.java field-for-field.
export const tuitionInquirySchema = z.object({
  grade: z.string().min(1, "Grade/Class is required").max(50),
  board: z.string().min(1, "Board is required").max(50),
  subjects: z.array(z.string().min(1)).min(1, "Select at least one subject"),
  tuitionMode: z.string().min(1, "Tuition mode is required").max(20),
  address: z.string().max(2000).optional(),
  timings: z.string().min(1, "Timings are required").max(100),
  frequency: z.string().max(50).optional(),
  parentName: z.string().min(1, "Parent / Student name is required").max(150),
  mobile: z.string().regex(indianPhoneRegex, indianPhoneMessage),
  email: z.string().email("Please enter a valid email address").max(200).optional().or(z.literal("")),
  budget: z.string().max(50).optional(),
  remarks: z.string().max(5000).optional(),
});
export type TuitionInquiryInput = z.infer<typeof tuitionInquirySchema>;

// Mirrors backend/.../leads/dto/SubmitTutorApplicationRequest.java field-for-field.
export const tutorApplicationSchema = z.object({
  name: z.string().min(1, "Full name is required").max(150),
  fatherName: z.string().max(150).optional(),
  qualification: z.string().min(1, "Qualification is required").max(150),
  college: z.string().min(1, "College/University is required").max(200),
  percentage: z.string().min(1, "Graduation percentage is required").max(10),
  passYear: z.string().regex(/^\d{4}$/, "Enter a valid 4-digit year (e.g. 2022)"),
  interCollege: z.string().max(200).optional(),
  interPercentage: z.string().max(10).optional(),
  schoolName: z.string().max(200).optional(),
  schoolPercentage: z.string().max(10).optional(),
  localities: z.string().min(1, "Preferred localities are required").max(2000),
  commuteDistance: z.string().max(50).optional(),
  grades: z.array(z.string().min(1)).min(1, "Select at least one grade"),
  subjects: z.array(z.string().min(1)).min(1, "Select at least one subject"),
  boards: z.array(z.string().min(1)).min(1, "Select at least one board"),
  medium: z.string().max(50).optional(),
  mode: z.string().min(1, "Teaching mode is required").max(20),
  mobile: z.string().regex(indianPhoneRegex, indianPhoneMessage),
  whatsapp: z.string().regex(indianPhoneRegex, "Enter a valid 10-digit WhatsApp number starting with 6, 7, 8, or 9"),
  alternativePhone: z.string().regex(indianPhoneRegex, "Enter a valid 10-digit alternative phone number starting with 6, 7, 8, or 9").optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email address").max(200),
  occupation: z.string().max(50).optional(),
  experience: z.string().max(50).optional(),
  expectedRate: z.string().min(1, "Expected rate is required").max(50),
  timings: z.string().max(100).optional(),
  bio: z.string().max(5000).optional(),
  photoUrl: z.string().optional().or(z.literal("")),
  aadhaarUrl: z.string().optional().or(z.literal("")),
  degreeUrl: z.string().optional().or(z.literal("")),
  resumeUrl: z.string().optional().or(z.literal("")),
});
export type TutorApplicationInput = z.infer<typeof tutorApplicationSchema>;

// Mirrors backend/.../leads/dto/SubmitContactMessageRequest.java field-for-field.
export const contactMessageSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  phone: z.string().regex(indianPhoneRegex, indianPhoneMessage),
  email: z.string().email("Please enter a valid email address").max(200).optional().or(z.literal("")),
  message: z.string().min(1, "Message is required").max(5000),
});
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export type LeadStatus = "NEW" | "CONTACTED" | "CLOSED";
