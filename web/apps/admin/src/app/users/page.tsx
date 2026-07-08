"use client";

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
import { adminApi, type AdminUser } from "@/lib/api/admin";

const ROLE_OPTIONS = ["", "STUDENT", "PARENT", "TUTOR", "ADMIN"];

function statusColor(status: AdminUser["status"]): "success" | "warning" | "error" {
  if (status === "ACTIVE") return "success";
  if (status === "SUSPENDED") return "error";
  return "warning";
}

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState("");
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "users", roleFilter],
    queryFn: () => adminApi.listUsers(roleFilter || undefined),
  });

  const suspendMutation = useMutation({
    mutationFn: adminApi.suspendUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
  const reinstateMutation = useMutation({
    mutationFn: adminApi.reinstateUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  return (
    <>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Users
      </Typography>

      <TextField
        select
        size="small"
        label="Role"
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
        sx={{ mb: 2, width: 200 }}
      >
        {ROLE_OPTIONS.map((role) => (
          <MenuItem key={role} value={role}>
            {role || "All roles"}
          </MenuItem>
        ))}
      </TextField>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.email ?? user.phone}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Chip size="small" label={user.status.replace("_", " ")} color={statusColor(user.status)} />
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  {user.status === "SUSPENDED" ? (
                    <Button
                      size="small"
                      disabled={reinstateMutation.isPending}
                      onClick={() => reinstateMutation.mutate(user.id)}
                    >
                      Reinstate
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      color="error"
                      disabled={suspendMutation.isPending}
                      onClick={() => suspendMutation.mutate(user.id)}
                    >
                      Suspend
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: "text.secondary", py: 4 }}>
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
