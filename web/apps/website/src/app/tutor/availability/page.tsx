"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { availabilityRuleSchema, type AvailabilityRuleInput } from "@hometuitions/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button, Card, FormField, Input } from "@/components/ui";
import { tutorApi } from "@/lib/api/tutor";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AvailabilityPage() {
  const queryClient = useQueryClient();
  const availabilityQuery = useQuery({ queryKey: ["tutor", "availability"], queryFn: tutorApi.listAvailability });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AvailabilityRuleInput>({
    resolver: zodResolver(availabilityRuleSchema),
    defaultValues: { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
  });

  const addMutation = useMutation({
    mutationFn: tutorApi.addAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutor", "availability"] });
      reset();
    },
  });

  const removeMutation = useMutation({
    mutationFn: tutorApi.removeAvailability,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tutor", "availability"] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Availability</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Add the weekly time windows you&apos;re available to teach. Students can only
        request bookings inside these windows.
      </p>

      <Card>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={handleSubmit((values) => addMutation.mutate(values))}
        >
          <FormField label="Day">
            <select
              {...register("dayOfWeek")}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              {DAY_LABELS.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Start" error={errors.startTime?.message}>
            <Input {...register("startTime")} type="time" className="w-32" />
          </FormField>

          <FormField label="End" error={errors.endTime?.message}>
            <Input {...register("endTime")} type="time" className="w-32" />
          </FormField>

          <Button type="submit" loading={addMutation.isPending}>
            Add
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-2">
        {(availabilityQuery.data ?? []).map((rule) => (
          <Card key={rule.id} className="flex items-center justify-between py-3">
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              {DAY_LABELS[rule.dayOfWeek]} · {rule.startTime}–{rule.endTime}
            </span>
            <Button
              variant="ghost"
              size="sm"
              loading={removeMutation.isPending && removeMutation.variables === rule.id}
              onClick={() => removeMutation.mutate(rule.id)}
            >
              Remove
            </Button>
          </Card>
        ))}
        {availabilityQuery.data?.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No availability set yet.</p>
        )}
      </div>
    </div>
  );
}
