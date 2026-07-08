export type Role = "STUDENT" | "PARENT" | "TUTOR" | "ADMIN";

export type UserStatus = "UNVERIFIED_EMAIL" | "ACTIVE" | "SUSPENDED";

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export type VerificationStatus = "NOT_SUBMITTED" | "SUBMITTED" | "VERIFIED" | "REJECTED";

export interface TutorProfile {
  id: string;
  userId: string;
  bio: string;
  subjects: string[];
  hourlyRate: number;
  teachingMode: "ONLINE" | "OFFLINE" | "BOTH";
  serviceRadiusKm: number;
  verificationStatus: VerificationStatus;
  avgRating: number;
  reviewCount: number;
}
