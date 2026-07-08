export interface StudentProfileDto {
  id: string;
  userId: string;
  displayName: string;
  grade: string | null;
  subjectsOfInterest: string | null;
  city: string | null;
}

export interface TutorSearchResultDto {
  id: string;
  displayName: string;
  bio: string | null;
  subjects: string[];
  hourlyRate: number;
  teachingMode: "ONLINE" | "OFFLINE" | "BOTH";
  avgRating: number;
  reviewCount: number;
  distanceKm: number | null;
}

export interface PageDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
