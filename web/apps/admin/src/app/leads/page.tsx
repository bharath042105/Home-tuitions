"use client";

import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LeadStatus } from "@hometuitions/shared";
import { useState } from "react";
import { leadsApi } from "@/lib/api/leads";

const STATUS_COLOR: Record<LeadStatus, "info" | "warning" | "success"> = {
  NEW: "info",
  CONTACTED: "warning",
  CLOSED: "success",
};

function StatusActions({
  status,
  pending,
  onUpdate,
}: {
  status: LeadStatus;
  pending: boolean;
  onUpdate: (status: LeadStatus) => void;
}) {
  return (
    <Stack direction="row" spacing={1} justifyContent="flex-end">
      {status !== "CONTACTED" && status !== "CLOSED" && (
        <Button size="small" variant="outlined" disabled={pending} onClick={() => onUpdate("CONTACTED")}>
          Mark contacted
        </Button>
      )}
      {status !== "CLOSED" && (
        <Button size="small" variant="contained" disableElevation disabled={pending} onClick={() => onUpdate("CLOSED")}>
          Close
        </Button>
      )}
    </Stack>
  );
}

function TuitionInquiriesTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "leads", "tuition-inquiries"],
    queryFn: () => leadsApi.listTuitionInquiries(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      leadsApi.updateTuitionInquiryStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "leads", "tuition-inquiries"] }),
  });

  const rows = data?.content ?? [];

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Parent</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Grade / board</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Subjects</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Mode</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Mobile</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.parentName}</TableCell>
              <TableCell>{row.grade} - {row.board}</TableCell>
              <TableCell>{row.subjects.join(", ")}</TableCell>
              <TableCell>{row.tuitionMode}</TableCell>
              <TableCell>{row.mobile}</TableCell>
              <TableCell>
                <Chip size="small" color={STATUS_COLOR[row.status]} label={row.status} />
              </TableCell>
              <TableCell align="right">
                <StatusActions
                  status={row.status}
                  pending={statusMutation.isPending}
                  onUpdate={(status) => statusMutation.mutate({ id: row.id, status })}
                />
              </TableCell>
            </TableRow>
          ))}
          {!isLoading && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ color: "text.secondary", py: 4 }}>
                No tuition inquiries yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function TutorApplicationsTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "leads", "tutor-applications"],
    queryFn: () => leadsApi.listTutorApplications(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      leadsApi.updateTutorApplicationStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "leads", "tutor-applications"] }),
  });

  const rows = data?.content ?? [];

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Qualification</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Subjects</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Mode</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.qualification}</TableCell>
              <TableCell>{row.subjects.join(", ")}</TableCell>
              <TableCell>{row.mode}</TableCell>
              <TableCell>{row.mobile}</TableCell>
              <TableCell>
                <Chip size="small" color={STATUS_COLOR[row.status]} label={row.status} />
              </TableCell>
              <TableCell align="right">
                <StatusActions
                  status={row.status}
                  pending={statusMutation.isPending}
                  onUpdate={(status) => statusMutation.mutate({ id: row.id, status })}
                />
              </TableCell>
            </TableRow>
          ))}
          {!isLoading && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ color: "text.secondary", py: 4 }}>
                No tutor applications yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ContactMessagesTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "leads", "contact-messages"],
    queryFn: () => leadsApi.listContactMessages(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      leadsApi.updateContactMessageStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "leads", "contact-messages"] }),
  });

  const rows = data?.content ?? [];

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.phone}</TableCell>
              <TableCell sx={{ maxWidth: 320, whiteSpace: "normal" }}>{row.message}</TableCell>
              <TableCell>
                <Chip size="small" color={STATUS_COLOR[row.status]} label={row.status} />
              </TableCell>
              <TableCell align="right">
                <StatusActions
                  status={row.status}
                  pending={statusMutation.isPending}
                  onUpdate={(status) => statusMutation.mutate({ id: row.id, status })}
                />
              </TableCell>
            </TableRow>
          ))}
          {!isLoading && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", py: 4 }}>
                No contact messages yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function LeadsPage() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Leads
      </Typography>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab label="Tuition Inquiries" />
        <Tab label="Tutor Applications" />
        <Tab label="Contact Messages" />
      </Tabs>

      {tab === 0 && <TuitionInquiriesTab />}
      {tab === 1 && <TutorApplicationsTab />}
      {tab === 2 && <ContactMessagesTab />}
    </>
  );
}
