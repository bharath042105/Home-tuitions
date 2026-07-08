export interface TutorProfileDto {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  subjects: string[];
  hourlyRate: number;
  teachingMode: "ONLINE" | "OFFLINE" | "BOTH";
  serviceRadiusKm: number;
  verificationStatus: "NOT_SUBMITTED" | "SUBMITTED" | "VERIFIED" | "REJECTED";
  avgRating: number;
  reviewCount: number;
}

export interface AvailabilityRuleDto {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface TutorDocumentDto {
  id: string;
  docType: "ID_PROOF" | "QUALIFICATION";
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectReason: string | null;
  submittedAt: string;
}
