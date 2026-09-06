import type {
  ContactMessageDto,
  ContactMessageInput,
  LeadUploadUrlResponse,
  TuitionInquiryDto,
  TuitionInquiryInput,
  TutorApplicationDto,
  TutorApplicationInput,
} from "@hometuitions/shared";
import { apiClient } from "./client";

export const leadsApi = {
  submitTuitionInquiry: (input: TuitionInquiryInput) =>
    apiClient.post<TuitionInquiryDto>("/api/v1/leads/tuition-inquiries", input),

  submitTutorApplication: (input: TutorApplicationInput) =>
    apiClient.post<TutorApplicationDto>("/api/v1/leads/tutor-applications", input),

  submitContactMessage: (input: ContactMessageInput) =>
    apiClient.post<ContactMessageDto>("/api/v1/leads/contact-messages", input),

  getUploadUrl: (filename: string, contentType: string, documentType?: string) =>
    apiClient.post<LeadUploadUrlResponse>("/api/v1/leads/upload-url", {
      filename,
      contentType,
      documentType,
    }),

  /**
   * Uploads a file to backend /api/v1/leads/upload-file (multipart).
   * Returns the permanent public URL on success, or throws on failure.
   */
  uploadDocumentFile: async (file: File, documentType?: string): Promise<string> => {
    // Use the same base URL that the apiClient uses (known to work for form submission)
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

    // Validate file size client-side (max 10MB to match backend Spring config)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 10 MB.`);
    }

    const formData = new FormData();
    formData.append("file", file);
    if (documentType) {
      formData.append("documentType", documentType);
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/api/v1/leads/upload-file`, {
        method: "POST",
        body: formData,
      });
    } catch (networkErr) {
      console.error("Document upload network error:", networkErr);
      throw new Error(`Network error uploading "${file.name}". Please check your internet connection and try again.`);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`Document upload HTTP error ${response.status}:`, errorText);
      throw new Error(`Upload failed for "${file.name}" (HTTP ${response.status}). Please try again.`);
    }

    const data = (await response.json()) as LeadUploadUrlResponse;
    if (!data.publicUrl) {
      throw new Error(`Upload succeeded but no download URL was returned for "${file.name}". Please try again.`);
    }

    return data.publicUrl;
  },
};
