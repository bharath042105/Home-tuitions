"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Spinner } from "@/components/ui";
import { attendanceApi } from "@/lib/api/attendance";
import { getCurrentUserId } from "@/lib/api/client";

/**
 * Shown for CONFIRMED offline bookings (SRS FR-6). Each side marks independently;
 * once both sides have marked, the backend reconciles automatically (complete/cancel/
 * dispute) - this panel just reflects whatever the caller has/hasn't marked yet.
 */
export function AttendancePanel({ bookingId }: { bookingId: string }) {
  const queryClient = useQueryClient();
  const currentUserId = getCurrentUserId();

  const recordsQuery = useQuery({
    queryKey: ["attendance", bookingId],
    queryFn: () => attendanceApi.list(bookingId),
  });

  const markMutation = useMutation({
    mutationFn: (status: "PRESENT" | "ABSENT") => attendanceApi.mark(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
    },
  });

  if (recordsQuery.isLoading) {
    return (
      <div className="flex justify-center py-3">
        <Spinner size={18} />
      </div>
    );
  }

  const myMark = recordsQuery.data?.find((r) => r.markedBy === currentUserId);

  return (
    <div className="flex items-center gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
      <span className="text-sm text-neutral-600 dark:text-neutral-400">
        Did this session happen?
      </span>
      {myMark ? (
        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          You marked: {myMark.status}
        </span>
      ) : (
        <div className="flex gap-2">
          <Button
            size="sm"
            loading={markMutation.isPending && markMutation.variables === "PRESENT"}
            onClick={() => markMutation.mutate("PRESENT")}
          >
            Yes, it happened
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={markMutation.isPending && markMutation.variables === "ABSENT"}
            onClick={() => markMutation.mutate("ABSENT")}
          >
            No, it didn&apos;t
          </Button>
        </div>
      )}
    </div>
  );
}
