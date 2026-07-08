"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { parentProfileSchema, type ParentProfileInput } from "@hometuitions/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Card, FormField, Input } from "@/components/ui";
import { parentApi } from "@/lib/api/parent";

export default function ParentProfilePage() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ["parent", "me"], queryFn: parentApi.getMyProfile });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ParentProfileInput>({ resolver: zodResolver(parentProfileSchema) });

  useEffect(() => {
    if (profileQuery.data) {
      reset({ displayName: profileQuery.data.displayName });
    }
  }, [profileQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: parentApi.updateMyProfile,
    onSuccess: (data) => queryClient.setQueryData(["parent", "me"], data),
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
