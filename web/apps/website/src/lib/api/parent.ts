import type {
  ChildProfileInput,
  ParentProfileDto,
  ParentProfileInput,
  StudentProfileDto,
} from "@hometuitions/shared";
import { apiClient } from "./client";

export const parentApi = {
  getMyProfile: () => apiClient.get<ParentProfileDto>("/api/v1/parents/me"),
  updateMyProfile: (input: ParentProfileInput) =>
    apiClient.put<ParentProfileDto>("/api/v1/parents/me", input),

  listChildren: () => apiClient.get<StudentProfileDto[]>("/api/v1/parents/me/children"),
  addChild: (input: ChildProfileInput) =>
    apiClient.post<StudentProfileDto>("/api/v1/parents/me/children", input),
  updateChild: (id: string, input: ChildProfileInput) =>
    apiClient.put<StudentProfileDto>(`/api/v1/parents/me/children/${id}`, input),
};
