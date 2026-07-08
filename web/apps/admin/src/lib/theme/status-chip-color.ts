import type { ChipProps } from "@mui/material";
import type { BookingStatusColor } from "@hometuitions/shared";

/** Maps the shared semantic status color (used identically on the website's
 *  Badge component) onto MUI's Chip color enum, so both platforms agree on
 *  what each status means visually even though MUI's naming differs slightly. */
export function toChipColor(color: BookingStatusColor): ChipProps["color"] {
  switch (color) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "danger":
      return "error";
    case "info":
      return "info";
    default:
      return "default";
  }
}
