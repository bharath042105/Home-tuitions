import type {
  AvailabilityRuleDto,
  TutorDocumentDto,
  TutorProfileDto,
  TutorProfileInput,
  AvailabilityRuleInput,
  UploadUrlRequestInput,
} from "@hometuitions/shared";
import { apiClient } from "./client";

export const tutorApi = {
  getMyProfile: () => apiClient.get<TutorProfileDto>("/api/v1/tutors/me"),
  updateMyProfile: (input: TutorProfileInput) =>
    apiClient.put<TutorProfileDto>("/api/v1/tutors/me", input),

  listDocuments: () => apiClient.get<TutorDocumentDto[]>("/api/v1/tutors/me/documents"),
  requestUploadUrl: (input: UploadUrlRequestInput) =>
    apiClient.post<{ uploadUrl: string; s3Key: string }>("/api/v1/tutors/me/documents/upload-url", input),
  submitDocument: (input: { docType: string; s3Key: string }) =>
    apiClient.post<TutorDocumentDto>("/api/v1/tutors/me/documents", input),

  listAvailability: () => apiClient.get<AvailabilityRuleDto[]>("/api/v1/tutors/me/availability"),
  addAvailability: (input: AvailabilityRuleInput) =>
    apiClient.post<AvailabilityRuleDto>("/api/v1/tutors/me/availability", input),
  removeAvailability: (id: string) => apiClient.del<void>(`/api/v1/tutors/me/availability/${id}`),
};

/** Uploads directly to S3 using a presigned URL - the backend never sees the file bytes. */
export async function uploadToPresignedUrl(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!response.ok) {
    throw new Error("Upload failed - please try again");
  }
}
