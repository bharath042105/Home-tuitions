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
   * Uploads a file by first posting to backend /api/v1/leads/upload-file,
   * with fallback to S3 presigned PUT and local base64.
   */
  uploadDocumentFile: async (file: File, documentType?: string): Promise<string> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

    // 1. Direct multipart upload to backend (stores in DB/S3 and returns permanent public URL)
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (documentType) {
        formData.append("documentType", documentType);
      }

      const response = await fetch(`${baseUrl}/api/v1/leads/upload-file`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = (await response.json()) as LeadUploadUrlResponse;
        if (data.publicUrl) {
          return data.publicUrl;
        }
      }
    } catch (err) {
      console.warn("Direct upload-file failed, trying presigned upload fallback:", err);
    }

    // 2. Presigned URL fallback
    try {
      const res = await leadsApi.getUploadUrl(file.name, file.type || "application/octet-stream", documentType);
      if (res && res.uploadUrl && res.publicUrl) {
        const uploadRes = await fetch(res.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        });

        if (uploadRes.ok) {
          return res.publicUrl;
        }
      }
    } catch (e) {
      console.warn("Presigned S3/R2 upload failed, falling back to data URL encoding:", e);
    }

    // 3. Client-side fallback to base64 Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },
};
