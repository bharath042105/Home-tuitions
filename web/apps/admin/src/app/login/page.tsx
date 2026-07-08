"use client";

import { loginSchema, type LoginInput } from "@hometuitions/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { apiClient, setTokens } from "@/lib/api/client";

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => apiClient.post<TokenResponse>("/api/v1/auth/login", input),
    onSuccess: (data) => {
      setTokens(data);
      router.replace("/dashboard");
    },
  });

  return (
    <Stack sx={{ minHeight: "100vh" }} alignItems="center" justifyContent="center">
      <Paper sx={{ p: 4, width: 360 }} variant="outlined">
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Admin sign in
        </Typography>
        <form onSubmit={handleSubmit((values) => loginMutation.mutate(values))}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Email"
              type="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Password"
              type="password"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button type="submit" variant="contained" disableElevation disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
            {loginMutation.isError && <Alert severity="error">{loginMutation.error.message}</Alert>}
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
