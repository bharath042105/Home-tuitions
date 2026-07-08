export type BookingStatus =
  | "PENDING_TUTOR_ACTION"
  | "REJECTED"
  | "PENDING_PAYMENT"
  | "EXPIRED"
  | "CONFIRMED"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELLED";

export interface BookingDto {
  id: string;
  studentId: string;
  parentId: string | null;
  tutorId: string;
  subject: string;
  mode: "ONLINE" | "OFFLINE";
  startTime: string;
  endTime: string;
  status: BookingStatus;
  paymentDeadline: string | null;
  createdAt: string;
}
