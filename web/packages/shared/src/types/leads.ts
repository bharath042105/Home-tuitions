import type { LeadStatus } from "../schemas/leads";

export interface TuitionInquiryDto {
  id: string;
  grade: string;
  board: string;
  subjects: string[];
  tuitionMode: string;
  address: string | null;
  timings: string;
  frequency: string | null;
  parentName: string;
  mobile: string;
  email: string | null;
  budget: string | null;
  remarks: string | null;
  status: LeadStatus;
  createdAt: string;
}

export interface TutorApplicationDto {
  id: string;
  name: string;
  fatherName: string | null;
  qualification: string;
  college: string;
  percentage: string;
  passYear: string;
  interCollege: string | null;
  interPercentage: string | null;
  schoolName: string | null;
  schoolPercentage: string | null;
  localities: string;
  commuteDistance: string | null;
  grades: string[];
  subjects: string[];
  boards: string[];
  medium: string | null;
  mode: string;
  mobile: string;
  whatsapp: string;
  alternativePhone: string | null;
  email: string;
  occupation: string | null;
  experience: string | null;
  expectedRate: string;
  timings: string | null;
  bio: string | null;
  photoUrl: string | null;
  aadhaarUrl: string | null;
  degreeUrl: string | null;
  resumeUrl: string | null;
  status: LeadStatus;
  createdAt: string;
}

export interface ContactMessageDto {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  status: LeadStatus;
  createdAt: string;
}

export interface LeadUploadUrlResponse {
  uploadUrl: string | null;
  key: string;
  publicUrl: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
