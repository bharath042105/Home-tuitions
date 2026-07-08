import type { BookingDto } from "@hometuitions/shared";
import { apiClient } from "./client";

export interface AdminUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: "STUDENT" | "PARENT" | "TUTOR" | "ADMIN";
  status: "UNVERIFIED_EMAIL" | "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

export interface AdminTutorDocument {
  id: string;
  tutorId: string;
  docType: "ID_PROOF" | "QUALIFICATION";
  status: "PENDING" | "APPROVED" | "REJECTED";
  downloadUrl: string;
  submittedAt: string;
}

export interface AdminDispute {
  id: string;
  bookingId: string;
  reason: string;
  status: "OPEN" | "RESOLVED";
  resolution: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface AdminTicket {
  id: string;
  raisedBy: string;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  createdAt: string;
}

export interface AdminTicketMessage {
  id: string;
  senderId: string;
  body: string;
  sentAt: string;
}

export interface AdminAnalytics {
  totalStudents: number;
  totalParents: number;
  totalTutors: number;
  pendingVerifications: number;
  totalBookings: number;
  openDisputes: number;
  openTickets: number;
  totalRevenueReleased: number;
}

export const adminApi = {
  // Verifications
  listPendingVerifications: () => apiClient.get<AdminTutorDocument[]>("/api/v1/admin/verifications/pending"),
  decideVerification: (documentId: string, approve: boolean, rejectReason?: string) =>
    apiClient.post<AdminTutorDocument>(`/api/v1/admin/verifications/${documentId}/decision`, { approve, rejectReason }),

  // Users
  listUsers: (role?: string) => apiClient.get<AdminUser[]>(`/api/v1/admin/users${role ? `?role=${role}` : ""}`),
  suspendUser: (id: string) => apiClient.post<AdminUser>(`/api/v1/admin/users/${id}/suspend`),
  reinstateUser: (id: string) => apiClient.post<AdminUser>(`/api/v1/admin/users/${id}/reinstate`),

  // Bookings
  listBookings: (status?: string) => apiClient.get<BookingDto[]>(`/api/v1/admin/bookings${status ? `?status=${status}` : ""}`),

  // Disputes
  listOpenDisputes: () => apiClient.get<AdminDispute[]>("/api/v1/admin/disputes"),
  resolveDispute: (bookingId: string, resolution: "COMPLETE_AND_PAY" | "CANCEL_AND_REFUND", note: string) =>
    apiClient.post<AdminDispute>(`/api/v1/admin/disputes/${bookingId}/resolve`, { resolution, note }),

  // Tickets
  listTickets: (status?: string) => apiClient.get<AdminTicket[]>(`/api/v1/admin/tickets${status ? `?status=${status}` : ""}`),
  listTicketMessages: (id: string) => apiClient.get<AdminTicketMessage[]>(`/api/v1/admin/tickets/${id}/messages`),
  replyToTicket: (id: string, body: string) =>
    apiClient.post<AdminTicketMessage>(`/api/v1/admin/tickets/${id}/messages`, { body }),
  closeTicket: (id: string) => apiClient.post<AdminTicket>(`/api/v1/admin/tickets/${id}/close`),

  // Analytics
  getAnalytics: () => apiClient.get<AdminAnalytics>("/api/v1/admin/analytics"),
};
