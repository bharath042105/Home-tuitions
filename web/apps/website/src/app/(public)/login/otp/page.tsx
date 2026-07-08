"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { otpRequestSchema, otpVerifySchema, type OtpRequestInput, type OtpVerifyInput } from "@hometuitions/shared";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/features/auth/AuthShell";
import { Button, FormField, Input } from "@/components/ui";
import { apiClient, getCurrentUserRole, setTokens } from "@/lib/api/client";

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

const ROLE_HOME: Record<string, string> = {
  STUDENT: "/student/search",
  PARENT: "/parent/children",
  TUTOR: "/tutor/bookings",
};

export default function OtpLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState<string | null>(null);

  const requestForm = useForm<OtpRequestInput>({ resolver: zodResolver(otpRequestSchema) });
  const verifyForm = useForm<OtpVerifyInput>({ resolver: zodResolver(otpVerifySchema) });

  const requestOtpMutation = useMutation({
    mutationFn: (input: OtpRequestInput) => apiClient.post<void>("/api/v1/auth/otp/request", input),
    onSuccess: (_data, variables) => {
      setPhone(variables.phone);
      verifyForm.setValue("phone", variables.phone);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (input: OtpVerifyInput) => apiClient.post<TokenResponse>("/api/v1/auth/otp/verify", input),
    onSuccess: (data) => {
      setTokens(data);
      const role = getCurrentUserRole();
      router.push((role && ROLE_HOME[role]) || "/");
    },
  });

  if (!phone) {
    return (
      <AuthShell title="Log in with phone">
        <form
          className="flex flex-col gap-4"
          onSubmit={requestForm.handleSubmit((values) => requestOtpMutation.mutate(values))}
        >
          <FormField label="Phone number" error={requestForm.formState.errors.phone?.message}>
            <Input {...requestForm.register("phone")} type="tel" placeholder="+919876543210" />
          </FormField>

          <Button type="submit" loading={requestOtpMutation.isPending} className="mt-2 w-full">
            Send code
          </Button>

          {requestOtpMutation.isError && (
            <p role="alert" className="text-sm text-danger-500">
              {requestOtpMutation.error.message}
            </p>
          )}
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Enter the code" subtitle={`Sent to ${phone}`}>
      <form
        className="flex flex-col gap-4"
        onSubmit={verifyForm.handleSubmit((values) => verifyOtpMutation.mutate(values))}
      >
        <FormField label="6-digit code" error={verifyForm.formState.errors.code?.message}>
          <Input
            {...verifyForm.register("code")}
            inputMode="numeric"
            maxLength={6}
            className="tracking-widest"
          />
        </FormField>

        <Button type="submit" loading={verifyOtpMutation.isPending} className="mt-2 w-full">
          Verify & log in
        </Button>

        {verifyOtpMutation.isError && (
          <p role="alert" className="text-sm text-danger-500">
            {verifyOtpMutation.error.message}
          </p>
        )}
      </form>

      <button
        type="button"
        onClick={() => setPhone(null)}
        className="mt-6 text-sm text-neutral-500 hover:text-brand-500 hover:underline dark:text-neutral-400"
      >
        Use a different number
      </button>
    </AuthShell>
  );
}
