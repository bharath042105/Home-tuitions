"use client";

import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";

export default function VerificationsPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "verifications", "pending"],
    queryFn: adminApi.listPendingVerifications,
  });

  const decideMutation = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      adminApi.decideVerification(id, approve, approve ? undefined : "Document unclear or invalid"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "verifications", "pending"] }),
  });

  return (
    <>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Tutor Verification Queue
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Tutor</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Document type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Document</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Decision
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((doc) => (
              <TableRow key={doc.id} hover>
                <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{doc.tutorId}</TableCell>
                <TableCell>
                  <Chip size="small" label={doc.docType.replace("_", " ")} />
                </TableCell>
                <TableCell>{new Date(doc.submittedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Link href={doc.downloadUrl} target="_blank" rel="noopener noreferrer">
                    View
                  </Link>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="contained"
                      disableElevation
                      disabled={decideMutation.isPending}
                      onClick={() => decideMutation.mutate({ id: doc.id, approve: true })}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      disabled={decideMutation.isPending}
                      onClick={() => decideMutation.mutate({ id: doc.id, approve: false })}
                    >
                      Reject
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", py: 4 }}>
                  No pending verifications
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
