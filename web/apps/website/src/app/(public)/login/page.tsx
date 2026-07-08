"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@hometuitions/shared";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/features/auth/AuthShell";
import { Button, FormField, Input } from "@/components/ui";
import { apiClient, getCurrentUserRole, setTokens } from "@/lib/api/client";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

// Landing after login used to always be the public "/" marketing page - which still
// shows a "Log in" button in its header regardless of auth state, so a successful
// login looked indistinguishable from having failed and stayed put. Route to a
// role-appropriate page instead.
const ROLE_HOME: Record<string, string> = {
  STUDENT: "/student/search",
  PARENT: "/parent/children",
  TUTOR: "/tutor/bookings",
};

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => apiClient.post<LoginResponse>("/api/v1/auth/login", input),
    onSuccess: (data) => {
      setTokens(data);
      const role = getCurrentUserRole();
      router.push((role && ROLE_HOME[role]) || "/");
    },
  });

  return (
    <AuthShell title="Log in" subtitle="Welcome back">
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
      >
        <FormField label="Email" error={errors.email?.message}>
          <Input {...register("email")} type="email" autoComplete="email" />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <Input {...register("password")} type="password" autoComplete="current-password" />
        </FormField>

        <Button type="submit" loading={loginMutation.isPending} className="mt-2 w-full">
          Log in
        </Button>

        {loginMutation.isError && (
          <p role="alert" className="text-sm text-danger-500">
            {loginMutation.error.message}
          </p>
        )}
      </form>

      <div className="mt-6 flex justify-between text-sm text-neutral-500 dark:text-neutral-400">
        <Link href="/login/otp" className="hover:text-brand-500 hover:underline">
          Log in with phone OTP
        </Link>
        <Link href="/register" className="hover:text-brand-500 hover:underline">
          Create an account
        </Link>
      </div>
    </AuthShell>
  );
}
