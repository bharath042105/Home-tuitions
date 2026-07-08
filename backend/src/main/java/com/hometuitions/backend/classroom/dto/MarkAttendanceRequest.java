package com.hometuitions.backend.classroom.dto;

import com.hometuitions.backend.classroom.entity.AttendanceRecord;
import jakarta.validation.constraints.NotNull;

public record MarkAttendanceRequest(@NotNull AttendanceRecord.Status status) {
}
