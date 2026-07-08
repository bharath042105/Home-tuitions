import { apiClient } from "./client";

export interface AttendanceRecordDto {
  id: string;
  markedBy: string;
  status: "PRESENT" | "ABSENT";
  markedAt: string;
}

export const attendanceApi = {
  list: (bookingId: string) => apiClient.get<AttendanceRecordDto[]>(`/api/v1/bookings/${bookingId}/attendance`),
  mark: (bookingId: string, status: "PRESENT" | "ABSENT") =>
    apiClient.post<AttendanceRecordDto>(`/api/v1/bookings/${bookingId}/attendance`, { status }),
};
