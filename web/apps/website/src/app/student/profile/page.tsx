"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { studentProfileSchema, type StudentProfileInput } from "@hometuitions/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Card, FormField, Input } from "@/components/ui";
import { studentApi } from "@/lib/api/student";

export default function StudentProfilePage() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ["student", "me"], queryFn: studentApi.getMyProfile });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentProfileInput>({ resolver: zodResolver(studentProfileSchema) });

  useEffect(() => {
    if (profileQuery.data) {
      reset({
        displayName: profileQuery.data.displayName,
        grade: profileQuery.data.grade ?? "",
        subjectsOfInterest: profileQuery.data.subjectsOfInterest ?? "",
        city: profileQuery.data.city ?? "",
      });
    }
  }, [profileQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: studentApi.updateMyProfile,
    onSuccess: (data) => queryClient.setQueryData(["student", "me"], data),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Your profile</h1>

      <Card className="max-w-lg">
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((values) => updateMutation.mutate(values))}
        >
          <FormField label="Name" error={errors.displayName?.message}>
            <Input {...register("displayName")} />
          </FormField>

          <FormField label="Grade / class" error={errors.grade?.message}>
            <Input {...register("grade")} placeholder="e.g. Grade 10" />
          </FormField>

          <FormField label="Subjects of interest" error={errors.subjectsOfInterest?.message}>
            <Input {...register("subjectsOfInterest")} placeholder="e.g. Math, Physics" />
          </FormField>

          <FormField label="City" error={errors.city?.message}>
            <Input {...register("city")} />
          </FormField>

          <Button type="submit" loading={updateMutation.isPending} className="mt-2 self-start">
            Save changes
          </Button>

          {updateMutation.isSuccess && <p className="text-sm text-success-500">Profile saved.</p>}
          {updateMutation.isError && (
            <p role="alert" className="text-sm text-danger-500">
              {updateMutation.error.message}
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
