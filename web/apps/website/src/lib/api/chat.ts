import { apiClient } from "./client";

export interface ChatMessageDto {
  id: string;
  senderId: string;
  body: string;
  sentAt: string;
}

export const chatApi = {
  listMessages: (bookingId: string) =>
    apiClient.get<ChatMessageDto[]>(`/api/v1/bookings/${bookingId}/chat/messages`),
};
