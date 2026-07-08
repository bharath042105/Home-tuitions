import type { BookingDto, CreateBookingInput } from "@hometuitions/shared";
import { apiClient } from "./client";

export const bookingApi = {
  create: (input: CreateBookingInput) => apiClient.post<BookingDto>("/api/v1/bookings", input),
  listMine: () => apiClient.get<BookingDto[]>("/api/v1/bookings/me"),
  respond: (id: string, action: "ACCEPT" | "REJECT") =>
    apiClient.post<BookingDto>(`/api/v1/bookings/${id}/respond`, { action }),
  cancel: (id: string) => apiClient.post<BookingDto>(`/api/v1/bookings/${id}/cancel`),
};
