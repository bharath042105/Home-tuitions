"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminApi, type AdminTicket } from "@/lib/api/admin";

function statusColor(status: AdminTicket["status"]): "warning" | "info" | "default" {
  if (status === "OPEN") return "warning";
  if (status === "IN_PROGRESS") return "info";
  return "default";
}

export default function TicketsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const ticketsQuery = useQuery({ queryKey: ["admin", "tickets"], queryFn: () => adminApi.listTickets() });
  const messagesQuery = useQuery({
    queryKey: ["admin", "tickets", selectedId, "messages"],
    queryFn: () => adminApi.listTicketMessages(selectedId!),
    enabled: selectedId !== null,
  });

  const replyMutation = useMutation({
    mutationFn: () => adminApi.replyToTicket(selectedId!, reply),
    onSuccess: () => {
      setReply("");
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets", selectedId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => adminApi.closeTicket(selectedId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] }),
  });

  return (
    <>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Support Tickets
      </Typography>

      <Stack direction="row" spacing={2} sx={{ height: "70vh" }}>
        <Paper variant="outlined" sx={{ width: 320, overflowY: "auto" }}>
          <List disablePadding>
            {(ticketsQuery.data ?? []).map((ticket) => (
              <ListItemButton
                key={ticket.id}
                selected={selectedId === ticket.id}
                onClick={() => setSelectedId(ticket.id)}
              >
                <ListItemText
                  primary={ticket.subject}
                  secondary={new Date(ticket.createdAt).toLocaleDateString()}
                />
                <Chip size="small" label={ticket.status} color={statusColor(ticket.status)} />
              </ListItemButton>
            ))}
            {(ticketsQuery.data ?? []).length === 0 && (
              <Box sx={{ p: 2, color: "text.secondary" }}>No tickets</Box>
            )}
          </List>
        </Paper>

        <Paper variant="outlined" sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2 }}>
          {!selectedId ? (
            <Box sx={{ m: "auto", color: "text.secondary" }}>Select a ticket</Box>
          ) : (
            <>
              <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
                {(messagesQuery.data ?? []).map((message) => (
                  <Box key={message.id} sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(message.sentAt).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">{message.body}</Typography>
                  </Box>
                ))}
              </Box>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <Button
                  variant="contained"
                  disableElevation
                  disabled={!reply.trim() || replyMutation.isPending}
                  onClick={() => replyMutation.mutate()}
                >
                  Send
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  disabled={closeMutation.isPending}
                  onClick={() => closeMutation.mutate()}
                >
                  Close
                </Button>
              </Stack>
            </>
          )}
        </Paper>
      </Stack>
    </>
  );
}
