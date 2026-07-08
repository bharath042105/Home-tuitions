"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { tutorProfileSchema, type TutorProfileInput } from "@hometuitions/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Badge, Button, Card, FormField, Input, Stepper } from "@/components/ui";
import { tutorApi } from "@/lib/api/tutor";

const MODE_OPTIONS = [
  { value: "ONLINE", label: "Online only" },
  { value: "OFFLINE", label: "In-person only" },
  { value: "BOTH", label: "Both" },
];

const STEPS = ["Basic info", "Subjects & rate", "Teaching mode"];

export default function TutorProfilePage() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ["tutor", "me"], queryFn: tutorApi.getMyProfile });
  const [step, setStep] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TutorProfileInput>({ resolver: zodResolver(tutorProfileSchema) });

  const subjects = watch("subjects") ?? [];

  useEffect(() => {
    if (profileQuery.data) {
      reset({
        displayName: profileQuery.data.displayName,
        bio: profileQuery.data.bio ?? "",
        subjects: profileQuery.data.subjects,
        hourlyRate: profileQuery.data.hourlyRate,
        teachingMode: profileQuery.data.teachingMode,
        serviceRadiusKm: profileQuery.data.serviceRadiusKm,
      });
    }
  }, [profileQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: tutorApi.updateMyProfile,
    onSuccess: (data) => queryClient.setQueryData(["tutor", "me"], data),
  });

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Your profile</h1>
        {profileQuery.data && (
          <Badge color={profileQuery.data.verificationStatus === "VERIFIED" ? "success" : "warning"}>
            {profileQuery.data.verificationStatus.replace("_", " ")}
          </Badge>
        )}
      </div>

      <Card>
        <Stepper steps={STEPS} activeIndex={step} className="mb-6" />

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((values) => updateMutation.mutate(values))}
        >
          {step === 0 && (
            <>
              <FormField label="Display name" error={errors.displayName?.message}>
                <Input {...register("displayName")} />
              </FormField>

              <FormField label="Bio" error={errors.bio?.message}>
                <textarea
                  {...register("bio")}
                  rows={4}
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </FormField>
            </>
          )}

          {step === 1 && (
            <>
              <FormField label="Subjects (comma-separated)" error={errors.subjects?.message as string | undefined}>
                <Input
                  key={subjects.join(",")}
                  defaultValue={subjects.join(", ")}
                  onBlur={(e) =>
                    setValue(
                      "subjects",
                      e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      { shouldValidate: true },
                    )
                  }
                />
              </FormField>

              <FormField label="Hourly rate (INR)" error={errors.hourlyRate?.message}>
                <Input {...register("hourlyRate")} type="number" min={0} step="1" />
              </FormField>
            </>
          )}

          {step === 2 && (
            <>
              <FormField label="Teaching mode" error={errors.teachingMode?.message}>
                <select
                  {...register("teachingMode")}
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  {MODE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Service radius (km, for offline tuition)" error={errors.serviceRadiusKm?.message}>
                <Input {...register("serviceRadiusKm")} type="number" min={1} />
              </FormField>
            </>
          )}

          <div className="mt-2 flex items-center gap-2">
            {step > 0 && (
              <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            {!isLastStep && (
              <Button type="button" onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}>
                Next
              </Button>
            )}
            {isLastStep && (
              <Button type="submit" loading={updateMutation.isPending}>
                Save changes
              </Button>
            )}
          </div>

          {updateMutation.isSuccess && (
            <p className="text-sm text-success-500">Profile saved.</p>
          )}
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
