"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@hometuitions/shared";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/features/auth/AuthShell";
import { Button, FormField, Input } from "@/components/ui";
import { apiClient } from "@/lib/api/client";

const ROLE_OPTIONS: { value: RegisterInput["role"]; label: string }[] = [
  { value: "STUDENT", label: "I'm a student" },
  { value: "PARENT", label: "I'm a parent" },
  { value: "TUTOR", label: "I'm a tutor" },
];

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "STUDENT" },
  });

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => apiClient.post<void>("/api/v1/auth/register", input),
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <AuthShell title="Check your email">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          We&apos;ve sent a verification link to confirm your account.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm text-brand-500 hover:underline">
          Back to login
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create your account">
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((values) => registerMutation.mutate(values))}
      >
        <FormField label="I am a...">
          <select
            {...register("role")}
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <Input {...register("email")} type="email" autoComplete="email" />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <Input {...register("password")} type="password" autoComplete="new-password" />
        </FormField>

        <Button type="submit" loading={registerMutation.isPending} className="mt-2 w-full">
          Create account
        </Button>

        {registerMutation.isError && (
          <p role="alert" className="text-sm text-danger-500">
            {registerMutation.error.message}
          </p>
        )}
      </form>

      <Link
        href="/login"
        className="mt-6 inline-block text-sm text-neutral-500 hover:text-brand-500 hover:underline dark:text-neutral-400"
      >
        Already have an account? Log in
      </Link>
    </AuthShell>
  );
}
