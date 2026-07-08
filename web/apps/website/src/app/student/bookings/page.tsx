"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookingList } from "@/components/features/booking/BookingList";
import { Spinner } from "@/components/ui";
import { bookingApi } from "@/lib/api/booking";

export default function StudentBookingsPage() {
  const queryClient = useQueryClient();
  const bookingsQuery = useQuery({ queryKey: ["bookings", "me"], queryFn: bookingApi.listMine });

  const cancelMutation = useMutation({
    mutationFn: bookingApi.cancel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings", "me"] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">My bookings</h1>

      {bookingsQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size={28} />
        </div>
      ) : (
        <BookingList
          bookings={bookingsQuery.data ?? []}
          onCancel={(id) => cancelMutation.mutate(id)}
          cancelingId={cancelMutation.isPending ? cancelMutation.variables : undefined}
        />
      )}
    </div>
  );
}
