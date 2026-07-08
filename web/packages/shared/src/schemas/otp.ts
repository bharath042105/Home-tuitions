import { z } from "zod";

const e164Phone = z.string().regex(/^\+[1-9]\d{7,14}$/, "Enter a valid phone number with country code");

export const otpRequestSchema = z.object({
  phone: e164Phone,
});
export type OtpRequestInput = z.infer<typeof otpRequestSchema>;

export const otpVerifySchema = z.object({
  phone: e164Phone,
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
