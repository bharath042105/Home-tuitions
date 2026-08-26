import type {
  ContactMessageDto,
  ContactMessageInput,
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
};
