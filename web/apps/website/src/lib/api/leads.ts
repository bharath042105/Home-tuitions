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
   * Uploads a file by first requesting a presigned URL, PUT-ing the file directly to S3 / Cloudflare R2,
   * and returning the persistent public/download URL.
   * If presigned upload is unavailable or fails, gracefully falls back to a base64 data URL.
   */
  uploadDocumentFile: async (file: File, documentType?: string): Promise<string> => {
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

    // Client-side fallback to base64 Data URL (ensures tutor document is always preserved)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },
};
