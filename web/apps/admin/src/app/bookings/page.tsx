"use client";

import { bookingStatusColor } from "@hometuitions/shared";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { toChipColor } from "@/lib/theme/status-chip-color";

const STATUS_OPTIONS = ["", "PENDING_TUTOR_ACTION", "PENDING_PAYMENT", "CONFIRMED", "COMPLETED", "DISPUTED", "CANCELLED", "REJECTED", "EXPIRED"];

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ["admin", "bookings", statusFilter],
    queryFn: () => adminApi.listBookings(statusFilter || undefined),
  });

  const disputesQuery = useQuery({ queryKey: ["admin", "disputes"], queryFn: adminApi.listOpenDisputes });

  const resolveMutation = useMutation({
    mutationFn: ({ bookingId, resolution }: { bookingId: string; resolution: "COMPLETE_AND_PAY" | "CANCEL_AND_REFUND" }) =>
      adminApi.resolveDispute(bookingId, resolution, `Resolved by admin: ${resolution}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
  });

  return (
    <>
      {disputesQuery.data && disputesQuery.data.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Open disputes
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Booking</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Resolution
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {disputesQuery.data.map((dispute) => (
                  <TableRow key={dispute.id} hover>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{dispute.bookingId}</TableCell>
                    <TableCell>{dispute.reason}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="contained"
                        disableElevation
                        sx={{ mr: 1 }}
                        disabled={resolveMutation.isPending}
                        onClick={() =>
                          resolveMutation.mutate({ bookingId: dispute.bookingId, resolution: "COMPLETE_AND_PAY" })
                        }
                      >
                        Complete & pay tutor
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        disabled={resolveMutation.isPending}
                        onClick={() =>
                          resolveMutation.mutate({ bookingId: dispute.bookingId, resolution: "CANCEL_AND_REFUND" })
                        }
                      >
                        Cancel & refund
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Typography variant="h5" fontWeight={600} gutterBottom>
        All bookings
      </Typography>

      <TextField
        select
        size="small"
        label="Status"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        sx={{ mb: 2, width: 220 }}
      >
        {STATUS_OPTIONS.map((status) => (
          <MenuItem key={status} value={status}>
            {status || "All statuses"}
          </MenuItem>
        ))}
      </TextField>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mode</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Start</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(bookingsQuery.data ?? []).map((booking) => (
              <TableRow key={booking.id} hover>
                <TableCell>{booking.subject}</TableCell>
                <TableCell>{booking.mode}</TableCell>
                <TableCell>{new Date(booking.startTime).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={booking.status.replace(/_/g, " ")}
                    color={toChipColor(bookingStatusColor[booking.status] ?? "neutral")}
                  />
                </TableCell>
              </TableRow>
            ))}
            {!bookingsQuery.isLoading && (bookingsQuery.data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ color: "text.secondary", py: 4 }}>
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
