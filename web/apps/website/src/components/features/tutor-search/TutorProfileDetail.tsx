"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge, Card, Spinner } from "@/components/ui";
import { studentApi } from "@/lib/api/student";
import { BookingRequestForm } from "./BookingRequestForm";

/** Shared by /student/tutors/[id] and /parent/tutors/[id] - a public tutor
 *  profile view, identical regardless of which role is looking at it except
 *  for who the booking request form asks to book on behalf of. */
export function TutorProfileDetail({
  tutorId,
  bookingRole,
}: {
  tutorId: string;
  bookingRole: "student" | "parent";
}) {
  const profileQuery = useQuery({
    queryKey: ["tutor-profile", tutorId],
    queryFn: () => studentApi.getTutorProfile(tutorId),
  });

  if (profileQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={28} />
      </div>
    );
  }

  if (!profileQuery.data) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Tutor not found.</p>;
  }

  const tutor = profileQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <Card className="max-w-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {tutor.displayName}
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {tutor.subjects.join(", ")}
            </p>
          </div>
          {tutor.verificationStatus === "VERIFIED" && <Badge color="success">Verified</Badge>}
        </div>

        {tutor.bio && (
          <p className="mt-4 text-sm text-neutral-700 dark:text-neutral-300">{tutor.bio}</p>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400">Rate</dt>
            <dd className="font-medium text-neutral-900 dark:text-neutral-100">₹{tutor.hourlyRate}/hr</dd>
          </div>
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400">Mode</dt>
            <dd className="font-medium text-neutral-900 dark:text-neutral-100">{tutor.teachingMode}</dd>
          </div>
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400">Rating</dt>
            <dd className="font-medium text-neutral-900 dark:text-neutral-100">
              ★ {tutor.avgRating.toFixed(1)} ({tutor.reviewCount})
            </dd>
          </div>
        </dl>

        {tutor.verificationStatus === "VERIFIED" ? (
          <BookingRequestForm tutor={tutor} bookingRole={bookingRole} />
        ) : (
          <p className="mt-6 text-xs text-neutral-400">
            This tutor is still pending verification and can&apos;t receive bookings yet.
          </p>
        )}
      </Card>
    </div>
  );
}
