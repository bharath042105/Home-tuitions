import type {
  ContactMessageDto,
  LeadStatus,
  PageResponse,
  TuitionInquiryDto,
  TutorApplicationDto,
} from "@hometuitions/shared";
import { apiClient } from "./client";

export const leadsApi = {
  listTuitionInquiries: (page = 0, size = 20) =>
    apiClient.get<PageResponse<TuitionInquiryDto>>(`/api/v1/admin/leads/tuition-inquiries?page=${page}&size=${size}`),
  updateTuitionInquiryStatus: (id: string, status: LeadStatus) =>
    apiClient.post<TuitionInquiryDto>(`/api/v1/admin/leads/tuition-inquiries/${id}/status`, { status }),

  listTutorApplications: (page = 0, size = 20) =>
    apiClient.get<PageResponse<TutorApplicationDto>>(`/api/v1/admin/leads/tutor-applications?page=${page}&size=${size}`),
  updateTutorApplicationStatus: (id: string, status: LeadStatus) =>
    apiClient.post<TutorApplicationDto>(`/api/v1/admin/leads/tutor-applications/${id}/status`, { status }),

  listContactMessages: (page = 0, size = 20) =>
    apiClient.get<PageResponse<ContactMessageDto>>(`/api/v1/admin/leads/contact-messages?page=${page}&size=${size}`),
  updateContactMessageStatus: (id: string, status: LeadStatus) =>
    apiClient.post<ContactMessageDto>(`/api/v1/admin/leads/contact-messages/${id}/status`, { status }),
};
