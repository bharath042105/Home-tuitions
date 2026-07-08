"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type StudentProfileDto, type TutorProfileDto } from "@hometuitions/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, FormField, Input } from "@/components/ui";
import { bookingApi } from "@/lib/api/booking";
import { parentApi } from "@/lib/api/parent";

// Form-level schema, deliberately looser than the shared createBookingSchema:
// <input type="datetime-local"> produces "YYYY-MM-DDTHH:mm" with no timezone offset,
// which fails createBookingSchema's strict ISO-with-offset check. That check is correct
// for the wire payload sent to the backend - here it's only the intermediate widget
// value, converted to a real ISO string (with offset) in the mutation below.
const bookingFormSchema = z.object({
  subject: z.string().min(1, "Required"),
  startTime: z.string().min(1, "Required"),
  mode: z.enum(["ONLINE", "OFFLINE"]),
});
type BookingFormValues = z.infer<typeof bookingFormSchema>;

const DURATION_OPTIONS = [
  { minutes: 30, label: "30 minutes" },
  { minutes: 60, label: "1 hour" },
  { minutes: 90, label: "1.5 hours" },
];

/**
 * Booking request form embedded in the tutor detail page. Students book for
 * themselves directly; parents must pick which linked child the session is
 * for first (Phase 1 IA: "Search tutors (on behalf of child)").
 */
export function BookingRequestForm({
  tutor,
  bookingRole,
}: {
  tutor: TutorProfileDto;
  bookingRole: "student" | "parent";
}) {
  const [submitted, setSubmitted] = useState(false);
  const [duration, setDuration] = useState(60);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const childrenQuery = useQuery({
    queryKey: ["parent", "children"],
    queryFn: parentApi.listChildren,
    enabled: bookingRole === "parent",
  });

  const modeOptions =
    tutor.teachingMode === "BOTH" ? (["ONLINE", "OFFLINE"] as const) : ([tutor.teachingMode] as const);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { mode: modeOptions[0] },
  });

  const startTimeValue = watch("startTime");

  const createMutation = useMutation({
    mutationFn: (values: BookingFormValues) => {
      const start = new Date(values.startTime); // interpreted in the browser's local timezone
      const end = new Date(start.getTime() + duration * 60_000);
      return bookingApi.create({
        subject: values.subject,
        mode: values.mode,
        tutorId: tutor.id,
        studentProfileId: bookingRole === "parent" ? selectedChildId! : undefined,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
    },
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <p className="mt-6 text-sm text-success-500">
        Booking request sent - {tutor.displayName} has 24 hours to respond.
      </p>
    );
  }

  const children = childrenQuery.data ?? [];
  const readyToBook = bookingRole === "student" || selectedChildId !== null;

  return (
    <form
      className="mt-6 flex flex-col gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-800"
      onSubmit={handleSubmit((values) => createMutation.mutate(values))}
    >
      <h2 className="font-medium text-neutral-900 dark:text-neutral-100">Request a booking</h2>

      {bookingRole === "parent" && (
        <div>
          <FormField label="Which child is this for?">
            <select
              value={selectedChildId ?? ""}
              onChange={(e) => setSelectedChildId(e.target.value || null)}
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              <option value="">Select a child</option>
              {children.map((child: StudentProfileDto) => (
                <option key={child.id} value={child.id}>
                  {child.displayName}
                </option>
              ))}
            </select>
          </FormField>
          {children.length === 0 && (
            <p className="mt-1 text-xs text-neutral-400">
              Add a child on the Children page first.
            </p>
          )}
        </div>
      )}

      <FormField label="Subject" error={errors.subject?.message}>
        <Input {...register("subject")} placeholder="e.g. Algebra" />
      </FormField>

      <FormField label="Start time" error={errors.startTime?.message}>
        <Input {...register("startTime")} type="datetime-local" />
      </FormField>

      <FormField label="Duration">
        <select
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        >
          {DURATION_OPTIONS.map((option) => (
            <option key={option.minutes} value={option.minutes}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      {modeOptions.length > 1 && (
        <FormField label="Mode" error={errors.mode?.message}>
          <select
            {...register("mode")}
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          >
            {modeOptions.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </FormField>
      )}

      <Button type="submit" loading={createMutation.isPending} disabled={!readyToBook || !startTimeValue}>
        Send booking request
      </Button>

      {createMutation.isError && (
        <p role="alert" className="text-sm text-danger-500">
          {createMutation.error.message}
        </p>
      )}
    </form>
  );
}
