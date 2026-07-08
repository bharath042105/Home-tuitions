import type {
  PageDto,
  StudentProfileDto,
  StudentProfileInput,
  TutorProfileDto,
  TutorSearchResultDto,
} from "@hometuitions/shared";
import { apiClient } from "./client";

export interface TutorSearchParams {
  lat: number;
  lng: number;
  radiusKm?: number;
  subject?: string;
  mode?: "ONLINE" | "OFFLINE";
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  page?: number;
}

export const studentApi = {
  getMyProfile: () => apiClient.get<StudentProfileDto>("/api/v1/students/me"),
  updateMyProfile: (input: StudentProfileInput) =>
    apiClient.put<StudentProfileDto>("/api/v1/students/me", input),

  searchTutors: (params: TutorSearchParams) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) query.set(key, String(value));
    });
    return apiClient.get<PageDto<TutorSearchResultDto>>(`/api/v1/tutors/search?${query.toString()}`);
  },

  getTutorProfile: (id: string) => apiClient.get<TutorProfileDto>(`/api/v1/tutors/${id}/profile`),
};
