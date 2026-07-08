"use client";

import { bookingStatusColor, type BookingDto } from "@hometuitions/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, Clock3, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, IconTile, Spinner } from "@/components/ui";
import { AttendancePanel } from "@/components/features/booking/AttendancePanel";
import { ChatPanel } from "@/components/features/chat/ChatPanel";
import { bookingApi } from "@/lib/api/booking";

export default function TutorBookingsPage() {
  const queryClient = useQueryClient();
  const bookingsQuery = useQuery({ queryKey: ["bookings", "me"], queryFn: bookingApi.listMine });
  const [openChatId, setOpenChatId] = useState<string | null>(null);

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "ACCEPT" | "REJECT" }) => bookingApi.respond(id, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings", "me"] }),
  });

  const bookings = bookingsQuery.data ?? [];
  const pending = bookings.filter((b) => b.status === "PENDING_TUTOR_ACTION");
  const rest = bookings.filter((b) => b.status !== "PENDING_TUTOR_ACTION");

  function toggleChat(id: string) {
    setOpenChatId((current) => (current === id ? null : id));
  }

  const quickLinks = (
    <div className="grid gap-4 sm:grid-cols-4">
      <IconTile icon={CalendarCheck} title="Bookings" description="Requests & sessions" color="brand" href="/tutor/bookings" />
      <IconTile icon={User} title="Profile" description="Your details" color="accent" href="/tutor/profile" />
      <IconTile icon={ShieldCheck} title="Verification" description="ID & documents" color="success" href="/tutor/verification" />
      <IconTile icon={Clock3} title="Availability" description="Your schedule" color="info" href="/tutor/availability" />
    </div>
  );

  if (bookingsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-8">
        {quickLinks}
        <div className="flex justify-center py-12">
          <Spinner size={28} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {quickLinks}
      <div>
        <h1 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Booking requests
        </h1>
        {pending.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No pending requests.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((booking) => (
              <Card key={booking.id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-medium text-neutral-900 dark:text-neutral-100">{booking.subject}</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {new Date(booking.startTime).toLocaleString()} · {booking.mode}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      loading={respondMutation.isPending && respondMutation.variables?.id === booking.id && respondMutation.variables.action === "ACCEPT"}
                      onClick={() => respondMutation.mutate({ id: booking.id, action: "ACCEPT" })}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={respondMutation.isPending && respondMutation.variables?.id === booking.id && respondMutation.variables.action === "REJECT"}
                      onClick={() => respondMutation.mutate({ id: booking.id, action: "REJECT" })}
                    >
                      Decline
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleChat(booking.id)}>
                      {openChatId === booking.id ? "Hide chat" : "Chat"}
                    </Button>
                  </div>
                </div>
                {openChatId === booking.id && <ChatPanel bookingId={booking.id} />}
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">My sessions</h2>
        {rest.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Nothing else yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {rest.map((booking: BookingDto) => (
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
                    <Button variant="ghost" size="sm" onClick={() => toggleChat(booking.id)}>
                      {openChatId === booking.id ? "Hide chat" : "Chat"}
                    </Button>
                  </div>
                </div>
                {booking.status === "CONFIRMED" && booking.mode === "OFFLINE" && (
                  <AttendancePanel bookingId={booking.id} />
                )}
                {openChatId === booking.id && <ChatPanel bookingId={booking.id} />}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
