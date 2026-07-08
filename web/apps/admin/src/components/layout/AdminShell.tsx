"use client";

import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventNoteIcon from "@mui/icons-material/EventNote";
import GroupIcon from "@mui/icons-material/Group";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import SchoolIcon from "@mui/icons-material/School";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useColorMode } from "@/lib/theme/color-mode-context";
import { useThemePreset } from "@/lib/theme/theme-preset-context";
import { isLoggedIn, setTokens } from "@/lib/api/client";

const DRAWER_WIDTH = 220;

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/verifications", label: "Tutor Verifications", icon: VerifiedUserIcon },
  { href: "/users", label: "Users", icon: GroupIcon },
  { href: "/bookings", label: "Bookings", icon: EventNoteIcon },
  { href: "/tickets", label: "Support Tickets", icon: ConfirmationNumberIcon },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, toggle } = useColorMode();
  const { presetName, availablePresets, setPreset } = useThemePreset();

  // Minimal client-side guard: no admin session data is sensitive to briefly flash,
  // unlike the website's role-guard gap (Phases 5-12) - this one is cheap enough to
  // add now rather than defer, since every admin page needs it identically.
  useEffect(() => {
    if (pathname !== "/login" && !isLoggedIn()) {
      router.replace("/login");
    }
  }, [pathname, router]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SchoolIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Home Tuitions Admin
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Select
              size="small"
              value={presetName}
              onChange={(e) => setPreset(e.target.value)}
              sx={{ minWidth: 140 }}
              aria-label="Theme preset"
            >
              {availablePresets.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
            <IconButton onClick={toggle} aria-label="Toggle color mode">
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton
              aria-label="Log out"
              onClick={() => {
                setTokens(null);
                router.replace("/login");
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <List sx={{ px: 1.5 }}>
          {NAV_ITEMS.map((item) => {
            const selected = pathname?.startsWith(item.href);
            return (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                selected={selected}
                sx={{
                  borderRadius: 999,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                    "&:hover": { bgcolor: "primary.dark" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <item.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
