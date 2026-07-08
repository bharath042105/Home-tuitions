"use client";

import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PaymentsIcon from "@mui/icons-material/Payments";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import type SvgIcon from "@mui/material/SvgIcon";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { adminApi } from "@/lib/api/admin";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type StatColor = "primary" | "secondary" | "warning" | "error" | "success";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: typeof SvgIcon;
  color: StatColor;
}) {
  return (
    <Card>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: (theme) => theme.palette[color].main + "1A",
            color: `${color}.main`,
            flexShrink: 0,
          }}
        >
          <Icon fontSize="small" />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data } = useQuery({ queryKey: ["admin", "analytics"], queryFn: adminApi.getAnalytics });
  const theme = useTheme();

  const chartData = {
    labels: ["Students", "Parents", "Tutors"],
    datasets: [
      {
        label: "Users by role",
        data: [data?.totalStudents ?? 0, data?.totalParents ?? 0, data?.totalTutors ?? 0],
        backgroundColor: theme.palette.primary.main,
        borderRadius: 6,
      },
    ],
  };

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            label="Pending verifications"
            value={data?.pendingVerifications ?? "-"}
            icon={PendingActionsIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Total bookings" value={data?.totalBookings ?? "-"} icon={EventNoteIcon} color="secondary" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Open disputes" value={data?.openDisputes ?? "-"} icon={ReportProblemIcon} color="error" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label="Open tickets"
            value={data?.openTickets ?? "-"}
            icon={ConfirmationNumberIcon}
            color="warning"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label="Revenue released (₹)"
            value={data ? data.totalRevenueReleased.toLocaleString() : "-"}
            icon={PaymentsIcon}
            color="success"
          />
        </Grid>
      </Grid>

      <Card sx={{ maxWidth: 520, p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Users by role
        </Typography>
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </Card>
    </>
  );
}
