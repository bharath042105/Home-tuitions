"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui";
import { paymentApi } from "@/lib/api/payment";
import { openRazorpayCheckout } from "@/lib/api/razorpay-checkout";

/**
 * Opens Razorpay Checkout for a PENDING_PAYMENT booking. The Checkout `handler`
 * callback firing does NOT mean the booking is confirmed - that only happens once
 * the backend's webhook processes payment.captured (docs/phase2/02-high-level-design.md
 *  2.4), which can lag the client-side callback by a few seconds. So this shows a
 * "waiting for confirmation" state and just invalidates the bookings query - it does
 * not optimistically mark anything as paid itself.
 */
export function PayButton({ bookingId }: { bookingId: string }) {
  const queryClient = useQueryClient();
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const payMutation = useMutation({
    mutationFn: async () => {
      const order = await paymentApi.getOrder(bookingId);
      await openRazorpayCheckout({
        key: order.razorpayKeyId,
        order_id: order.razorpayOrderId,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        name: "Home Tuitions",
        description: "Tutoring session payment",
        handler: () => {
          setAwaitingConfirmation(true);
          queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
        },
      });
    },
  });

  if (awaitingConfirmation) {
    return <p className="text-sm text-info-500">Payment received - confirming...</p>;
  }

  return (
    <Button size="sm" loading={payMutation.isPending} onClick={() => payMutation.mutate()}>
      Pay now
    </Button>
  );
}
