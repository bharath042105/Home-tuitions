"use client";

import { bookingStatusColor, type BookingDto } from "@hometuitions/shared";
import { CalendarX } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { ChatPanel } from "@/components/features/chat/ChatPanel";
import { AttendancePanel } from "./AttendancePanel";
import { PayButton } from "./PayButton";

const CANCELLABLE_STATUSES: BookingDto["status"][] = ["PENDING_TUTOR_ACTION", "PENDING_PAYMENT"];

/** Shared list rendering for /student/bookings and /parent/bookings - the tutor's
 *  Booking Requests page has different actions (accept/reject) so it doesn't reuse this. */
export function BookingList({
  bookings,
  onCancel,
  cancelingId,
}: {
  bookings: BookingDto[];
  onCancel: (id: string) => void;
  cancelingId?: string;
}) {
  const [openChatId, setOpenChatId] = useState<string | null>(null);

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={CalendarX}
        title="No bookings yet"
        description="Once you request a session with a tutor, it'll show up here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((booking) => (
        <Card key={booking.id} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium text-neutral-900 dark:text-neutral-100">{booking.subject}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {new Date(booking.startTime).toLocaleString()} · {booking.mode}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge color={bookingStatusColor[booking.status] ?? "neutral"}>
                {booking.status.replace(/_/g, " ")}
              </Badge>
              {booking.status === "PENDING_PAYMENT" && <PayButton bookingId={booking.id} />}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenChatId(openChatId === booking.id ? null : booking.id)}
              >
                {openChatId === booking.id ? "Hide chat" : "Chat"}
              </Button>
              {CANCELLABLE_STATUSES.includes(booking.status) && (
                <Button
                  variant="ghost"
                  size="sm"
                  loading={cancelingId === booking.id}
                  onClick={() => onCancel(booking.id)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {booking.status === "CONFIRMED" && booking.mode === "OFFLINE" && (
            <AttendancePanel bookingId={booking.id} />
          )}
          {openChatId === booking.id && <ChatPanel bookingId={booking.id} />}
        </Card>
      ))}
    </div>
  );
}
