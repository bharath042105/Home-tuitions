import { apiClient } from "./client";

export interface PaymentOrderDto {
  bookingId: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
}

export const paymentApi = {
  getOrder: (bookingId: string) =>
    apiClient.get<PaymentOrderDto>(`/api/v1/bookings/${bookingId}/payment-order`),
};
